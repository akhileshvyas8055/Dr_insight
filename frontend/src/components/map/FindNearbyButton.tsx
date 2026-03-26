import type { FC } from 'react';

interface Props { onFind: () => void; loading: boolean; isActive: boolean; onClear: () => void; }

const FindNearbyButton: FC<Props> = ({ onFind, loading, isActive, onClear }) => (
  <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
    <button onClick={onFind} disabled={loading} className={`${isActive ? 'bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400/50' : 'bg-red-600 hover:bg-red-500 animate-pulse hover:animate-none'} text-white font-bold py-3 px-5 rounded-xl shadow-2xl transition-all flex items-center gap-2 text-sm`}>
      {loading ? <><span className="animate-spin">📍</span> Locating...</> : isActive ? <>📍 Update Location</> : <>🚑 Find Nearest Hospitals</>}
    </button>
    {isActive && (
      <button onClick={onClear} className="bg-slate-700/90 hover:bg-slate-600 text-slate-300 text-xs py-2 px-4 rounded-lg transition-colors text-center">✕ Clear Nearby Search</button>
    )}
  </div>
);

export default FindNearbyButton;
