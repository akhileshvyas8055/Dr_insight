import type { FC } from 'react';
import type { NearbyHospital } from '../../types/nearbyHospitals';

interface Props {
  hospitals: NearbyHospital[];
  loading: boolean;
  onGetDirections: (hospital: NearbyHospital) => void;
  onHospitalHover: (hospital: NearbyHospital | null) => void;
  selectedHospitalId: number | null;
}

const typeColors: Record<string, string> = {
  'Government': 'bg-rose-500',
  'Private-Premium': 'bg-blue-500',
  'Private-Mid': 'bg-orange-400',
  'Trust': 'bg-yellow-400',
  'Diagnostic Centre': 'bg-emerald-400',
};

const NearbyPanel: FC<Props> = ({ hospitals, loading, onGetDirections, onHospitalHover, selectedHospitalId }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <span className="animate-spin">📍</span> Finding nearest hospitals...
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!hospitals.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🏥</div>
        <p className="text-slate-400 text-sm">No hospitals found nearby.</p>
        <p className="text-slate-500 text-xs mt-1">Try increasing the radius.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 uppercase tracking-wide">
        {hospitals.length} hospitals found nearby
      </p>

      {hospitals.map((h, i) => (
        <div
          key={`${h.id}-${i}`}
          onMouseEnter={() => onHospitalHover(h)}
          onMouseLeave={() => onHospitalHover(null)}
          className={`bg-slate-800/60 hover:bg-slate-800 rounded-lg p-3 transition-all cursor-pointer border ${
            selectedHospitalId === h.id
              ? 'border-emerald-500 ring-1 ring-emerald-500/30'
              : 'border-slate-700/50 hover:border-slate-600'
          }`}
        >
          {/* Rank + Name */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                i === 0 ? 'bg-emerald-500 text-white' : i === 1 ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'
              }`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{h.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[h.hospital_type] || 'bg-gray-400'}`} />
                  <span className="text-xs text-slate-400 truncate">{h.hospital_type}</span>
                  {h.rating && <span className="text-xs text-amber-400">⭐ {h.rating}</span>}
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-emerald-400">{h.distance_display}</p>
              <p className="text-xs text-slate-500">~{h.estimated_time_display}</p>
            </div>
          </div>

          {/* Address + Contact */}
          {h.address && <p className="text-xs text-slate-500 mt-1.5 truncate pl-7">{h.address}</p>}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2 pl-7">
            <button
              onClick={(e) => { e.stopPropagation(); onGetDirections(h); }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
            >
              🧭 Get Directions
            </button>
            {h.contact && (
              <a
                href={`tel:${h.contact}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors flex items-center gap-1"
              >
                📞 Call
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NearbyPanel;
