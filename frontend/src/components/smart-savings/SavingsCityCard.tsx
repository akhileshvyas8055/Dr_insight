import { useState, type FC } from 'react';
import type { NearbyCitySaving } from '../../types/smartSavings';
import { formatINR } from '../../services/smartSavingsApi';

const rankStyle: Record<number, { border: string; icon: string }> = {
  1: { border: 'border-l-amber-400', icon: '🥇' },
  2: { border: 'border-l-slate-400', icon: '🥈' },
  3: { border: 'border-l-orange-700', icon: '🥉' },
};

const SavingsCityCard: FC<{ saving: NearbyCitySaving; baselinePrice: number }> = ({ saving: s, baselinePrice }) => {
  const [open, setOpen] = useState(false);
  const rs = rankStyle[s.rank] || { border: 'border-l-blue-400', icon: `#${s.rank}` };
  const tb = s.travel_cost_breakdown;
  const hospPct = (s.procedure_price / s.total_cost) * 100;
  const travelPct = (tb.round_trip_total / s.total_cost) * 100;
  const stayPct = (tb.hotel_total / s.total_cost) * 100;

  return (
    <div className={`bg-slate-900 rounded-xl shadow-sm border border-slate-700 border-l-4 ${rs.border} hover:shadow-md transition-shadow`}>
      <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{rs.icon}</span>
              <h3 className="text-lg font-bold text-white">{s.city}</h3>
              <span className="text-xs text-slate-400">{s.distance_km} km • {s.travel_time_display}</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              🏥 {s.hospital_name} {s.hospital_rating && <span className="ml-1 text-amber-500">⭐ {s.hospital_rating}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 font-semibold uppercase">Save</p>
            <p className="text-xl font-bold text-green-600">{formatINR(s.net_savings)}</p>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1">{s.savings_percentage}%</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex rounded-full overflow-hidden h-4 bg-slate-100">
            <div className="bg-green-500 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: `${hospPct}%` }}>Hospital</div>
            <div className="bg-blue-500 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: `${travelPct}%` }}>Travel</div>
            <div className="bg-purple-500 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: `${stayPct}%` }}>Stay</div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Total: {formatINR(s.total_cost)}</span>
            <span>vs {formatINR(baselinePrice)} in your city</span>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-700 px-4 sm:px-5 py-3 bg-slate-800/80 rounded-b-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-slate-400 text-xs">💊 Procedure</p><p className="font-semibold">{formatINR(s.procedure_price)}</p></div>
            <div><p className="text-slate-400 text-xs">🚆 Travel ({tb.travel_mode})</p><p className="font-semibold">{formatINR(tb.round_trip_total)}</p></div>
            <div><p className="text-slate-400 text-xs">🛏️ Hotel</p><p className="font-semibold">{formatINR(tb.hotel_total)}</p></div>
            <div><p className="text-slate-400 text-xs">📦 TOTAL</p><p className="font-bold text-green-600 text-lg">{formatINR(s.total_cost)}</p></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Other travel options:</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(tb.all_modes).map(([mode, d]) => (
                <span key={mode} className="text-xs bg-slate-900 border border-slate-700 rounded-md px-2 py-1">
                  {mode === 'bus' ? '🚌' : mode === 'train' ? '🚆' : '✈️'} {formatINR(d.total_with_hotel)} total
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">📞 Contact Hospital</button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">📅 Book Appointment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsCityCard;
