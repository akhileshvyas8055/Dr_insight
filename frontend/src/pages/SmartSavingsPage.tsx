import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TravelMode, SortBy, SmartSavingsResponse } from '../types/smartSavings';
import { fetchSmartSavings, playBase64Audio } from '../services/smartSavingsApi';
import SelectionBar from '../components/smart-savings/SelectionBar';
import TravelSettings from '../components/smart-savings/TravelSettings';
import BaselineCard from '../components/smart-savings/BaselineCard';
import BestSavingsBanner from '../components/smart-savings/BestSavingsBanner';
import SavingsCityCard from '../components/smart-savings/SavingsCityCard';
import CostComparisonChart from '../components/smart-savings/CostComparisonChart';
import SavingsMap from '../components/smart-savings/SavingsMap';
import VoiceControls from '../components/smart-savings/VoiceControls';
import EmptyState from '../components/smart-savings/EmptyState';
import LoadingState from '../components/smart-savings/LoadingState';
import NoSavingsSection from '../components/smart-savings/NoSavingsSection';
import { formatINR } from '../services/smartSavingsApi';

const LANGS = [
  { code: 'en-IN', name: 'English' }, { code: 'hi-IN', name: 'Hindi' },
  { code: 'ta-IN', name: 'Tamil' }, { code: 'te-IN', name: 'Telugu' },
  { code: 'bn-IN', name: 'Bengali' }, { code: 'mr-IN', name: 'Marathi' },
  { code: 'kn-IN', name: 'Kannada' }, { code: 'ml-IN', name: 'Malayalam' },
  { code: 'gu-IN', name: 'Gujarati' }, { code: 'pa-IN', name: 'Punjabi' },
];

export default function SmartSavingsPage() {
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState('');
  const [procedure, setProcedure] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [travelMode, setTravelMode] = useState<TravelMode>('train');
  const [stayDays, setStayDays] = useState(3);
  const [companions, setCompanions] = useState(1);
  const [maxDistance, setMaxDistance] = useState(600);
  const [sortBy, setSortBy] = useState<SortBy>('highest_savings');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState<SmartSavingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [procedures, setProcedures] = useState<Array<{ id: number; name: string; category?: string }>>([]);

  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  // Load existing cities & procedures from your existing endpoints
  useEffect(() => {
    Promise.all([
      fetch(`${API}/comparison/cities`).then(r => r.json()),
      fetch(`${API}/comparison/procedures`).then(r => r.json()),
    ]).then(([c, p]) => {
      setCities(c.cities || c);
      setProcedures(p.procedures || p);
    }).catch(() => setError('Failed to load cities/procedures'));
  }, []);

  // Pre-fill from URL params (when coming from results page CTA)
  useEffect(() => {
    const c = searchParams.get('city');
    const p = searchParams.get('procedure');
    if (c) setCity(c);
    if (p) setProcedure(p);
  }, [searchParams]);

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  };

  const handlePlay = (b64?: string) => {
    const src = b64 || data?.voice_response?.audio_base64;
    if (!src) return;
    stopAudio();
    const a = playBase64Audio(src);
    audioRef.current = a;
    setIsPlaying(true);
    a.onended = () => setIsPlaying(false);
    a.onerror = () => setIsPlaying(false);
  };

  const handleSearch = async () => {
    if (!city || !procedure) { setError('Select both city and procedure'); return; }
    setLoading(true); setError(''); setData(null); stopAudio();
    try {
      const res = await fetchSmartSavings({
        city, procedure, max_nearby_cities: 5, max_distance_km: maxDistance,
        stay_days: stayDays, travel_mode: travelMode, companions, language, speaker: 'anushka', sort_by: sortBy,
      });
      setData(res);
      if (res.voice_response?.audio_base64) handlePlay(res.voice_response.audio_base64);
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  // Frontend re-sort (no API call)
  const handleSortChange = (s: SortBy) => {
    setSortBy(s);
    if (!data || !data.nearby_city_savings || data.nearby_city_savings.length === 0) return;
    const sorted = [...data.nearby_city_savings];
    const fns: Record<SortBy, (a: any, b: any) => number> = {
      highest_savings: (a, b) => b.net_savings - a.net_savings,
      nearest_first: (a, b) => a.distance_km - b.distance_km,
      lowest_total: (a, b) => a.total_cost - b.total_cost,
      shortest_travel: (a, b) => a.travel_time_hours - b.travel_time_hours,
    };
    sorted.sort(fns[s]);
    sorted.forEach((x, i) => x.rank = i + 1);
    setData({ ...data, nearby_city_savings: sorted });
  };

  // Frontend travel mode toggle (uses all_modes from response)
  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    if (!data || !data.nearby_city_savings || data.nearby_city_savings.length === 0) return;
    const baseline = data.user_city.cheapest_price;
    const updated = data.nearby_city_savings.map(s => {
      const md = s.travel_cost_breakdown.all_modes[mode];
      if (!md) return s;
      const hotelTotal = s.travel_cost_breakdown.hotel_per_night * stayDays;
      const newTravel = md.round_trip_total + hotelTotal;
      const newTotal = s.procedure_price + newTravel;
      const sav = baseline - newTotal;
      const pct = baseline > 0 ? (sav / baseline) * 100 : 0;
      return { ...s, travel_cost_breakdown: { ...s.travel_cost_breakdown, travel_mode: mode, one_way_per_person: md.one_way_per_person, round_trip_total: md.round_trip_total, hotel_total: hotelTotal, total_travel_cost: newTravel }, total_cost: newTotal, net_savings: sav, savings_percentage: Math.round(pct * 10) / 10, is_worth_it: pct > 5 };
    }).filter(s => s.net_savings > 0);
    updated.sort((a, b) => b.net_savings - a.net_savings);
    updated.forEach((s, i) => s.rank = i + 1);
    const best = updated[0] ? { city: updated[0].city, hospital: updated[0].hospital_name, total_cost: updated[0].total_cost, savings: updated[0].net_savings, savings_percentage: updated[0].savings_percentage, message: `Travel to ${updated[0].city} and save ${formatINR(updated[0].net_savings)} (${updated[0].savings_percentage}% savings)!` } : null;
    setData({ ...data, nearby_city_savings: updated, best_recommendation: best });
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">🏙️ Smart City Savings</h1>
          <p className="text-slate-400 mt-1 text-sm">Find cheaper hospitals nearby — save even after travel costs!</p>
        </div>
      </div>
      <div className="space-y-6 pb-20">
        <SelectionBar cities={cities} procedures={procedures} languages={LANGS} city={city} procedure={procedure} language={language} onCityChange={setCity} onProcedureChange={setProcedure} onLanguageChange={setLanguage} onSearch={handleSearch} loading={loading} />
        
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700">
          <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-300 hover:text-white">
            <span>⚙️ Travel Settings</span>
            <span className="text-xs text-slate-500">{travelMode} • {stayDays} nights • {companions} companion{companions !== 1 ? 's' : ''} • {maxDistance}km</span>
          </button>
          {showSettings && <TravelSettings travelMode={travelMode} stayDays={stayDays} companions={companions} maxDistance={maxDistance} sortBy={sortBy} onTravelModeChange={handleTravelModeChange} onStayDaysChange={setStayDays} onCompanionsChange={setCompanions} onMaxDistanceChange={setMaxDistance} onSortByChange={handleSortChange} />}
        </div>
        
        {loading && <LoadingState city={city} />}
        {error && <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-200 text-sm">❌ {error}</div>}
        
        {data?.success && <>
          <BaselineCard userCity={data.user_city} procedure={procedure} />
          {data.best_recommendation && <BestSavingsBanner recommendation={data.best_recommendation} baselinePrice={data.user_city.cheapest_price} />}
          {data.map_data.markers.length > 0 && <SavingsMap mapData={data.map_data} />}
          
          {data.nearby_city_savings.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">💡 Nearby City Options ({data.nearby_city_savings.length})</h2>
                <select value={sortBy} onChange={e => handleSortChange(e.target.value as SortBy)} className="text-sm border border-slate-700 bg-slate-800 text-white rounded-lg px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                  <option value="highest_savings">Highest Savings</option>
                  <option value="nearest_first">Nearest First</option>
                  <option value="lowest_total">Lowest Total Cost</option>
                  <option value="shortest_travel">Shortest Travel</option>
                </select>
              </div>
              {data.nearby_city_savings.map(s => <SavingsCityCard key={s.city} saving={s} baselinePrice={data.user_city.cheapest_price} />)}
            </div>
          ) : <EmptyState type="no_savings" city={city} hospital={data.user_city.cheapest_hospital} price={data.user_city.cheapest_price} />}
          
          {data.nearby_city_savings.length > 0 && <CostComparisonChart userCity={data.user_city} savings={data.nearby_city_savings} />}
          {data.voice_response && <VoiceControls isPlaying={isPlaying} onPlay={() => handlePlay()} onStop={stopAudio} textResponse={data.text_response.localized || data.text_response.english} />}
          {data.no_savings_cities.length > 0 && <NoSavingsSection cities={data.no_savings_cities} />}
        </>}
        {!data && !loading && !error && <EmptyState type="initial" />}
      </div>
    </div>
  );
}
