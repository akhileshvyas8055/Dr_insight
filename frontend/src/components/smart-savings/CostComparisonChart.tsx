import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { UserCityResult, NearbyCitySaving } from '../../types/smartSavings';
import { formatLakh } from '../../services/smartSavingsApi';

const CostComparisonChart: FC<{ userCity: UserCityResult; savings: NearbyCitySaving[] }> = ({ userCity, savings }) => {
  const data = [
    { city: userCity.city + ' (You)', hospital: userCity.cheapest_price, travel: 0, stay: 0, isUser: true },
    ...savings.map(s => ({
      city: s.city, hospital: s.procedure_price,
      travel: s.travel_cost_breakdown.round_trip_total,
      stay: s.travel_cost_breakdown.hotel_total, isUser: false,
    })),
  ];

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-5">
      <h3 className="text-lg font-semibold text-white mb-1">📊 Total Cost Comparison</h3>
      <p className="text-sm text-slate-400 mb-4">Hospital + Travel + Stay</p>
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 60)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis type="number" tickFormatter={v => formatLakh(v)} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="city" width={110} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: number) => formatLakh(v)} />
          <Legend />
          <Bar dataKey="hospital" stackId="a" name="🏥 Hospital">
            {data.map((d, i) => <Cell key={i} fill={d.isUser ? '#EA580C' : '#16A34A'} />)}
          </Bar>
          <Bar dataKey="travel" stackId="a" fill="#2563EB" name="🚆 Travel" />
          <Bar dataKey="stay" stackId="a" fill="#7C3AED" name="🛏️ Stay" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostComparisonChart;
