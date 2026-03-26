import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import LandingPage from './pages/LandingPage'
import OverviewPage from './pages/OverviewPage'
import ComparisonPage from './pages/ComparisonPage'
import SmartSavingsPage from './pages/SmartSavingsPage'
import FairPricePage from './pages/FairPricePage'
import MapPage from './pages/MapPage'
import LeadsPage from './pages/admin/LeadsPage'
import TejasAIBot from './components/TejasAIBot'

export default function App() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 max-w-7xl mx-auto flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div className="flex items-center gap-0">
          <img src="/logo.png" alt="DR Insight Logo" className="w-32 h-auto drop-shadow-lg" />
          <div className="-ml-4">
            <h1 className="text-4xl font-bold">D₹ Insights</h1>
            <p className="text-slate-400 mt-2">India’s hospital price transparency and healthcare cost intelligence platform.</p>
          </div>
        </div>
        <Nav />
      </div>
      <main className="flex-1">
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/smart-savings" element={<SmartSavingsPage />} />
          <Route path="/fair-price" element={<FairPricePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin/leads" element={<LeadsPage />} />
        </Routes>
      </main>
      <footer className="mt-12 text-center text-slate-500 text-sm py-8 border-t border-slate-800/50 flex flex-col gap-3">
        <p>Made with ❤️ to empower Indian patients with healthcare price transparency</p>
        <p className="italic font-medium text-slate-400">
          &quot;When patients know what hospitals charge, markets work. Healthcare becomes affordable.&quot;
        </p>
        <div className="mt-3 flex flex-col gap-1 items-center">
          <p>© 2024 Medical Cost Roulette India - Exposing the Healthcare Pricing Insanity</p>
          <p>Created by <span className="font-semibold text-slate-400">Akhilesh Vyas</span></p>
        </div>
      </footer>
      <TejasAIBot />
    </div>
  )
}
