/**
 * LanguageSelector — dropdown for selecting an Indian language.
 * Visually matches the existing app's dark theme and rounded pill style.
 */
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../services/sarvamService';

interface Props {
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-sm text-slate-400 whitespace-nowrap">🌐 Language</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                   transition-all duration-200 cursor-pointer appearance-none pr-8"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.7rem center',
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
