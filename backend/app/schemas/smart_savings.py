from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class TravelMode(str, Enum):
    bus = "bus"
    train = "train"
    flight = "flight"

class SortBy(str, Enum):
    highest_savings = "highest_savings"
    nearest_first = "nearest_first"
    lowest_total = "lowest_total"
    shortest_travel = "shortest_travel"

class SmartSavingsRequest(BaseModel):
    city: str
    procedure: str
    max_nearby_cities: int = Field(default=5, ge=1, le=15)
    max_distance_km: int = Field(default=600, ge=50, le=2000)
    stay_days: int = Field(default=3, ge=1, le=14)
    travel_mode: TravelMode = TravelMode.train
    companions: int = Field(default=1, ge=0, le=5)
    language: str = "en-IN"
    speaker: str = "anushka"
    sort_by: SortBy = SortBy.highest_savings

class TravelCostBreakdown(BaseModel):
    travel_mode: str
    one_way_per_person: float
    round_trip_total: float
    hotel_per_night: float
    hotel_total: float
    total_travel_cost: float
    all_modes: dict  

class NearbyCitySaving(BaseModel):
    rank: int
    city: str
    city_lat: Optional[float] = None
    city_lng: Optional[float] = None
    distance_km: int
    travel_time_hours: float
    travel_time_display: str
    hospital_name: str
    hospital_rating: Optional[float] = None
    procedure_price: float
    travel_cost_breakdown: TravelCostBreakdown
    total_cost: float
    net_savings: float
    savings_percentage: float
    is_worth_it: bool

class NoSavingsCity(BaseModel):
    city: str
    distance_km: int
    cheapest_price: float
    total_cost: float
    reason: str

class UserCityResult(BaseModel):
    city: str
    city_lat: Optional[float] = None
    city_lng: Optional[float] = None
    cheapest_hospital: str
    cheapest_price: float
    most_expensive_hospital: str
    most_expensive_price: float
    all_hospitals: List[dict]

class BestRecommendation(BaseModel):
    city: str
    hospital: str
    total_cost: float
    savings: float
    savings_percentage: float
    message: str

class SmartSavingsResponse(BaseModel):
    success: bool
    user_city: UserCityResult
    nearby_city_savings: List[NearbyCitySaving]
    no_savings_cities: List[NoSavingsCity]
    best_recommendation: Optional[BestRecommendation] = None
    text_response: dict
    voice_response: Optional[dict] = None
    map_data: dict
