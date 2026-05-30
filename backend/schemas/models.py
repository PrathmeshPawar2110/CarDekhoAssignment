from pydantic import BaseModel
from typing import Optional


class UserPreferences(BaseModel):
    country: str = "IN"
    budget_min: float
    budget_max: float
    use_cases: list[str]
    fuel_preference: str
    priorities: list[str]


class RecommendRequest(BaseModel):
    preferences: UserPreferences


class CarRecommendationOut(BaseModel):
    car_id: str
    match_score: int
    why_this_fits: str
    highlight: str
    specs: dict


class RecommendResponse(BaseModel):
    recommendations: list[CarRecommendationOut]
    trace: list[dict]
