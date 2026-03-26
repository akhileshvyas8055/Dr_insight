import { useEffect, useState, useCallback, FormEvent } from 'react'
import { api } from '../lib/api'
import LanguageSelector from '../components/LanguageSelector'
import VoiceControls from '../components/VoiceControls'
import { speakComparison, type LanguageCode } from '../services/sarvamService'
import { Calendar, Phone, CheckCircle2, X, Star } from 'lucide-react'

export default function ComparisonPage() {
  const [cities, setCities] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [city, setCity] = useState('')
  const [procedure, setProcedure] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [language, setLanguage] = useState<LanguageCode>('en-IN')

  // Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [leadType, setLeadType] = useState<'Book Appointment' | 'Contact Hospital'>('Contact Hospital')
  
  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    api.get('/comparison/cities').then(r => setCities(r.data))
    api.get('/comparison/procedures').then(r => setProcedures(r.data))
  }, [])

  const load = () => api.get('/comparison/prices', { params: { city: city || undefined, procedure: procedure || undefined } }).then(r => setRows(r.data))
  useEffect(() => { load() }, [city, procedure])

  const handleSpeak = useCallback(async () => {
    if (!city || !procedure) return null
    try {
      const result = await speakComparison(city, procedure, language)
      if (result.error) {
        console.warn('[Voice]', result.error)
        return null
      }
      return result
    } catch (err) {
      console.error('[Voice Error]', err)
      return null
    }
  }, [city, procedure, language])

  const handleTranscript = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase()
    const matchedCity = cities.find(c => lower.includes(c.city.toLowerCase()))
    const matchedProc = procedures.find(p => lower.includes(p.procedure_name.toLowerCase()))
    if (matchedCity) setCity(matchedCity.city)
    if (matchedProc) setProcedure(matchedProc.procedure_name)
  }, [cities, procedures])

  const openLeadModal = (hospital: any, type: 'Book Appointment' | 'Contact Hospital') => {
    setSelectedHospital(hospital)
    setLeadType(type)
    setIsModalOpen(true)
    setIsSuccess(false)
    setFullName('')
    setPhone('')
    setDate('')
    setMessage('')
  }

  const handleLeadSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/leads/', {
        hospital_name: selectedHospital.hospital_name,
        hospital_id: selectedHospital.hospital_id,
        city: selectedHospital.city,
        procedure_name: selectedHospital.procedure_name,
        procedure_id: selectedHospital.procedure_id,
        full_name: fullName,
        phone_number: phone,
        preferred_date: date,
        message: message,
        lead_type: leadType
      })
      setIsSuccess(true)
    } catch (error) {
      console.error("Failed to submit lead", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div className="space-y-4 relative">
    <div className="card p-4 grid md:grid-cols-4 gap-3 items-center">
      <select className="bg-slate-800 rounded-xl p-3" value={city} onChange={e => setCity(e.target.value)}>
        <option value="">All cities</option>
        {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
      </select>
      <select className="bg-slate-800 rounded-xl p-3" value={procedure} onChange={e => setProcedure(e.target.value)}>
        <option value="">All procedures</option>
        {procedures.map(p => <option key={p.procedure_id} value={p.procedure_name}>{p.procedure_name}</option>)}
      </select>
      <LanguageSelector value={language} onChange={setLanguage} />
      <button className="bg-emerald-500 text-slate-950 rounded-xl p-3 font-semibold hover:bg-emerald-400 transition" onClick={load}>Refresh</button>
    </div>

    {/* Voice Controls */}
    {city && procedure && (
      <div className="card p-4">
        <VoiceControls
          onSpeak={handleSpeak}
          onTranscript={handleTranscript}
          language={language}
          disabled={!city || !procedure}
        />
      </div>
    )}

    <div className="card overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-left bg-slate-800">
          <tr>
            <th className="p-3">Hospital</th>
            <th className="p-3 whitespace-nowrap">City</th>
            <th className="p-3 whitespace-nowrap">Procedure</th>
            <th className="p-3">Benchmark</th>
            <th className="p-3">Package</th>
            <th className="p-3">Band</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
              <td className="p-3">
                <div className="font-medium">{r.hospital_name}</div>
                {r.rating ? (
                  <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {r.rating} / 5
                  </div>
                ) : null}
              </td>
              <td className="p-3 text-slate-300">{r.city}</td>
              <td className="p-3 text-slate-300">{r.procedure_name}</td>
              <td className="p-3 text-slate-400">₹{r.benchmark_rate_real}</td>
              <td className="p-3 font-semibold text-emerald-400">₹{r.package_price_demo}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs px-2 ${r.fairness_band === 'Under benchmark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {r.fairness_band}
                </span>
              </td>
              <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openLeadModal(r, 'Book Appointment')}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </button>
                  <button 
                    onClick={() => openLeadModal(r, 'Contact Hospital')}
                    className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Contact
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="p-6 text-center text-slate-400">No procedures found. Try changing filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>

    {city && procedure && rows.length > 0 && (
      <div className="mt-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="font-bold text-blue-300">Did you know?</h3>
            <p className="text-blue-400 text-sm mt-1">
              You might save ₹50,000 — ₹2,00,000 by traveling to a nearby city!
              Travel + stay costs included.
            </p>
            <a href={`/smart-savings?city=${encodeURIComponent(city)}&procedure=${encodeURIComponent(procedure)}`}
              className="inline-flex items-center gap-1 mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
              🏙️ Check Nearby City Savings →
            </a>
          </div>
        </div>
      </div>
    )}
    {/* Lead Modal Overlay */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 relative">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
              <p className="text-slate-300">Hospital will contact you within 2 hours.</p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-xl transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">{leadType}</h2>
              <p className="text-slate-400 text-sm mb-5">
                {selectedHospital?.hospital_name} - {selectedHospital?.procedure_name}
              </p>
              
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1">Phone Number</label>
                  <input 
                    type="tel" required
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1">Preferred Date</label>
                  <input 
                    type="date" required
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={date} onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 font-medium mb-1">Message (Optional)</label>
                  <textarea 
                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    rows={3}
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Any specific questions or health conditions?"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
                >
                  {isSubmitting ? 'Sending Request...' : 'Submit Request'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    )}
  </div>
}
