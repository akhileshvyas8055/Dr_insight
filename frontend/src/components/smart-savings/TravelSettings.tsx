import type { FC } from 'react';
import type { TravelMode, SortBy } from '../../types/smartSavings';

interface Props {
  travelMode: TravelMode; stayDays: number; companions: number; maxDistance: number; sortBy: SortBy;
  onTravelModeChange: (v: TravelMode) => void; onStayDaysChange: (v: number) => void;
  onCompanionsChange: (v: number) => void; onMaxDistanceChange: (v: number) => void;
  onSortByChange: (v: SortBy) => void;
}

const modes: { value: TravelMode; icon: string; label: string }[] = [
  { value: 'bus', icon: '🚌', label: 'Bus' },
  { value: 'train', icon: '🚆', label: 'Train' },
  { value: 'flight', icon: '✈️', label: 'Flight' },
];

const TravelSettings: FC<Props> = (p) => (
  <div className="px-5 pb-4 border-t border-slate-700 pt-3 bg-slate-900 text-white">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">🚆 Travel Mode</label>
        <div className="flex gap-1">
          {modes.map(m => (
            <button key={m.value} onClick={() => p.onTravelModeChange(m.value)}
              className={`flex-1 flex items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${p.travelMode === m.value ? 'bg-blue-100 text-blue-400 border-2 border-blue-500/50' : 'bg-slate-800/80 text-slate-400 border-2 border-transparent hover:bg-slate-800'}`}>
              <span className="mr-1">{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">🛏️ Stay</label>
        <select value={p.stayDays} onChange={e => p.onStayDaysChange(+e.target.value)} className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900">
          {[2, 3, 5, 7, 10].map(d => <option key={d} value={d}>{d} nights</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">👥 Companions</label>
        <select value={p.companions} onChange={e => p.onCompanionsChange(+e.target.value)} className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900">
          {[0, 1, 2, 3].map(c => <option key={c} value={c}>{c === 0 ? 'Solo' : `${c} companion${c > 1 ? 's' : ''}`}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">📏 Max Distance</label>
        <select value={p.maxDistance} onChange={e => p.onMaxDistanceChange(+e.target.value)} className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-900">
          {[200, 400, 600, 800, 1000].map(d => <option key={d} value={d}>{d} km</option>)}
        </select>
      </div>
    </div>
  </div>
);

export default TravelSettings;
