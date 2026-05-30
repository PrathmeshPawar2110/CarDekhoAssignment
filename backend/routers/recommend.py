import json
import asyncio

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.models import RecommendRequest
from agents.car_advisor.graph import build_graph, GRAPH_NODES

router = APIRouter()


@router.post("/api/recommend")
async def recommend(request: RecommendRequest):
    """
    SSE endpoint — streams trace events and final result.
    Each node completion is sent as a trace event, then final result, then [DONE].
    """

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

        try:
            async for event in graph.astream_events(initial_state, version="v2"):
                event_type = event.get("event", "")
                event_name = event.get("name", "")

                # Capture node completion events
                if event_type == "on_chain_end" and event_name in GRAPH_NODES:
                    if event_name not in seen_nodes:
                        seen_nodes.add(event_name)
                        output = event.get("data", {}).get("output", {})
                        trace_list: list[dict] = output.get("trace", [])
                        # Find the trace entry matching this node
                        matching = next(
                            (t for t in reversed(trace_list) if t.get("node") == event_name),
                            None,
                        )
                        if matching:
                            payload = json.dumps({"type": "trace", **matching})
                            yield f"data: {payload}\n\n"
                            await asyncio.sleep(0.15)  # pacing for UI effect

                        # Capture final state after last node
                        if event_name == "format_response":
                            final_state = output

            # Emit final result
            if final_state:
                recs = final_state.get("recommendations", [])
                # Serialize — CarRecommendation objects may not be JSON-serializable directly
                serialized_recs = []
                for r in recs:
                    if hasattr(r, "model_dump"):
                        serialized_recs.append(r.model_dump())
                    elif isinstance(r, dict):
                        serialized_recs.append(r)
                    else:
                        serialized_recs.append(dict(r))

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
