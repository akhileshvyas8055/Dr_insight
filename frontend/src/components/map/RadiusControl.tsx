import type { FC } from 'react';

interface Props { radius: number; onRadiusChange: (r: number) => void; language: string; onLanguageChange: (l: string) => void; }

const languages = [
  { code: 'en-IN', name: 'English' }, { code: 'hi-IN', name: 'Hindi' }, { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' }, { code: 'bn-IN', name: 'Bengali' }, { code: 'mr-IN', name: 'Marathi' },
  { code: 'kn-IN', name: 'Kannada' }, { code: 'ml-IN', name: 'Malayalam' },
];

const RadiusControl: FC<Props> = ({ radius, onRadiusChange, language, onLanguageChange }) => (
  <div className="flex items-center gap-3 flex-wrap">
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-400">📏 Radius:</label>
      <select value={radius} onChange={e => onRadiusChange(Number(e.target.value))} className="bg-slate-800 border border-slate-600 text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500">
        {[2, 3, 5, 10, 15, 20, 30].map(r => <option key={r} value={r}>{r} km</option>)}
      </select>
    </div>
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-400">🌐 Voice:</label>
      <select value={language} onChange={e => onLanguageChange(e.target.value)} className="bg-slate-800 border border-slate-600 text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500">
        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
    </div>
  </div>
);

export default RadiusControl;
