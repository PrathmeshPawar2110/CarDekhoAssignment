import json
import asyncio
import hashlib
import time

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.models import RecommendRequest
from agents.car_advisor.graph import build_graph, GRAPH_NODES

router = APIRouter()

# In-memory cache: cache_key -> {timestamp, trace, recommendations}
_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes


def _cache_key(request: RecommendRequest) -> str:
    prefs = request.preferences.model_dump()
    # Sort to ensure consistent hashing regardless of dict order
    canonical = json.dumps(prefs, sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()


def _evict_expired() -> None:
    now = time.time()
    expired = [k for k, v in _cache.items() if now - v["timestamp"] > CACHE_TTL_SECONDS]
    for k in expired:
        del _cache[k]


@router.post("/api/recommend")
async def recommend(request: RecommendRequest):
    """
    SSE endpoint — streams trace events and final result.
    Caches successful results for 10 minutes keyed by preferences hash.
    """
    key = _cache_key(request)
    req_id = request.request_id or "unknown"
    _evict_expired()

    # ── Cache hit: replay stored events ────────────────────────────────────
    if key in _cache:
        cached = _cache[key]

        async def cached_stream():
            hit_trace = {"type": "trace", "node": "cache", "status": "done",
                         "timestamp": cached["trace"][0]["timestamp"] if cached["trace"] else "",
                         "detail": f"Serving cached result (request_id={req_id})"}
            yield f"data: {json.dumps(hit_trace)}\n\n"
            for t in cached["trace"]:
                payload = json.dumps({"type": "trace", **t})
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)
            result_payload = json.dumps({"type": "result", "recommendations": cached["recommendations"]})
            yield f"data: {result_payload}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            cached_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # ── Cache miss: run pipeline ────────────────────────────────────────────
    async def event_stream():
        graph = build_graph()
        initial_state = {
            "preferences": request.preferences,
            "search_queries": [],
            "search_results": [],
            "car_candidates": [],
            "recommendations": [],
            "trace": [],
            "error": None,
        }

        final_state = None
        seen_nodes: set[str] = set()
        emitted_trace: list[dict] = []

        try:
            async for event in graph.astream_events(initial_state, version="v2"):
                event_type = event.get("event", "")
                event_name = event.get("name", "")

                if event_type == "on_chain_end" and event_name in GRAPH_NODES:
                    if event_name not in seen_nodes:
                        seen_nodes.add(event_name)
                        output = event.get("data", {}).get("output", {})
                        trace_list: list[dict] = output.get("trace", [])
                        matching = next(
                            (t for t in reversed(trace_list) if t.get("node") == event_name),
                            None,
                        )
                        if matching:
                            emitted_trace.append(matching)
                            payload = json.dumps({"type": "trace", **matching})
                            yield f"data: {payload}\n\n"
                            await asyncio.sleep(0.15)

                        if event_name == "format_response":
                            final_state = output

            if final_state:
                recs = final_state.get("recommendations", [])
                serialized_recs = []
                for r in recs:
                    if hasattr(r, "model_dump"):
                        serialized_recs.append(r.model_dump())
                    elif isinstance(r, dict):
                        serialized_recs.append(r)
                    else:
                        serialized_recs.append(dict(r))

                # Store in cache only on full success
                _cache[key] = {
                    "timestamp": time.time(),
                    "trace": emitted_trace,
                    "recommendations": serialized_recs,
                }

                result_payload = json.dumps({"type": "result", "recommendations": serialized_recs})
                yield f"data: {result_payload}\n\n"

        except Exception as exc:
            error_payload = json.dumps({"type": "error", "message": str(exc)})
            yield f"data: {error_payload}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
