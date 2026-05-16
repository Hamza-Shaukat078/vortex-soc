import { useMemo } from 'react'

const VERDICT_COLORS = {
  phishing:   { dot: 'bg-red-500', line: 'border-red-500/30', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  suspicious: { dot: 'bg-yellow-400', line: 'border-yellow-400/30', badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
  legitimate: { dot: 'bg-green-400', line: 'border-green-400/30', badge: 'bg-green-400/10 text-green-400 border-green-400/20' },
}

export default function TimelineView({ emails, onSelect }) {
  const sorted = useMemo(() =>
    [...emails].sort((a, b) => new Date(b.date) - new Date(a.date)),
  [emails])

  const grouped = useMemo(() => {
    const g = {}
    sorted.forEach(e => {
      const month = e.date ? e.date.slice(0, 7) : 'Unknown'
      if (!g[month]) g[month] = []
      g[month].push(e)
    })
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]))
  }, [sorted])

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-sm">Timeline appears once emails are logged</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([month, items]) => (
        <div key={month}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {formatMonth(month)}
            </span>
            <span className="text-xs text-gray-600">{items.length} email{items.length !== 1 ? 's' : ''}</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-800" />
            <div className="space-y-3">
              {items.map(email => {
                const c = VERDICT_COLORS[email.verdict] || VERDICT_COLORS.suspicious
                return (
                  <button key={email.id} onClick={() => onSelect(email.id)}
                    className="w-full text-left group">
                    <div className="relative flex items-start gap-3">
                      <div className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${c.dot} ring-2 ring-gray-950`} />
                      <div className={`flex-1 bg-gray-900 border rounded-xl px-4 py-3 transition-all group-hover:border-gray-600 ${c.line}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.badge}`}>
                            {email.verdict}
                          </span>
                          {email.spoofedBrand && (
                            <span className="text-xs text-gray-500">→ {email.spoofedBrand}</span>
                          )}
                          <span className="text-xs text-gray-600 ml-auto">{email.date}</span>
                        </div>
                        <p className="text-sm text-white font-medium truncate">{email.subject}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{email.sender}</p>
                        {email.redFlags?.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">{email.redFlags.length} red flags · {email.iocs?.length || 0} IOCs</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatMonth(m) {
  if (m === 'Unknown') return 'Unknown Date'
  const [year, month] = m.split('-')
  return new Date(+year, +month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
