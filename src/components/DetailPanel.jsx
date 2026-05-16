import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TACTIC_COLORS } from '../utils/mitre'
import CasePanel from './CasePanel'
import { getStatus } from '../utils/cases'

const VERDICT_STYLES = {
  phishing:   { badge: 'bg-red-500/10 text-red-400 border-red-500/20',    label: 'Confirmed Phishing', color: '#ef4444', glow: 'glow-red'    },
  suspicious: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Suspicious',  color: '#eab308', glow: 'glow-yellow' },
  legitimate: { badge: 'bg-green-500/10 text-green-400 border-green-500/20',  label: 'Legitimate',    color: '#22c55e', glow: 'glow-green'  },
}

const IOC_COLORS = {
  IP:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  URL:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Domain: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Hash:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Email:  'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

export default function DetailPanel({ email, onUpdate }) {
  const [tab, setTab] = useState('overview')
  const s = VERDICT_STYLES[email.verdict] || VERDICT_STYLES.suspicious
  const caseStatus = getStatus(email.caseStatus || 'open')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`border border-white/5 rounded-2xl flex flex-col overflow-hidden ${s.glow}`}
      style={{ background: 'rgba(10,14,20,0.9)', backdropFilter: 'blur(16px)', minHeight: 420 }}
    >
      {/* Top banner */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5"
        style={{ background: `linear-gradient(135deg, ${s.color}08, transparent)` }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-white leading-snug flex-1">{email.subject}</h3>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${s.badge}`}
            style={{ boxShadow: `0 0 12px ${s.color}30` }}>
            {s.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-gray-600 font-mono">{email.sender}</p>
          {email.caseId && (
            <span className="text-xs font-mono text-gray-700">· {email.caseId}</span>
          )}
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${caseStatus.bg} ${caseStatus.border} ${caseStatus.text}`}>
            {caseStatus.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0">
        {['overview', 'iocs', 'notes', 'case'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative flex-1 py-3 text-sm font-medium capitalize transition-all flex items-center justify-center gap-2 ${
              tab === t ? 'text-white' : 'text-gray-600 hover:text-gray-400'
            }`}>
            {tab === t && (
              <motion.div layoutId="detail-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            )}
            {t === 'iocs' ? 'IOCs' : t === 'case' ? 'Case' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'iocs' && email.iocs?.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: `${s.color}20`, color: s.color }}>
                {email.iocs.length}
              </span>
            )}
            {t === 'overview' && email.redFlags?.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono bg-red-500/10 text-red-400">
                {email.redFlags.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <Section title="Details">
              <Row label="Date" value={formatDate(email.date)} />
              {email.spoofedBrand && <Row label="Spoofed Brand" value={email.spoofedBrand} />}
              {email.tools?.length > 0 && (
                <div className="flex items-start gap-2 py-1.5">
                  <span className="text-xs text-gray-500 w-28 shrink-0 pt-0.5">Tools Used</span>
                  <div className="flex flex-wrap gap-1.5">
                    {email.tools.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {email.redFlags?.length > 0 && (
              <Section title={`Red Flags (${email.redFlags.length})`}>
                <div className="space-y-1">
                  {email.redFlags.map(flag => (
                    <div key={flag} className="flex items-center gap-2 text-xs text-red-300">
                      <span className="text-red-500">▸</span>
                      {flag}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {email.mitreTechniques?.length > 0 && (
              <Section title="MITRE ATT&CK">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {email.mitreTechniques.map(t => {
                    const color = TACTIC_COLORS[t.tactic] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    return (
                      <span key={t.id} className={`text-xs px-2 py-1 rounded-md border ${color}`}>
                        <span className="font-mono font-bold">{t.id}</span>
                        <span className="ml-1 opacity-80">{t.name}</span>
                      </span>
                    )
                  })}
                </div>
              </Section>
            )}
          </>
        )}

        {/* IOCs */}
        {tab === 'iocs' && (
          email.iocs?.length > 0 ? (
            <div className="space-y-2">
              {email.iocs.map((ioc, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${IOC_COLORS[ioc.type] || IOC_COLORS.IP}`}>
                  <span className="text-xs font-bold w-14 shrink-0">{ioc.type}</span>
                  <span className="text-xs font-mono text-gray-200 break-all">{ioc.value}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No IOCs recorded</p>
          )
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          email.notes?.trim() ? (
            <div className="rounded-xl border border-white/5 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{email.notes}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No notes recorded</p>
          )
        )}

        {/* CASE */}
        {tab === 'case' && <CasePanel email={email} onUpdate={onUpdate} />}
      </div>
    </motion.div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="divide-y divide-gray-800">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-xs text-gray-200">{value}</span>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}
