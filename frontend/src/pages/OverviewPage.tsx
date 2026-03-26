import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import MetricCard from '../components/MetricCard'

export default function OverviewPage() {
  const [data, setData] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  useEffect(() => {
    api.get('/analytics/overview').then(r => setData(r.data))
    api.get('/insights').then(r => setInsights(r.data))
  }, [])
  if (!data) return <div className="text-slate-400">Loading dashboard…</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard label="Hospitals" value={data.hospitals} />
        <MetricCard label="Price rows" value={data.price_rows} />
        <MetricCard label="Procedures" value={data.procedures} />
        <MetricCard label="Cities" value={data.cities} />
        <MetricCard label="Avg package price" value={`₹${data.avg_package_price}`} />
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Data note</h2>
        <p className="text-slate-300 leading-7">This build uses your uploaded hybrid demo dataset. Benchmark procedures, rates, and city coverage come from real uploaded data sources, while many hospital-level price rows are augmented for demo-scale analytics and product presentation.</p>
      </div>
      {insights && <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5"><h3 className="font-semibold mb-3">Most expensive cities</h3>{insights.most_expensive_cities.map((r:any)=><div key={r.city} className="text-sm py-1">{r.city} — ₹{r.avg_price}</div>)}</div>
        <div className="card p-5"><h3 className="font-semibold mb-3">Highest variation procedures</h3>{insights.widest_spread_procedures.map((r:any)=><div key={r.procedure_name} className="text-sm py-1">{r.procedure_name}</div>)}</div>
        <div className="card p-5"><h3 className="font-semibold mb-3">Potential access gaps</h3>{insights.lowest_coverage_cities.map((r:any)=><div key={r.city} className="text-sm py-1">{r.city} — {r.hospital_count} hospitals</div>)}</div>
      </div>}
    </div>
  )
}
