import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Download, Filter, Search, Calendar, Phone, Activity } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [hospital, setHospital] = useState('')
  const [city, setCity] = useState('')
  const [procedure, setProcedure] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/leads/', {
        params: { 
          hospital: hospital || undefined, 
          city: city || undefined, 
          procedure: procedure || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      })
      setLeads(data)
    } catch (err) {
      console.error("Failed to fetch leads", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" /> Lead Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review and manage incoming patient inquiries and appointment requests</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium transition text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-300">
          <Filter className="w-4 h-4" /> Filter Leads
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" placeholder="Search Hospital..."
              value={hospital} onChange={e => setHospital(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" placeholder="Search City..."
              value={city} onChange={e => setCity(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" placeholder="Search Procedure..."
              value={procedure} onChange={e => setProcedure(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <input 
            type="date" 
            value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <div className="flex gap-2">
            <input 
              type="date" 
              value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={fetchLeads}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg font-medium transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Date / Time</th>
              <th className="px-6 py-4">Lead Info</th>
              <th className="px-6 py-4">Request Type</th>
              <th className="px-6 py-4">Hospital & Details</th>
              <th className="px-6 py-4 rounded-tr-xl">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading leads...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No leads found matching your criteria.</td></tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {new Date(lead.created_at).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{lead.full_name}</div>
                    <div className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {lead.phone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      lead.lead_type === 'Book Appointment' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.lead_type}
                    </span>
                    <div className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Pref: {lead.preferred_date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{lead.hospital_name}</div>
                    <div className="text-slate-400 text-xs mt-1">{lead.procedure_name} • {lead.city}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic max-w-xs truncate" title={lead.message}>
                    {lead.message || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
