import type { FC } from 'react';

const LoadingState: FC<{ city: string }> = ({ city }) => (
  <div className="space-y-4">
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3"><span className="animate-spin text-lg">🔍</span><span className="text-sm font-medium text-slate-700">Searching for savings...</span></div>
      {[`Checking ${city} prices...`, 'Searching nearby cities...', 'Calculating travel costs...', 'Finding best savings...'].map((t, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-slate-400 py-0.5"><span>{i === 0 ? '✅' : '⏳'}</span><span className={i === 0 ? 'text-green-600' : 'animate-pulse'}>{t}</span></div>
      ))}
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-5 animate-pulse">
        <div className="flex justify-between"><div className="space-y-2"><div className="h-4 bg-slate-200 rounded w-32" /><div className="h-3 bg-slate-200 rounded w-48" /></div><div className="h-6 bg-slate-200 rounded w-24" /></div>
        <div className="mt-4 h-4 bg-slate-200 rounded-full" />
      </div>
    ))}
  </div>
);

export default LoadingState;
