from langgraph.graph import StateGraph, END

from .state import AgentState
from .nodes import (
    parse_preferences,
    search_web,
    extract_cars,
    fetch_car_specs,
    enrich_from_local,
    generate_reasoning,
    format_response,
)

GRAPH_NODES = [
    "parse_preferences",
    "search_web",
    "extract_cars",
    "fetch_car_specs",
    "enrich_from_local",
    "generate_reasoning",
    "format_response",
]


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("parse_preferences", parse_preferences)
    graph.add_node("search_web", search_web)
    graph.add_node("extract_cars", extract_cars)
    graph.add_node("fetch_car_specs", fetch_car_specs)
    graph.add_node("enrich_from_local", enrich_from_local)
    graph.add_node("generate_reasoning", generate_reasoning)
    graph.add_node("format_response", format_response)

    graph.set_entry_point("parse_preferences")
    graph.add_edge("parse_preferences", "search_web")
    graph.add_edge("search_web", "extract_cars")
    graph.add_edge("extract_cars", "fetch_car_specs")
    graph.add_edge("fetch_car_specs", "enrich_from_local")
    graph.add_edge("enrich_from_local", "generate_reasoning")
    graph.add_edge("generate_reasoning", "format_response")
    graph.add_edge("format_response", END)

    return graph.compile()
