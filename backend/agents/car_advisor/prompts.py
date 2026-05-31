from langchain_core.prompts import ChatPromptTemplate

# ── Prompt 1: Extract structured car data from raw search snippets ──────────

EXTRACT_CARS_SYSTEM = """You are a car data extraction expert. \
Given web search result snippets about cars, extract a structured list of real car models \
that match the user's budget and preferences for their country. \
Return ONLY a valid JSON array, no markdown, no explanation outside JSON."""

EXTRACT_CARS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", EXTRACT_CARS_SYSTEM),
    ("human", """User Preferences:
{preferences}

Search Result Snippets:
{search_snippets}

Extract car models from the search results that fit within the user's budget and country ({country}).

For each car, return a JSON object with:
- car_id: string (slugified, e.g. "toyota-camry-hybrid-2025")
- make: string
- model: string
- variant: string (trim name if known, else "Standard")
- year: integer (2023, 2024, or 2025)
- price: number (in {currency}, expressed in {budget_unit}s — e.g. if budget_unit is "K", price 35 means {currency}35,000; if "lakh", price 12 means {currency}12 lakh)
- price_display: string (human-readable, e.g. "₹12L" or "$35,000" or "AED 150K")
- fuel_type: string (one of: petrol/diesel/hybrid/electric/cng)
- body_type: string (one of: sedan/suv/hatchback/mpv/coupe/pickup/crossover)
- mileage_kmpl: number or null (fuel efficiency in km/l; 0 for EVs)
- range_km: number or null (range in km for EVs only, else null)
- power_bhp: number or null
- seating_capacity: integer (5 by default)
- safety_rating_stars: number or null (NCAP/NHTSA stars if mentioned)
- key_feature: string (one standout feature from the snippets)
- country: "{country}"

Rules:
- Only include REAL cars actually available in {country}
- If a spec is not mentioned in snippets, use null (do not fabricate)
- Include up to 12 cars total
- Prefer cars that fit within the stated budget

Return ONLY the JSON array."""),
])

# ── Prompt 1b: Extract specs from targeted per-car search snippets ───────────

FETCH_SPECS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a car specification extractor. Extract numeric specs strictly from the provided snippets. Return ONLY valid JSON, no markdown."),
    ("human", """Each section below contains web search results for a specific car.
Extract the available technical specs for each car.

{spec_snippets}

Return a single JSON object where each key is the car_id and the value contains only the fields you could find (omit fields not found in snippets):
- mileage_kmpl: number (fuel efficiency km/l — for petrol/diesel/hybrid/cng cars)
- range_km: number (range in km — for electric vehicles only)
- power_bhp: number (engine power in bhp or ps)
- seating_capacity: integer
- safety_rating_stars: number (NCAP / ASEAN NCAP / NHTSA star rating)

Example output:
{{
  "toyota-innova-2025": {{"mileage_kmpl": 15.1, "power_bhp": 174, "seating_capacity": 7, "safety_rating_stars": null}},
  "hyundai-creta-2025": {{"mileage_kmpl": 17.4, "power_bhp": 115, "seating_capacity": 5, "safety_rating_stars": 5}}
}}

Return ONLY the JSON object. Only include car_ids that appear in the sections above."""),
])

# ── Prompt 2: Rank and personalize reasoning for top 5 ──────────────────────

REASONING_SYSTEM = """You are an expert car buying advisor who gives highly personalized, \
market-specific recommendations. Return ONLY valid JSON array, no markdown."""

REASONING_PROMPT = ChatPromptTemplate.from_messages([
    ("system", REASONING_SYSTEM),
    ("human", """User Preferences:
{preferences}

Car Candidates:
{candidates}

Select the TOP 5 cars that best match the user's preferences, considering:
1. Budget fit (most important — must be within stated budget range)
2. Fuel type preference
3. Use case suitability
4. Priority order (first priority matters most)

Return a JSON array of exactly 5 objects (or fewer if <5 candidates), each with:
- car_id: string (exact id from input)
- match_score: integer 0–100
- why_this_fits: string (2–3 sentences, specific to user's use cases and priorities)
- highlight: string (the single most compelling reason THIS user should consider this car)

Rank by best overall fit. Return ONLY the JSON array."""),
])
