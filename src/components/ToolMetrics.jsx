import { FileSearch, ShieldAlert, Brain, FolderOpen } from 'lucide-react'

export default function ToolMetrics({ activity = {}, emails = [] }) {
  const h = activity.headers || { total: 0, spfFail: 0, dkimFail: 0, dmarcFail: 0, spfPass: 0, dkimPass: 0, dmarcPass: 0 }
  const vt = activity.vt || { total: 0, malicious: 0, suspicious: 0, clean: 0, unknown: 0 }
  const ai = activity.ai || { total: 0, phishing: 0, scam: 0, suspicious: 0, legitimate: 0 }

  const openCases   = emails.filter(e => e.caseStatus === 'open').length
  const inProgress  = emails.filter(e => e.caseStatus === 'in-progress').length
  const escalated   = emails.filter(e => e.caseStatus === 'escalated').length
  const closedCases = emails.filter(e => e.caseStatus === 'closed').length
  const authPasses  = h.spfPass + h.dkimPass + h.dmarcPass

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card Icon={FileSearch} iconColor="text-blue-400" label="Header Analyzer" value={h.total} unit="headers parsed" empty="No headers parsed yet">
        <Row label="SPF fail"   value={h.spfFail}   color="text-red-400" />
        <Row label="DKIM fail"  value={h.dkimFail}  color="text-red-400" />
        <Row label="DMARC fail" value={h.dmarcFail} color="text-red-400" />
        <Row label="Auth pass"  value={authPasses}  color="text-green-400" />
      </Card>

      <Card Icon={ShieldAlert} iconColor="text-red-400" label="VT Scanner" value={vt.total} unit="IOCs scanned" empty="No IOCs scanned yet">
        <Row label="Malicious"  value={vt.malicious}  color="text-red-400" />
        <Row label="Suspicious" value={vt.suspicious} color="text-yellow-400" />
        <Row label="Clean"      value={vt.clean}      color="text-green-400" />
        <Row label="Unknown"    value={vt.unknown}    color="text-gray-500" />
      </Card>

      <Card Icon={Brain} iconColor="text-purple-400" label="AI Analyzer" value={ai.total} unit="emails analyzed" empty="No emails analyzed yet">
        <Row label="Phishing"   value={ai.phishing}   color="text-red-400" />
        <Row label="Scam"       value={ai.scam}       color="text-orange-400" />
        <Row label="Suspicious" value={ai.suspicious} color="text-yellow-400" />
        <Row label="Legitimate" value={ai.legitimate} color="text-green-400" />
      </Card>

      <Card Icon={FolderOpen} iconColor="text-cyan-400" label="Cases" value={emails.length} unit="total cases" empty="No cases logged yet">
        <Row label="Open"        value={openCases}   color="text-sky-400" />
        <Row label="In progress" value={inProgress}  color="text-yellow-400" />
        <Row label="Escalated"   value={escalated}   color="text-red-400" />
        <Row label="Closed"      value={closedCases} color="text-green-400" />
      </Card>
    </div>
  )
}

function Card({ Icon, iconColor, label, value, unit, empty, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={15} className={iconColor} />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-4xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-gray-600">{unit}</p>
      {value > 0
        ? <div className="space-y-1.5 pt-1 border-t border-gray-800">{children}</div>
        : <p className="text-xs text-gray-700 italic">{empty}</p>
      }
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
