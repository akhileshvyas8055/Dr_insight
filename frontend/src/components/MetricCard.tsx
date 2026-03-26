export default function MetricCard({label, value}:{label:string, value:string|number}) {
  return <div className="card p-5"><div className="text-sm text-slate-400">{label}</div><div className="text-3xl font-semibold mt-2">{value}</div></div>
}
