import json
import httpx
from datetime import datetime, timezone

from langchain_openai import AzureChatOpenAI

from .state import AgentState, CarRecommendation, UserPreferences
from .prompts import EXTRACT_CARS_PROMPT, REASONING_PROMPT


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _trace_entry(node: str, status: str, detail: str) -> dict:
    return {"node": node, "status": status, "timestamp": _now_iso(), "detail": detail}


# Country metadata: name, currency symbol, budget unit, Serper gl code
COUNTRY_META: dict[str, dict] = {
    "IN": {"name": "India",     "currency": "₹",    "unit": "lakh",  "gl": "in"},
    "US": {"name": "USA",       "currency": "$",    "unit": "K",     "gl": "us"},
    "GB": {"name": "UK",        "currency": "£",    "unit": "K",     "gl": "gb"},
    "AE": {"name": "UAE",       "currency": "AED",  "unit": "K",     "gl": "ae"},
    "DE": {"name": "Germany",   "currency": "€",    "unit": "K",     "gl": "de"},
    "AU": {"name": "Australia", "currency": "A$",   "unit": "K",     "gl": "au"},
    "CA": {"name": "Canada",    "currency": "C$",   "unit": "K",     "gl": "ca"},
    "SG": {"name": "Singapore", "currency": "S$",   "unit": "K",     "gl": "sg"},
}


def _format_budget(budget_min: float, budget_max: float, country_code: str) -> str:
    meta = COUNTRY_META.get(country_code, COUNTRY_META["IN"])
    curr = meta["currency"]
    if meta["unit"] == "lakh":
        return f"{curr}{budget_min:.0f}L–{curr}{budget_max:.0f}L"
    return f"{curr}{budget_min:.0f}K–{curr}{budget_max:.0f}K"


def _build_search_queries(prefs: UserPreferences) -> list[str]:
    meta = COUNTRY_META.get(prefs.country, COUNTRY_META["IN"])
    country_name = meta["name"]
    budget_str = _format_budget(prefs.budget_min, prefs.budget_max, prefs.country)
    fuel_str = prefs.fuel_preference if prefs.fuel_preference != "any" else ""
    use_str = " ".join(prefs.use_cases[:2])

    return [
        f"best {fuel_str} cars in {country_name} {budget_str} 2024 2025 review".strip(),
        f"top car recommendations {country_name} budget {budget_str} {use_str}".strip(),
        f"new cars {country_name} {budget_str} {fuel_str} price specs mileage".strip(),
    ]


def parse_preferences(state: AgentState) -> AgentState:
    """Validate preferences and build Serper search queries."""
    prefs: UserPreferences = state["preferences"]
    queries = _build_search_queries(prefs)
    meta = COUNTRY_META.get(prefs.country, COUNTRY_META["IN"])

    trace = list(state.get("trace", []))
    trace.append(_trace_entry(
        "parse_preferences", "done",
        f"Built {len(queries)} queries for {meta['name']} market"
    ))
    return {**state, "search_queries": queries, "search_results": [], "car_candidates": [], "trace": trace}


async def search_web(state: AgentState) -> AgentState:
    """Call Serper.dev API for each query and collect organic results."""
    from config import settings

    queries: list[str] = state["search_queries"]
    prefs: UserPreferences = state["preferences"]
    meta = COUNTRY_META.get(prefs.country, COUNTRY_META["IN"])

    all_results: list[dict] = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        for query in queries:
            try:
                resp = await client.post(
                    "https://google.serper.dev/search",
                    headers={
                        "X-API-KEY": settings.SERPER_API_KEY,
                        "Content-Type": "application/json",
                    },
                    json={"q": query, "num": 8, "gl": meta["gl"], "hl": "en"},
                )
                resp.raise_for_status()
                data = resp.json()

                for item in data.get("organic", []):
                    all_results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "link": item.get("link", ""),
                    })

                # Answer box often has structured car info
                ab = data.get("answerBox")
                if ab:
                    all_results.append({
                        "title": ab.get("title", "Featured"),
                        "snippet": ab.get("answer", ab.get("snippet", "")),
                        "link": ab.get("link", ""),
                    })

            except Exception as e:
                # Non-fatal — note it and continue
                all_results.append({"title": "search_error", "snippet": str(e), "link": ""})

    trace = list(state.get("trace", []))
    trace.append(_trace_entry(
        "search_web", "done",
        f"Retrieved {len(all_results)} results across {len(queries)} queries"
    ))
    return {**state, "search_results": all_results, "trace": trace}


async def extract_cars(state: AgentState) -> AgentState:
    """Use GPT-4o to extract structured car candidates from raw search snippets."""
    from config import settings

    results: list[dict] = state["search_results"]
    prefs: UserPreferences = state["preferences"]
    meta = COUNTRY_META.get(prefs.country, COUNTRY_META["IN"])

    # Filter out error entries
    valid = [r for r in results if r.get("title") != "search_error" and r.get("snippet")]

    if not valid:
        trace = list(state.get("trace", []))
        trace.append(_trace_entry("extract_cars", "done", "No valid search results to extract from"))
        return {**state, "car_candidates": [], "trace": trace}

    llm = AzureChatOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_API_KEY,
        azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        temperature=0.1,
        max_tokens=3000,
    )

    snippets_text = "\n\n".join(
        f"[{i+1}] {r['title']}\n{r['snippet']}"
        for i, r in enumerate(valid[:20])
    )

    budget_str = _format_budget(prefs.budget_min, prefs.budget_max, prefs.country)
    preferences_context = (
        f"Country: {meta['name']}\n"
        f"Budget: {budget_str}\n"
        f"Fuel preference: {prefs.fuel_preference}\n"
        f"Use cases: {', '.join(prefs.use_cases) if prefs.use_cases else 'general'}"
    )

    chain = EXTRACT_CARS_PROMPT | llm
    response = chain.invoke({
        "search_snippets": snippets_text,
        "preferences": preferences_context,
        "country": meta["name"],
        "currency": meta["currency"],
        "budget_unit": meta["unit"],
    })

    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        car_candidates: list[dict] = json.loads(raw)
    except json.JSONDecodeError:
        car_candidates = []

    trace = list(state.get("trace", []))
    trace.append(_trace_entry("extract_cars", "done", f"Extracted {len(car_candidates)} car candidates"))
    return {**state, "car_candidates": car_candidates, "trace": trace}


async def generate_reasoning(state: AgentState) -> AgentState:
    """Rank candidates and generate personalized reasoning for top 5."""
    from config import settings

    candidates: list[dict] = state["car_candidates"]
    prefs: UserPreferences = state["preferences"]
    meta = COUNTRY_META.get(prefs.country, COUNTRY_META["IN"])

    if not candidates:
        trace = list(state.get("trace", []))
        trace.append(_trace_entry("generate_reasoning", "done", "No candidates to rank"))
        return {**state, "recommendations": [], "trace": trace}

    llm = AzureChatOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_API_KEY,
        azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        temperature=0.3,
        max_tokens=2500,
    )

    budget_str = _format_budget(prefs.budget_min, prefs.budget_max, prefs.country)
    preferences_str = json.dumps({
        "country": meta["name"],
        "budget": budget_str,
        "fuel_preference": prefs.fuel_preference,
        "use_cases": prefs.use_cases,
        "priorities": prefs.priorities,
    }, indent=2)
    candidates_str = json.dumps(candidates[:12], indent=2)

    chain = REASONING_PROMPT | llm
    response = chain.invoke({"preferences": preferences_str, "candidates": candidates_str})

    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        llm_results: list[dict] = json.loads(raw)
    except json.JSONDecodeError:
        llm_results = []

    candidates_by_id = {c.get("car_id", c.get("id", "")): c for c in candidates}

    recommendations: list[CarRecommendation] = []
    for item in llm_results[:5]:
        car_id = item.get("car_id", "")
        specs = candidates_by_id.get(car_id, {})
        recommendations.append(CarRecommendation(
            car_id=car_id,
            match_score=int(item.get("match_score", 75)),
            why_this_fits=item.get("why_this_fits", ""),
            highlight=item.get("highlight", ""),
            specs=specs,
        ))

    trace = list(state.get("trace", []))
    trace.append(_trace_entry("generate_reasoning", "done", f"Ranked {len(recommendations)} cars"))
    return {**state, "recommendations": recommendations, "trace": trace}


def format_response(state: AgentState) -> AgentState:
    """Final cleanup — mark trace complete."""
    trace = list(state.get("trace", []))
    trace.append(_trace_entry("format_response", "done", "Response ready"))
    return {**state, "trace": trace}
