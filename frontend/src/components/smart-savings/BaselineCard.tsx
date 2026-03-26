import type { FC } from 'react';
import type { UserCityResult } from '../../types/smartSavings';
import { formatINR } from '../../services/smartSavingsApi';

const BaselineCard: FC<{ userCity: UserCityResult; procedure: string }> = ({ userCity, procedure }) => (
  <div className="bg-slate-900 rounded-xl shadow-sm border-2 border-orange-200 p-5">
    <div className="flex items-start justify-between flex-wrap gap-2">
      <div>
        <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">📍 Your City — {userCity.city}</p>
        <h3 className="text-lg font-bold text-white mt-1">{userCity.cheapest_hospital}</h3>
        <p className="text-sm text-slate-400">{procedure} — Cheapest in {userCity.city}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-orange-600">{formatINR(userCity.cheapest_price)}</p>
        <p className="text-xs text-slate-400 mt-1">Highest: {formatINR(userCity.most_expensive_price)}</p>
      </div>
    </div>
    <p className="text-sm text-slate-400 mt-3 border-t border-dashed border-slate-700 pt-3">
      👇 Can you do better? Check nearby cities below
    </p>
  </div>
);

export default BaselineCard;
