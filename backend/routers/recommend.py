import json
import asyncio
import hashlib
import time
import copy

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.models import RecommendRequest
from agents.car_advisor.graph import build_graph, GRAPH_NODES

router = APIRouter()

# In-memory cache: cache_key -> {timestamp, trace, recommendations, is_fallback}
_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes


def _cache_key(request: RecommendRequest) -> str:
    prefs = request.preferences.model_dump()
    canonical = json.dumps(prefs, sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()


def _evict_expired() -> None:
    now = time.time()
    expired = [k for k, v in _cache.items() if now - v["timestamp"] > CACHE_TTL_SECONDS]
    for k in expired:
        del _cache[k]


def _loosen_preferences(request: RecommendRequest) -> RecommendRequest:
    """Return a copy of the request with relaxed constraints for fallback search."""
    loose = copy.deepcopy(request)
    loose.preferences.budget_min = max(0, loose.preferences.budget_min * 0.7)
    loose.preferences.budget_max = loose.preferences.budget_max * 1.3
    loose.preferences.fuel_preference = "any"
    return loose


async def _run_pipeline(
    request: RecommendRequest,
    graph,
    seen_offset: set[str] | None = None,
) -> tuple[list[dict], list[dict]]:
    """
    Run the LangGraph pipeline and return (emitted_trace, serialized_recs).
    seen_offset is used to skip re-emitting nodes already yielded.
    """
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
                if event_name == "format_response":
                    final_state = output

    serialized_recs: list[dict] = []
    if final_state:
        for r in final_state.get("recommendations", []):
            if hasattr(r, "model_dump"):
                serialized_recs.append(r.model_dump())
            elif isinstance(r, dict):
                serialized_recs.append(r)
            else:
                serialized_recs.append(dict(r))

    return emitted_trace, serialized_recs


@router.post("/api/recommend")
async def recommend(request: RecommendRequest):
    """
    SSE endpoint — streams trace events and final result.
    If pipeline returns 0 results, retries with loosened criteria and marks is_fallback=True.
    """
    key = _cache_key(request)
    req_id = request.request_id or "unknown"
    _evict_expired()

    # ── Cache hit ────────────────────────────────────────────────────────────
    if key in _cache:
        cached = _cache[key]

        async def cached_stream():
            hit_trace = {
                "type": "trace", "node": "cache", "status": "done",
                "timestamp": cached["trace"][0]["timestamp"] if cached["trace"] else "",
                "detail": f"Serving cached result (request_id={req_id})",
            }
            yield f"data: {json.dumps(hit_trace)}\n\n"
            for t in cached["trace"]:
                payload = json.dumps({"type": "trace", **t})
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)
            result_payload = json.dumps({
                "type": "result",
                "recommendations": cached["recommendations"],
                "is_fallback": cached.get("is_fallback", False),
            })
            yield f"data: {result_payload}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            cached_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # ── Cache miss: run pipeline ─────────────────────────────────────────────
    async def event_stream():
        graph = build_graph()
        is_fallback = False

        try:
            # First attempt — strict criteria
            emitted_trace, serialized_recs = await _run_pipeline(request, graph)

            for t in emitted_trace:
                payload = json.dumps({"type": "trace", **t})
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.15)

            # No results → retry with loose criteria
            if not serialized_recs:
                fallback_notice = {
                    "type": "trace", "node": "fallback_search", "status": "done",
                    "timestamp": emitted_trace[-1]["timestamp"] if emitted_trace else "",
                    "detail": "No exact match — retrying with wider budget & any fuel type",
                }
                yield f"data: {json.dumps(fallback_notice)}\n\n"
                await asyncio.sleep(0.15)

                loose_request = _loosen_preferences(request)
                fallback_trace, serialized_recs = await _run_pipeline(loose_request, graph)
                is_fallback = True

                for t in fallback_trace:
                    t_copy = {**t, "node": f"fallback_{t['node']}"}
                    payload = json.dumps({"type": "trace", **t_copy})
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0.1)

                emitted_trace = emitted_trace + [fallback_notice] + fallback_trace

            # Cache successful result
            if serialized_recs:
                _cache[key] = {
                    "timestamp": time.time(),
                    "trace": emitted_trace,
                    "recommendations": serialized_recs,
                    "is_fallback": is_fallback,
                }

            result_payload = json.dumps({
                "type": "result",
                "recommendations": serialized_recs,
                "is_fallback": is_fallback,
            })
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
