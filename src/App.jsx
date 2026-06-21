import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { LayoutDashboard, Bot, MailSearch, ShieldAlert, Clock, Layers, Users, BarChart3, Settings, Keyboard, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { loadEmails, addEmail, deleteEmail, updateEmail } from './utils/storage'
import { loadActivity } from './utils/activityStorage'
import { exportJSON, exportHTML, exportIOCsCSV, exportSTIX } from './utils/exportReport'
import { parseEml } from './utils/parseEml'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import MetricsBar from './components/MetricsBar'
import AddEmailForm from './components/AddEmailForm'
import EmailLog from './components/EmailLog'
import DetailPanel from './components/DetailPanel'
import Charts from './components/Charts'
import EmailAnalyzer from './components/EmailAnalyzer'
import HeaderAnalyzer from './components/HeaderAnalyzer'
import VTScanner from './components/VTScanner'
import CampaignView from './components/CampaignView'
import TimelineView from './components/TimelineView'
import ThreatActors from './components/ThreatActors'
import SearchFilter from './components/SearchFilter'
import StatsView from './components/StatsView'
import ShortcutsModal from './components/ShortcutsModal'
import ToolMetrics from './components/ToolMetrics'
import SettingsModal from './components/SettingsModal'
import SplashScreen from './components/SplashScreen'

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard',     Icon: LayoutDashboard },
  { id: 'analyzer',  label: 'AI Analyzer',   Icon: Bot },
  { id: 'headers',   label: 'Headers',       Icon: MailSearch },
  { id: 'scanner',   label: 'VT Scanner',    Icon: ShieldAlert },
  { id: 'timeline',  label: 'Timeline',      Icon: Clock },
  { id: 'campaigns', label: 'Campaigns',     Icon: Layers },
  { id: 'actors',    label: 'Threat Actors', Icon: Users },
  { id: 'stats',     label: 'Stats',         Icon: BarChart3 },
]

function ViewTitle({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-base text-gray-500 mt-1">{subtitle}</p>
    </motion.div>
  )
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [emails, setEmails] = useState(() => loadEmails())
  const [activity, setActivity] = useState(() => loadActivity())
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [view, setView] = useState('dashboard')
  const [prefill, setPrefill] = useState(null)
  const [toast, setToast] = useState(null)
  const [query, setQuery] = useState('')
  const [verdictFilter, setVerdictFilter] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const emlRef = useRef()
  const searchRef = useRef()

  const selectedEmail = emails.find(e => e.id === selectedId) || null

  const filteredEmails = useMemo(() => {
    const q = query.toLowerCase()
    return emails.filter(e => {
      const matchQuery = !q ||
        e.sender?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.spoofedBrand?.toLowerCase().includes(q)
      const matchVerdict = !verdictFilter || e.verdict === verdictFilter
      return matchQuery && matchVerdict
    })
  }, [emails, query, verdictFilter])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleAdd(entry) {
    setEmails(prev => addEmail(prev, entry))
    showToast(`Email logged — ${entry.verdict}`)
  }

  function handleDelete(id) {
    if (selectedId === id) setSelectedId(null)
    setEmails(prev => deleteEmail(prev, id))
    showToast('Entry deleted', 'warn')
  }

  function handleUpdate(updated) {
    setEmails(prev => updateEmail(prev, updated))
  }

  const kbHandlers = useCallback({
    onNew:    () => setShowForm(true),
    onEscape: () => { setShowForm(false); setShowShortcuts(false); setPrefill(null) },
    onHelp:   () => setShowShortcuts(v => !v),
    onSearch: () => searchRef.current?.focus(),
    onView:   i  => { const v = VIEWS[i]; if (v) setView(v.id) },
    onDelete: () => { if (selectedId) handleDelete(selectedId) },
  }, [selectedId])

  function handleSaveFromAnalyzer(entry) {
    setPrefill(entry)
    setShowForm(true)
  }

  function handleEmlUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const parsed = parseEml(ev.target.result)
      setPrefill({
        sender: parsed.sender || '',
        subject: parsed.subject || '',
        date: parsed.date || new Date().toISOString().slice(0, 10),
        spoofedBrand: '',
        verdict: 'suspicious',
        notes: parsed.body ? `Body preview:\n${parsed.body.slice(0, 500)}` : '',
        redFlags: [], tools: [], iocs: [], mitreTechniques: [],
      })
      setShowForm(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  useKeyboardShortcuts(kbHandlers)

  useEffect(() => {
    if (view === 'dashboard') setActivity(loadActivity())
  }, [view])

  function handleSelectFromView(id) {
    setSelectedId(id)
    setView('dashboard')
  }

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <div className="min-h-screen text-gray-100 font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(2,5,9,0.85)', backdropFilter: 'blur(20px)' }}>

        {/* Top accent line */}
        <div className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #ef4444, #3b82f6, #22c55e, transparent)' }} />

        <div className="px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              style={{ boxShadow: '0 0 16px rgba(239,68,68,0.35)' }}
            >
              <img src="./logo.png" alt="VORTEX" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tighter"
                style={{ background: 'linear-gradient(90deg, #fff 40%, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VORTEX
              </h1>
              <p className="text-xs text-gray-600 mt-0.5 font-mono tracking-widest uppercase">SOC Threat Analyzer</p>
            </div>
          </motion.div>

          {/* Nav */}
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
            {VIEWS.map((v, i) => (
              <motion.button
                key={v.id}
                onClick={() => setView(v.id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  view === v.id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {view === v.id && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', boxShadow: '0 0 20px rgba(239,68,68,0.15), inset 0 0 1px rgba(239,68,68,0.3)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <v.Icon size={13} className="relative opacity-60" />
                <span className="relative">{v.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-gray-600 hover:text-gray-300 transition-all"
              title="API Keys / Settings">
              <Settings size={14} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowShortcuts(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-gray-600 hover:text-gray-300 transition-all"
              title="Keyboard shortcuts">
              <Keyboard size={14} />
            </motion.button>
            <input ref={emlRef} type="file" accept=".eml,.txt" onChange={handleEmlUpload} className="hidden" />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => emlRef.current?.click()}
              className="border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-all font-medium flex items-center gap-1.5">
              <Upload size={12} /> .eml
            </motion.button>

            <div className="relative">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowExport(v => !v)} disabled={emails.length === 0}
                className="border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs px-3 py-2 rounded-xl transition-all disabled:opacity-30 font-medium">
                Export ↓
              </motion.button>
              <AnimatePresence>
                {showExport && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    style={{ background: 'rgba(10,14,20,0.95)', backdropFilter: 'blur(20px)' }}
                  >
                    {[
                      ['HTML Report', () => exportHTML(emails)],
                      ['JSON Data',   () => exportJSON(emails)],
                      ['IOCs CSV',    () => exportIOCsCSV(emails)],
                      ['STIX Bundle', () => exportSTIX(emails)],
                    ].map(([label, fn], i) => (
                      <motion.button key={label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { fn(); setShowExport(false) }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        {label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="relative overflow-hidden text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
            >
              <span className="relative z-10">+ Log Email</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="p-8 max-w-8xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'dashboard' && (
              <>
                <MetricsBar emails={emails} />
                <div className="mb-6">
                  <ToolMetrics activity={activity} emails={emails} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    <SearchFilter query={query} setQuery={setQuery} verdict={verdictFilter} setVerdict={setVerdictFilter} inputRef={searchRef} />
                    <EmailLog emails={filteredEmails} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDelete} />
                  </div>
                  <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                      {selectedEmail
                        ? <DetailPanel key={selectedEmail.id} email={selectedEmail} onUpdate={handleUpdate} />
                        : <Charts key="charts" emails={emails} />
                      }
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            {view === 'analyzer' && (
              <div className="max-w-2xl mx-auto">
                <ViewTitle title="AI Email Analyzer" subtitle="Paste any email — VORTEX detects phishing, scams, and malicious content automatically" />
                <EmailAnalyzer onSaveToLog={handleSaveFromAnalyzer} />
              </div>
            )}

            {view === 'headers' && (
              <div className="max-w-2xl mx-auto">
                <ViewTitle title="Header Analyzer" subtitle="Parse SPF, DKIM, DMARC and routing hops from raw headers" />
                <HeaderAnalyzer />
              </div>
            )}

            {view === 'scanner' && (
              <div className="max-w-2xl mx-auto">
                <ViewTitle title="VirusTotal Scanner" subtitle="Check URLs, IPs, domains and file hashes against 70+ engines" />
                <VTScanner />
              </div>
            )}

            {view === 'timeline' && (
              <div className="max-w-2xl mx-auto">
                <ViewTitle title="Attack Timeline" subtitle="Chronological view of all analyzed emails" />
                <TimelineView emails={emails} onSelect={handleSelectFromView} />
              </div>
            )}

            {view === 'campaigns' && (
              <div className="max-w-3xl mx-auto">
                <ViewTitle title="Campaign Groups" subtitle="Emails grouped by spoofed brand or sender domain" />
                <CampaignView emails={emails} onSelect={handleSelectFromView} />
              </div>
            )}

            {view === 'actors' && (
              <div className="max-w-5xl mx-auto">
                <ViewTitle title="Threat Actor Profiles" subtitle="Sender domain intelligence and attack patterns" />
                <ThreatActors emails={emails} onSelect={handleSelectFromView} />
              </div>
            )}

            {view === 'stats' && (
              <div className="max-w-5xl mx-auto">
                <ViewTitle title="Statistics & Trends" subtitle="Volume over time, top brands, IOC breakdown, MITRE coverage" />
                <StatsView emails={emails} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-medium border border-white/10"
            style={{ background: 'rgba(10,14,20,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(34,197,94,0.1)' }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
              className={toast.type === 'warn' ? 'text-yellow-400' : 'text-green-400'}
            >
              {toast.type === 'warn' ? '⚠' : '✓'}
            </motion.span>
            <span className="text-gray-200">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {showExport && <div className="fixed inset-0 z-30" onClick={() => setShowExport(false)} />}

      <AnimatePresence>
        {showForm && (
          <AddEmailForm
            onAdd={handleAdd}
            onClose={() => { setShowForm(false); setPrefill(null) }}
            prefill={prefill}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
