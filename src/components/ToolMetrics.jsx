export default function ToolMetrics({ activity = {}, emails = [] }) {
  const h = activity.headers || { total: 0, spfFail: 0, dkimFail: 0, dmarcFail: 0, spfPass: 0, dkimPass: 0, dmarcPass: 0 }
  const vt = activity.vt || { total: 0, malicious: 0, suspicious: 0, clean: 0, unknown: 0 }
  const ai = activity.ai || { total: 0, phishing: 0, scam: 0, suspicious: 0, legitimate: 0 }

  const openCases    = emails.filter(e => e.caseStatus === 'open').length
  const inProgress   = emails.filter(e => e.caseStatus === 'in-progress').length
  const escalated    = emails.filter(e => e.caseStatus === 'escalated').length
  const closedCases  = emails.filter(e => e.caseStatus === 'closed').length

  const authFails = h.spfFail + h.dkimFail + h.dmarcFail
  const authPasses = h.spfPass + h.dkimPass + h.dmarcPass

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Header Analyzer */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-base">⊞</span>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Header Analyzer</p>
        </div>
        <p className="text-4xl font-bold text-white tabular-nums">{h.total}</p>
        <p className="text-xs text-gray-600">headers parsed</p>
        {h.total > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-gray-800">
            <Row label="SPF fail" value={h.spfFail} color="text-red-400" />
            <Row label="DKIM fail" value={h.dkimFail} color="text-red-400" />
            <Row label="DMARC fail" value={h.dmarcFail} color="text-red-400" />
            <Row label="Auth pass" value={authPasses} color="text-green-400" />
          </div>
        )}
        {h.total === 0 && <p className="text-xs text-gray-700 italic">No headers parsed yet</p>}
      </div>

      {/* VT Scanner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-base">⬡</span>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">VT Scanner</p>
        </div>
        <p className="text-4xl font-bold text-white tabular-nums">{vt.total}</p>
        <p className="text-xs text-gray-600">IOCs scanned</p>
        {vt.total > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-gray-800">
            <Row label="Malicious" value={vt.malicious} color="text-red-400" />
            <Row label="Suspicious" value={vt.suspicious} color="text-yellow-400" />
            <Row label="Clean" value={vt.clean} color="text-green-400" />
            <Row label="Unknown" value={vt.unknown} color="text-gray-500" />
          </div>
        )}
        {vt.total === 0 && <p className="text-xs text-gray-700 italic">No IOCs scanned yet</p>}
      </div>

      {/* AI Analyzer */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-base">◈</span>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Analyzer</p>
        </div>
        <p className="text-4xl font-bold text-white tabular-nums">{ai.total}</p>
        <p className="text-xs text-gray-600">emails analyzed</p>
        {ai.total > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-gray-800">
            <Row label="Phishing" value={ai.phishing} color="text-red-400" />
            <Row label="Scam" value={ai.scam} color="text-orange-400" />
            <Row label="Suspicious" value={ai.suspicious} color="text-yellow-400" />
            <Row label="Legitimate" value={ai.legitimate} color="text-green-400" />
          </div>
        )}
        {ai.total === 0 && <p className="text-xs text-gray-700 italic">No emails analyzed yet</p>}
      </div>

      {/* Cases */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-base">◉</span>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cases</p>
        </div>
        <p className="text-4xl font-bold text-white tabular-nums">{emails.length}</p>
        <p className="text-xs text-gray-600">total cases</p>
        {emails.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-gray-800">
            <Row label="Open" value={openCases} color="text-sky-400" />
            <Row label="In progress" value={inProgress} color="text-yellow-400" />
            <Row label="Escalated" value={escalated} color="text-red-400" />
            <Row label="Closed" value={closedCases} color="text-green-400" />
          </div>
        )}
        {emails.length === 0 && <p className="text-xs text-gray-700 italic">No cases logged yet</p>}
      </div>
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
