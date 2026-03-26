import type { NearestHospitalsResponse, DirectionsResponse } from '../types/nearbyHospitals';

const API = 'https://dr-insights-backend.onrender.com/api/v1';

export async function fetchNearbyHospitals(
  lat: number, lng: number,
  radius_km: number = 5, max_results: number = 10,
  hospital_type?: string, language: string = 'en-IN',
): Promise<NearestHospitalsResponse> {
  const res = await fetch(`${API}/nearby/nearby-hospitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: lat, longitude: lng,
      radius_km, max_results,
      hospital_type: hospital_type || null,
      language, speaker: 'meera',
    }),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function fetchDirections(
  hospitalId: number, hospitalName: string, userLat: number, userLng: number,
  language: string = 'en-IN',
): Promise<DirectionsResponse> {
  const params = new URLSearchParams({
    hospital_name: hospitalName,
    user_lat: userLat.toString(),
    user_lng: userLng.toString(),
    language,
    speaker: 'meera',
  });
  const res = await fetch(`${API}/nearby/directions/${hospitalId}?${params}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  });
}

export function watchUserLocation(
  onUpdate: (pos: GeolocationPosition) => void,
  onError: (err: GeolocationPositionError) => void,
): number {
  return navigator.geolocation.watchPosition(onUpdate, onError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
  });
}

export function playBase64Audio(b64: string): HTMLAudioElement {
  const audio = new Audio(`data:audio/wav;base64,${b64}`);
  audio.play();
  return audio;
}
