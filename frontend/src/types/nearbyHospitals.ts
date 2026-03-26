export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NearbyHospital {
  id: number;
  name: string;
  hospital_type: string;
  latitude: number;
  longitude: number;
  address?: string;
  contact?: string;
  rating?: number;
  distance_km: number;
  distance_display: string;
  estimated_time_min: number;
  estimated_time_display: string;
}

export interface RouteStep {
  instruction: string;
  distance_m: number;
  duration_s: number;
  name: string;
}

export interface RouteDetails {
  total_distance_km: number;
  total_distance_display: string;
  total_duration_min: number;
  total_duration_display: string;
  route_geometry: [number, number][];
  steps: RouteStep[];
  google_maps_url: string;
  apple_maps_url: string;
}

export interface NearestHospitalsResponse {
  success: boolean;
  user_location: UserLocation;
  hospitals: NearbyHospital[];
  total_found: number;
  radius_km: number;
  voice_response?: { audio_base64: string; format: string; language: string };
  text_response: string;
}

export interface DirectionsResponse {
  success: boolean;
  hospital: NearbyHospital;
  route: RouteDetails;
  voice_response?: { audio_base64: string; format: string; language: string };
  text_response: string;
}
