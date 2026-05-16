import { useMemo, useState } from 'react'

export default function ThreatActors({ emails, onSelect }) {
  const [selected, setSelected] = useState(null)

  const actors = useMemo(() => {
    const map = {}
    emails.forEach(e => {
      const domain = extractDomain(e.sender)
      if (!domain) return
      if (!map[domain]) map[domain] = {
        domain,
        emails: [],
        brands: new Set(),
        techniques: new Set(),
      }
      map[domain].emails.push(e)
      if (e.spoofedBrand) map[domain].brands.add(e.spoofedBrand)
      ;(e.mitreTechniques || []).forEach(t => map[domain].techniques.add(`${t.id} ${t.name}`))
    })
    return Object.values(map)
      .sort((a, b) => b.emails.length - a.emails.length)
  }, [emails])

  const actor = actors.find(a => a.domain === selected)
  const phishingRate = actor
    ? Math.round((actor.emails.filter(e => e.verdict === 'phishing').length / actor.emails.length) * 100)
    : 0

  if (actors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <span className="text-4xl mb-3">🕵️</span>
        <p className="text-sm">Threat actor profiles build up as you log emails</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Actor list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sender Domains</p>
        {actors.map(a => {
          const phishing = a.emails.filter(e => e.verdict === 'phishing').length
          const rate = Math.round((phishing / a.emails.length) * 100)
          const threat = rate >= 70 ? 'HIGH' : rate >= 30 ? 'MED' : 'LOW'
          const threatColor = rate >= 70 ? 'text-red-400 bg-red-400/10 border-red-400/20'
            : rate >= 30 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            : 'text-green-400 bg-green-400/10 border-green-400/20'

          return (
            <button key={a.domain} onClick={() => setSelected(a.domain === selected ? null : a.domain)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                selected === a.domain ? 'border-gray-600 bg-gray-800' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}>
              <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                {a.domain.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{a.domain}</p>
                <p className="text-xs text-gray-500">{a.emails.length} emails · {phishing} phishing</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md border ${threatColor}`}>{threat}</span>
            </button>
          )
        })}
      </div>

      {/* Actor detail */}
      <div>
        {actor ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">{actor.domain}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{phishingRate}% phishing rate</p>
            </div>

            <StatRow label="Total Emails" value={actor.emails.length} />
            <StatRow label="Phishing" value={actor.emails.filter(e => e.verdict === 'phishing').length} color="text-red-400" />
            <StatRow label="Suspicious" value={actor.emails.filter(e => e.verdict === 'suspicious').length} color="text-yellow-400" />

            {actor.brands.size > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Spoofed Brands</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...actor.brands].map(b => (
                    <span key={b} className="text-xs px-2 py-0.5 rounded-md bg-orange-400/10 border border-orange-400/20 text-orange-400">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {actor.techniques.size > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">MITRE Techniques</p>
                <div className="space-y-1">
                  {[...actor.techniques].map(t => (
                    <p key={t} className="text-xs text-gray-400 font-mono">{t}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-2">Recent Emails</p>
              <div className="space-y-1.5">
                {actor.emails.slice(0, 4).map(e => (
                  <button key={e.id} onClick={() => onSelect(e.id)}
                    className="w-full text-left text-xs text-gray-400 hover:text-white truncate transition-colors">
                    ▸ {e.subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full py-12 text-gray-600 text-sm">
            Select a domain to view profile
          </div>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${color || 'text-white'}`}>{value}</span>
    </div>
  )
}

function extractDomain(email) {
  const m = email?.match(/@([\w.-]+)/)
  return m ? m[1] : null
}
