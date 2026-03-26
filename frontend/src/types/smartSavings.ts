export type TravelMode = 'bus' | 'train' | 'flight';
export type SortBy = 'highest_savings' | 'nearest_first' | 'lowest_total' | 'shortest_travel';

export interface SmartSavingsRequest {
  city: string;
  procedure: string;
  max_nearby_cities?: number;
  max_distance_km?: number;
  stay_days?: number;
  travel_mode?: TravelMode;
  companions?: number;
  language?: string;
  speaker?: string;
  sort_by?: SortBy;
}

export interface TravelCostBreakdown {
  travel_mode: string;
  one_way_per_person: number;
  round_trip_total: number;
  hotel_per_night: number;
  hotel_total: number;
  total_travel_cost: number;
  all_modes: Record<string, {
    one_way_per_person: number;
    round_trip_total: number;
    total_with_hotel: number;
  }>;
}

export interface NearbyCitySaving {
  rank: number;
  city: string;
  city_lat: number | null;
  city_lng: number | null;
  distance_km: number;
  travel_time_hours: number;
  travel_time_display: string;
  hospital_name: string;
  hospital_rating: number | null;
  procedure_price: number;
  travel_cost_breakdown: TravelCostBreakdown;
  total_cost: number;
  net_savings: number;
  savings_percentage: number;
  is_worth_it: boolean;
}

export interface NoSavingsCity {
  city: string;
  distance_km: number;
  cheapest_price: number;
  total_cost: number;
  reason: string;
}

export interface UserCityResult {
  city: string;
  city_lat: number | null;
  city_lng: number | null;
  cheapest_hospital: string;
  cheapest_price: number;
  most_expensive_hospital: string;
  most_expensive_price: number;
  all_hospitals: Array<{ hospital_name: string; price: number; rating?: number | null }>;
}

export interface BestRecommendation {
  city: string;
  hospital: string;
  total_cost: number;
  savings: number;
  savings_percentage: number;
  message: string;
}

export interface MapMarker {
  type: 'user_city' | 'savings_city';
  name: string;
  lat: number | null;
  lng: number | null;
  hospital: string;
  price: number;
  total_cost?: number;
  savings?: number;
  savings_pct?: number;
  rank?: number;
  color: string;
}

export interface SmartSavingsResponse {
  success: boolean;
  user_city: UserCityResult;
  nearby_city_savings: NearbyCitySaving[];
  no_savings_cities: NoSavingsCity[];
  best_recommendation: BestRecommendation | null;
  text_response: { english: string; localized: string };
  voice_response: { audio_base64: string; format: string; language: string; sample_rate: number } | null;
  map_data: { center: { lat: number; lng: number }; zoom: number; markers: MapMarker[] };
}
