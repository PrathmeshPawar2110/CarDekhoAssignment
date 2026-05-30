from typing import TypedDict, Optional
from pydantic import BaseModel


class UserPreferences(BaseModel):
    country: str = "IN"
    budget_min: float
    budget_max: float
    use_cases: list[str]
    fuel_preference: str
    priorities: list[str]


class CarRecommendation(BaseModel):
    car_id: str
    match_score: int
    why_this_fits: str
    highlight: str
    specs: dict


class AgentState(TypedDict):
    preferences: UserPreferences
    search_queries: list[str]
    search_results: list[dict]
    car_candidates: list[dict]
    recommendations: list[CarRecommendation]
    trace: list[dict]
    error: Optional[str]
