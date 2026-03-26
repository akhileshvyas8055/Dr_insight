import { Link, useLocation } from 'react-router-dom'

const items = [
  ['/overview', 'Overview'],
  ['/comparison', 'Price Comparison'],
  ['/smart-savings', 'Smart Savings'],
  ['/fair-price', 'Fair Price'],
  ['/map', 'Map'],
  ['/admin/leads', 'Leads'],
]

export default function Nav() {
  const location = useLocation()
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map(([to, label]) => (
        <Link key={to} to={to} className={`px-4 py-2 rounded-xl text-sm ${location.pathname===to ? 'bg-emerald-500 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-200'}`}>
          {label}
        </Link>
      ))}
    </nav>
  )
}
