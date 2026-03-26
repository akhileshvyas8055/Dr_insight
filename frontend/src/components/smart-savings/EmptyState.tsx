import type { FC } from 'react';
import { formatINR } from '../../services/smartSavingsApi';

interface Props { type: 'initial' | 'no_savings' | 'no_data'; city?: string; hospital?: string; price?: number }

const EmptyState: FC<Props> = ({ type, city, hospital, price }) => {
  if (type === 'initial') return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🏙️</div>
      <h3 className="text-xl font-bold text-slate-700">Find Smart Savings</h3>
      <p className="text-slate-400 mt-2 max-w-md mx-auto">Select a city and procedure above to discover if traveling to a nearby city saves you money.</p>
    </div>
  );
  if (type === 'no_savings') return (
    <div className="bg-blue-900/30 border border-blue-200 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">😊</div>
      <h3 className="text-lg font-bold text-blue-800">Your city already has the best price!</h3>
      <p className="text-blue-600 mt-2">{hospital} in {city} at <strong>{formatINR(price || 0)}</strong> is cheapest even after factoring travel costs.</p>
    </div>
  );
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">📋</div>
      <h3 className="text-lg font-bold text-slate-700">No data available</h3>
      <p className="text-slate-400 mt-2">Try a different city or procedure.</p>
    </div>
  );
};

export default EmptyState;
