import type { FC } from 'react';

interface Props {
  cities: Array<{ id: number; name: string } | string>;
  procedures: Array<{ id: number; name: string; category?: string } | { procedure_name: string }>;
  languages: Array<{ code: string; name: string }>;
  city: string; procedure: string; language: string;
  onCityChange: (v: string) => void;
  onProcedureChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const SelectionBar: FC<Props> = (p) => (
  <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-4 sm:p-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">📍 City</label>
        <select value={p.city} onChange={e => p.onCityChange(e.target.value)}
          className="w-full border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900 text-white">
          <option value="">Select City</option>
          {p.cities.map((c: any) => {
            const val = typeof c === 'string' ? c : (c.city || c.name);
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">🩺 Procedure</label>
        <select value={p.procedure} onChange={e => p.onProcedureChange(e.target.value)}
          className="w-full border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900 text-white">
          <option value="">Select Procedure</option>
          {p.procedures.map((pr: any) => {
             const val = pr.procedure_name || pr.name;
             return <option key={val} value={val}>{val}</option>;
          })}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">🌐 Voice Language</label>
        <select value={p.language} onChange={e => p.onLanguageChange(e.target.value)}
          className="w-full border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900 text-white">
          {p.languages.map((l: any) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>
      <div className="flex items-end">
        <button onClick={p.onSearch} disabled={p.loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
          {p.loading ? <><span className="animate-spin">⏳</span> Searching...</> : <>🔍 Find Savings</>}
        </button>
      </div>
    </div>
  </div>
);

export default SelectionBar;
