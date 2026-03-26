import { useState, type FC } from 'react';
import type { NoSavingsCity } from '../../types/smartSavings';
import { formatINR } from '../../services/smartSavingsApi';

const NoSavingsSection: FC<{ cities: NoSavingsCity[] }> = ({ cities }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700 mt-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-400 hover:text-slate-700">
        <span>❌ Cities without savings ({cities.length})</span><span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-5 pb-4 space-y-1">
        {cities.map(c => (
          <div key={c.city} className="flex justify-between text-sm text-slate-400 py-1 border-b border-slate-700">
            <span>{c.city} ({c.distance_km} km) — {formatINR(c.total_cost)} total</span><span className="text-slate-400">{c.reason}</span>
          </div>
        ))}
      </div>}
    </div>
  );
};

export default NoSavingsSection;
