import type { FC } from 'react';
import type { NearbyHospital, RouteDetails } from '../../types/nearbyHospitals';

interface Props {
  hospital: NearbyHospital;
  route: RouteDetails;
  onClose: () => void;
  onVoicePlay: () => void;
  isPlaying: boolean;
}

const DirectionsPanel: FC<Props> = ({ hospital, route, onClose, onVoicePlay, isPlaying }) => (
  <div className="space-y-3">
    <button onClick={onClose} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
      ← Back to nearby hospitals
    </button>
    <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-lg p-4">
      <h3 className="text-base font-bold text-white">{hospital.name}</h3>
      <p className="text-xs text-emerald-300 mt-0.5">{hospital.hospital_type}</p>
      {hospital.address && <p className="text-xs text-slate-400 mt-1">{hospital.address}</p>}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-emerald-400">{route.total_distance_display}</p>
        <p className="text-xs text-slate-400 mt-0.5">Distance</p>
      </div>
      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-blue-400">{route.total_duration_display}</p>
        <p className="text-xs text-slate-400 mt-0.5">Est. Time</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2">
      <a href={route.google_maps_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5">🗺️ Open in Google Maps</a>
    </div>
    <button onClick={onVoicePlay} className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
      {isPlaying ? '🔊 Playing Directions...' : '🔊 Voice Directions'}
    </button>
    {hospital.contact && (
      <a href={`tel:${hospital.contact}`} className="block w-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-3 rounded-lg transition-colors text-center">📞 Call Hospital — {hospital.contact}</a>
    )}
    <div className="bg-slate-800/40 rounded-lg p-3">
      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Turn-by-Turn Directions</h4>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {route.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-slate-300">{step.instruction}</p>
              <p className="text-slate-500">
                {step.distance_m > 1000 ? `${(step.distance_m / 1000).toFixed(1)} km` : `${Math.round(step.distance_m)} m`}
                {' · '}
                {step.duration_s > 60 ? `${Math.round(step.duration_s / 60)} min` : `${Math.round(step.duration_s)} sec`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DirectionsPanel;
