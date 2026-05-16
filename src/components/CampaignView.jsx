import { useMemo, useState } from 'react'

const VERDICT_STYLE = {
  phishing:   'text-red-400 bg-red-400/10 border-red-400/20',
  suspicious: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  legitimate: 'text-green-400 bg-green-400/10 border-green-400/20',
}

export default function CampaignView({ emails, onSelect }) {
  const [expanded, setExpanded] = useState(null)

  const campaigns = useMemo(() => {
    const groups = {}
    emails.forEach(email => {
      const key = email.spoofedBrand?.toLowerCase().trim() || extractDomain(email.sender)
      if (!key) return
      if (!groups[key]) groups[key] = { key, label: email.spoofedBrand || extractDomain(email.sender), emails: [] }
      groups[key].emails.push(email)
    })
    return Object.values(groups)
      .filter(g => g.emails.length >= 1)
      .sort((a, b) => b.emails.length - a.emails.length)
  }, [emails])

  const ungrouped = emails.filter(e => !e.spoofedBrand?.trim() && !extractDomain(e.sender))

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <span className="text-4xl mb-3">🗂️</span>
        <p className="text-sm">Campaigns appear when multiple emails share a spoofed brand or sender domain</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {campaigns.map(campaign => {
        const isOpen = expanded === campaign.key
        const phishCount = campaign.emails.filter(e => e.verdict === 'phishing').length
        const allVerdicts = [...new Set(campaign.emails.map(e => e.verdict))]
        const dominantVerdict = phishCount > 0 ? 'phishing' : allVerdicts[0]
        const s = VERDICT_STYLE[dominantVerdict] || VERDICT_STYLE.suspicious

        return (
          <div key={campaign.key} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : campaign.key)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border ${s}`}>
                {campaign.label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{campaign.label}</p>
                <p className="text-xs text-gray-500">
                  {campaign.emails.length} email{campaign.emails.length !== 1 ? 's' : ''}
                  {phishCount > 0 && <span className="text-red-400 ml-2">· {phishCount} phishing</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allVerdicts.map(v => (
                  <span key={v} className={`text-xs px-2 py-0.5 rounded-full border ${VERDICT_STYLE[v]}`}>
                    {v}
                  </span>
                ))}
                <span className="text-gray-600 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                {campaign.emails.map(email => (
                  <button key={email.id} onClick={() => onSelect(email.id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors text-left">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      email.verdict === 'phishing' ? 'bg-red-400' :
                      email.verdict === 'suspicious' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{email.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{email.sender}</p>
                    </div>
                    <span className="text-xs text-gray-600 shrink-0">{email.date}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function extractDomain(email) {
  const m = email?.match(/@([\w.-]+)/)
  return m ? m[1] : null
}
