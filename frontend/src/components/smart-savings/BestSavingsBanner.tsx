import type { FC } from 'react';
import type { BestRecommendation } from '../../types/smartSavings';
import { formatINR } from '../../services/smartSavingsApi';

const BestSavingsBanner: FC<{ recommendation: BestRecommendation; baselinePrice: number }> = ({ recommendation: r, baselinePrice }) => (
  <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-5 sm:p-6 text-white">
    <div className="absolute top-0 right-0 text-[100px] opacity-10 leading-none select-none">🎉</div>
    <p className="text-green-100 text-sm font-medium">🏆 Best Savings Found!</p>
    <h2 className="text-xl sm:text-2xl font-bold mt-1">Save {formatINR(r.savings)} in {r.city}!</h2>
    <div className="flex items-center gap-3 mt-3 flex-wrap">
      <span className="line-through text-green-200 text-lg">{formatINR(baselinePrice)}</span>
      <span className="text-2xl font-bold">{formatINR(r.total_cost)}</span>
      <span className="bg-white/20 text-sm font-bold px-2 py-0.5 rounded-full">{r.savings_percentage.toFixed(0)}% OFF</span>
    </div>
    <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${100 - r.savings_percentage}%` }} />
    </div>
    <p className="text-sm text-green-100 mt-2">{r.hospital} in {r.city} (incl. travel + stay)</p>
  </div>
);

export default BestSavingsBanner;
