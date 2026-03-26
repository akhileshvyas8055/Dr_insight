from pydantic import BaseModel, Field
from typing import List, Optional

class UserLocation(BaseModel):
    latitude: float
    longitude: float

class NearestHospitalsRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = Field(default=5.0, ge=0.5, le=50.0)
    max_results: int = Field(default=10, ge=1, le=50)
    hospital_type: Optional[str] = None
    language: str = "en-IN"
    speaker: str = "anushka"

class NearbyHospital(BaseModel):
    id: int
    name: str
    hospital_type: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    contact: Optional[str] = None
    rating: Optional[float] = None
    distance_km: float
    distance_display: str
    estimated_time_min: int
    estimated_time_display: str

class RouteStep(BaseModel):
    instruction: str
    distance_m: float
    duration_s: float
    name: str

class RouteDetails(BaseModel):
    total_distance_km: float
    total_distance_display: str
    total_duration_min: float
    total_duration_display: str
    route_geometry: List[List[float]]
    steps: List[RouteStep]
    google_maps_url: str
    apple_maps_url: str

class NearestHospitalsResponse(BaseModel):
    success: bool
    user_location: UserLocation
    hospitals: List[NearbyHospital]
    total_found: int
    radius_km: float
    voice_response: Optional[dict] = None
    text_response: str

class DirectionsResponse(BaseModel):
    success: bool
    hospital: NearbyHospital
    route: RouteDetails
    voice_response: Optional[dict] = None
    text_response: str
