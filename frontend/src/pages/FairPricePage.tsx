import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import LanguageSelector from '../components/LanguageSelector'
import VoiceControls from '../components/VoiceControls'
import { speakFairPrice, type LanguageCode } from '../services/sarvamService'

export default function FairPricePage() {
  const [cities, setCities] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [city, setCity] = useState('')
  const [procedure, setProcedure] = useState('')
  const [quote, setQuote] = useState('')
  const [result, setResult] = useState<any>(null)
  const [language, setLanguage] = useState<LanguageCode>('en-IN')

  useEffect(() => {
    api.get('/comparison/cities').then(r => setCities(r.data))
    api.get('/comparison/procedures').then(r => setProcedures(r.data))
  }, [])

  const check = () => api.get('/comparison/fair-price-checker', { params: { city, procedure, quote } }).then(r => setResult(r.data))

  const handleSpeak = useCallback(async () => {
    if (!city || !procedure || !quote) return null
    try {
      const res = await speakFairPrice(city, procedure, parseFloat(quote), language)
      if (res.error) {
        console.warn('[Voice]', res.error)
        return null
      }
      return res
    } catch (err) {
      console.error('[Voice Error]', err)
      return null
    }
  }, [city, procedure, quote, language])

  return <div className="space-y-4">
    <div className="card p-4 grid md:grid-cols-5 gap-3 items-center">
      <select className="bg-slate-800 rounded-xl p-3" value={city} onChange={e => setCity(e.target.value)}><option value="">Select city</option>{cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}</select>
      <select className="bg-slate-800 rounded-xl p-3" value={procedure} onChange={e => setProcedure(e.target.value)}><option value="">Select procedure</option>{procedures.map(p => <option key={p.procedure_id} value={p.procedure_name}>{p.procedure_name}</option>)}</select>
      <input className="bg-slate-800 rounded-xl p-3" placeholder="Enter quoted amount" value={quote} onChange={e => setQuote(e.target.value)} />
      <LanguageSelector value={language} onChange={setLanguage} />
      <button className="bg-emerald-500 text-slate-950 rounded-xl p-3 font-semibold" onClick={check}>Check fairness</button>
    </div>

    {result && <div className="card p-5">
      <h2 className="text-xl font-semibold mb-2">{result.verdict || result.message}</h2>
      {result.found && <div className="grid md:grid-cols-2 gap-3 text-slate-300">
        <div>Median city price: ₹{result.median_price}</div>
        <div>Benchmark: ₹{result.benchmark_rate_real}</div>
        <div>Min: ₹{result.min_price}</div>
        <div>Max: ₹{result.max_price}</div>
        <div>Your quote delta vs median: ₹{result.delta_vs_median}</div>
        <div>Your quote delta vs benchmark: ₹{result.delta_vs_benchmark}</div>
      </div>}

      {/* Voice Controls */}
      {result.found && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <VoiceControls
            onSpeak={handleSpeak}
            language={language}
            disabled={!city || !procedure || !quote}
          />
        </div>
      )}
    </div>}
  </div>
}
