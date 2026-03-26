import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { NearbyHospital, DirectionsResponse } from '../types/nearbyHospitals'
import { fetchNearbyHospitals, fetchDirections, getUserLocation, playBase64Audio } from '../services/nearbyApi'
import FindNearbyButton from '../components/map/FindNearbyButton'
import NearbyPanel from '../components/map/NearbyPanel'
import DirectionsPanel from '../components/map/DirectionsPanel'
import UserLocationMarker from '../components/map/UserLocationMarker'
import RoutePolyline from '../components/map/RoutePolyline'
import RadiusControl from '../components/map/RadiusControl'
import MapAutoFit from '../components/map/MapAutoFit'

// Fix default marker icons for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom colored marker icons
function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      position: relative;
    "><div style="
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const icons: Record<string, L.DivIcon> = {
  'Government': createIcon('#ef4444'),
  'Private-Premium': createIcon('#3b82f6'),
  'Private-Mid': createIcon('#f97316'),
  'Trust': createIcon('#f59e0b'),
  'Standalone-Diagnostic': createIcon('#22c55e'),
}

// Component to fly to a location
function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.2 }) }, [center, zoom])
  return null
}

const CITY_COORDS: Record<string, [number, number]> = {
  'All India': [22.5, 78.9],
  'Delhi': [28.61, 77.21],
  'Mumbai': [19.05, 72.88],
  'Bengaluru': [12.97, 77.59],
  'Bangalore': [12.97, 77.59],
  'Chennai': [13.05, 80.24],
  'Kolkata': [22.55, 88.38],
  'Hyderabad': [17.42, 78.47],
  'Pune': [18.53, 73.87],
  'Ahmedabad': [23.04, 72.57],
  'Jaipur': [26.87, 75.81],
  'Gurugram': [28.44, 77.05],
  'Lucknow': [26.85, 80.95],
  'Chandigarh': [30.76, 76.77],
  'Kochi': [10.02, 76.30],
  'Noida': [28.54, 77.39],
  'Ghaziabad': [28.66, 77.41],
  'Thane': [19.20, 72.97],
  'Navi Mumbai': [19.04, 73.01],
  'Vellore': [12.92, 79.13],
  'Coimbatore': [11.01, 76.97],
  'Madurai': [9.93, 78.12],
  'Thiruvananthapuram': [8.52, 76.95],
  'Kozhikode': [11.27, 75.78],
  'Mysore': [12.31, 76.64],
  'Mangalore': [12.87, 74.84],
  'Manipal': [13.35, 74.79],
  'Surat': [21.19, 72.83],
  'Rajkot': [22.30, 70.80],
  'Varanasi': [25.31, 83.01],
  'Patna': [25.62, 85.10],
  'Bhopal': [23.26, 77.41],
  'Bhubaneswar': [20.27, 85.82],
  'Guwahati': [26.15, 91.77],
  'Raipur': [21.24, 81.63],
  'Faridabad': [28.37, 77.31],
  'Ludhiana': [30.91, 75.83],
  'Amritsar': [31.63, 74.87],
  'Ranchi': [23.36, 85.32],
  'Jamshedpur': [22.79, 86.19],
  'Shimla': [31.11, 77.16],
  'Dehradun': [30.32, 78.03],
  'Rishikesh': [30.07, 78.28],
  'Jammu': [32.73, 74.85],
  'Srinagar': [34.09, 74.80],
  'Nagpur': [21.15, 79.08],
  'Nashik': [20.00, 73.77],
  'Jodhpur': [26.29, 73.02],
  'Udaipur': [24.58, 73.71],
  'Goa': [15.45, 73.85],
  'Mohali': [30.71, 76.72],
  'Cuttack': [20.47, 85.88],
  'Gorakhpur': [26.76, 83.37],
  'Kanpur': [26.46, 80.35],
  'Prayagraj': [25.43, 81.85],
  'Siliguri': [26.73, 88.40],
  'Hubli': [15.36, 75.12],
  'Belgaum': [15.86, 74.50],
  'Gulbarga': [17.33, 76.83],
  'Aurangabad': [19.88, 75.33],
  'Kolhapur': [16.71, 74.24],
  'Salem': [11.66, 78.15],
  'Trichy': [10.81, 78.69],
  'Bathinda': [30.21, 74.95],
  'Greater Noida': [28.46, 77.54],
  'Panchkula': [30.70, 76.85],
  'Durgapur': [23.55, 87.32],
  'Dharwad': [15.45, 75.02],
  'Kangra': [32.09, 76.26],
  'Nanded': [19.14, 77.32],
  'Bilaspur': [31.33, 76.76],
  'Mandi': [31.71, 76.93],
  'Kullu': [31.96, 77.11],
  'Dharamshala': [32.22, 76.32],
}

export default function MapPage() {
  const [points, setPoints] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState('Delhi')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  
  // New States
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [directionsData, setDirectionsData] = useState<DirectionsResponse | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    api.get('/geography/map-points', { params: { limit: 2000 } }).then(r => setPoints(r.data))
  }, [])

  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      if (!p.latitude || !p.longitude) return false
      if (selectedCity !== 'All India' && p.city !== selectedCity) return false
      if (selectedType && p.type !== selectedType) return false
      if (search && !p.hospital_name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [points, selectedCity, selectedType, search])

  const cityCenter = CITY_COORDS[selectedCity] || CITY_COORDS['All India']
  const cityZoom = selectedCity === 'All India' ? 5 : 12

  const availableCities = useMemo(() => {
    const cs = new Set(points.filter(p => p.latitude && p.longitude).map((p: any) => p.city))
    return ['All India', ...Array.from(cs).sort()]
  }, [points])

  const types = useMemo(() => {
    const ts = new Set(points.filter(p => p.latitude && p.longitude).map((p: any) => p.type).filter(Boolean))
    return Array.from(ts).sort()
  }, [points])

  const getDirectionsUrl = (lat: number, lng: number, name: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`

  // New Handlers
  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const handlePlayAudio = useCallback((b64: string) => {
    stopAudio();
    const audio = playBase64Audio(b64);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  }, [stopAudio]);

  const handleFindNearby = useCallback(async () => {
    setNearbyLoading(true);
    setShowDirections(false);
    setDirectionsData(null);
  
    try {
      const pos = await getUserLocation();
      const { latitude, longitude, accuracy } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude, accuracy });
      setNearbyActive(true);
  
      const result = await fetchNearbyHospitals(
        latitude, longitude, radiusKm, 10,
        selectedType || undefined,
        voiceLanguage,
      );
  
      setNearbyHospitals(result.hospitals);
  
      if (result.voice_response?.audio_base64) {
        handlePlayAudio(result.voice_response.audio_base64);
      }
    } catch (err: any) {
      if (err.code === 1) {
        alert('📍 Location access denied. Please allow location access in your browser settings.');
      } else {
        alert('Failed to get location: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setNearbyLoading(false);
    }
  }, [radiusKm, voiceLanguage, selectedType, handlePlayAudio]);

  const handleGetDirections = useCallback(async (hospital: NearbyHospital) => {
    if (!userLocation) return;
    setDirectionsLoading(true);
    setSelectedHospitalId(hospital.id);
  
    try {
      const result = await fetchDirections(
        hospital.id, hospital.name, userLocation.lat, userLocation.lng, voiceLanguage,
      );
      setDirectionsData(result);
      setShowDirections(true);
  
      if (result.voice_response?.audio_base64) {
        handlePlayAudio(result.voice_response.audio_base64);
      }
    } catch (err: any) {
      alert('Failed to get directions: ' + err.message);
    } finally {
      setDirectionsLoading(false);
    }
  }, [userLocation, voiceLanguage, handlePlayAudio]);

  const handleClearNearby = () => {
    setUserLocation(null);
    setNearbyHospitals([]);
    setNearbyActive(false);
    setShowDirections(false);
    setDirectionsData(null);
    setSelectedHospitalId(null);
    stopAudio();
  };

  const handleHospitalHover = (h: NearbyHospital | null) => {
    setSelectedHospitalId(h?.id || null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">City</label>
            <select
              className="bg-slate-800 rounded-xl p-3 w-full text-sm border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hospital Type</label>
            <select
              className="bg-slate-800 rounded-xl p-3 w-full text-sm border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Search Hospital</label>
            <input
              className="bg-slate-800 rounded-xl p-3 w-full text-sm border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="Type hospital name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="bg-slate-800/60 rounded-xl p-3 w-full text-center">
              <span className="text-2xl font-bold text-emerald-400">{filteredPoints.length}</span>
              <span className="text-xs text-slate-400 ml-2">hospitals found</span>
            </div>
          </div>
        </div>
      </div>

      {nearbyActive && (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              🚑 Nearest Hospitals
            </h3>
            <RadiusControl
              radius={radiusKm}
              onRadiusChange={(r) => { setRadiusKm(r); }}
              language={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
            />
          </div>

          {showDirections && directionsData ? (
            <DirectionsPanel
              hospital={directionsData.hospital}
              route={directionsData.route}
              onClose={() => { setShowDirections(false); setDirectionsData(null); setSelectedHospitalId(null); }}
              onVoicePlay={() => {
                if (directionsData.voice_response?.audio_base64) {
                  handlePlayAudio(directionsData.voice_response.audio_base64);
                }
              }}
              isPlaying={isPlaying}
            />
          ) : (
            <NearbyPanel
              hospitals={nearbyHospitals}
              loading={nearbyLoading}
              onGetDirections={handleGetDirections}
              onHospitalHover={handleHospitalHover}
              selectedHospitalId={selectedHospitalId}
            />
          )}
        </div>
      )}

      {/* Legend */}
      <div className="card p-3">
        <div className="flex flex-wrap gap-4 items-center text-xs">
          <span className="text-slate-400 font-semibold">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Government</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Private-Premium</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Private-Mid</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Trust</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Diagnostic Centre</span>
        </div>
      </div>

      {/* Map */}
      <div className="card p-4 relative">
        <FindNearbyButton
          onFind={handleFindNearby}
          loading={nearbyLoading}
          isActive={nearbyActive}
          onClear={handleClearNearby}
        />
        <div className="h-[600px] rounded-2xl overflow-hidden relative z-0">
          <MapContainer center={cityCenter} zoom={cityZoom} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {(!nearbyActive || nearbyHospitals.length === 0) && <FlyTo center={cityCenter} zoom={cityZoom} />}
            
            {userLocation && nearbyHospitals.length > 0 && (
              <MapAutoFit
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                hospitals={nearbyHospitals}
              />
            )}

            {userLocation && (
              <UserLocationMarker
                lat={userLocation.lat}
                lng={userLocation.lng}
                accuracy={userLocation.accuracy}
                radiusKm={radiusKm}
              />
            )}

            {directionsData?.route && showDirections && (
              <RoutePolyline
                route={directionsData.route}
                hospitalName={directionsData.hospital.name}
              />
            )}

            {filteredPoints.map((p, i) => {
              const baseOpacity = nearbyActive ? 0.4 : 1.0;
              const isSelected = selectedHospitalId !== null && p.hospital_name === nearbyHospitals.find(h => h.id === selectedHospitalId)?.name;
              const opacity = isSelected ? 1.0 : baseOpacity;

              return (
                <Marker key={i} position={[p.latitude, p.longitude]} icon={icons[p.type] || icons['Private-Premium']} opacity={opacity}>
                  <Popup maxWidth={320} minWidth={260}>
                    <div style={{ color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                        🏥 {p.hospital_name}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '12px', marginBottom: '8px' }}>
                        <div>📍 <strong>{p.city}</strong></div>
                        <div>🏷️ {p.type || 'Hospital'}</div>
                      </div>
                      <a
                        href={getDirectionsUrl(p.latitude, p.longitude, p.hospital_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          width: '100%',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                          transition: 'all 0.2s',
                        }}
                      >
                        🧭 Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>

      {/* Hospital List Below Map */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-lg">Hospital Directory — {selectedCity}</h3>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                <th className="p-3 text-left">Hospital</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Directions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.map((p, i) => (
                <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium">{p.hospital_name}</td>
                  <td className="p-3 text-slate-400">{p.city}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.type === 'Government' ? 'bg-red-500/20 text-red-400' :
                      p.type === 'Private-Premium' ? 'bg-blue-500/20 text-blue-400' :
                      p.type === 'Private-Mid' ? 'bg-orange-500/20 text-orange-400' :
                      p.type === 'Trust' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {p.type || 'Hospital'}
                    </span>
                  </td>
                  <td className="p-3">
                    <a
                      href={getDirectionsUrl(p.latitude, p.longitude, p.hospital_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                    >
                      🧭 Navigate
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
