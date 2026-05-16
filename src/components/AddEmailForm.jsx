import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MITRE_TECHNIQUES, TACTIC_COLORS } from '../utils/mitre'

const EMPTY = {
  sender: '',
  subject: '',
  date: new Date().toISOString().slice(0, 10),
  spoofedBrand: '',
  verdict: 'phishing',
  notes: '',
  redFlags: [],
  tools: [],
  iocs: [],
  mitreTechniques: [],
}

const VERDICTS = [
  { value: 'phishing', label: 'Confirmed Phishing', color: 'text-red-400' },
  { value: 'suspicious', label: 'Suspicious', color: 'text-yellow-400' },
  { value: 'legitimate', label: 'Legitimate', color: 'text-green-400' },
]

const RED_FLAGS = [
  'Urgency / pressure language',
  'Spoofed sender domain',
  'Suspicious links / URLs',
  'Generic greeting',
  'Spelling / grammar errors',
  'Unexpected attachment',
  'Requests credentials',
  'Mismatched display URL',
  'Unusual sender address',
  'Impersonates authority',
  'Too-good-to-be-true offer',
  'Suspicious HTML / encoding',
]

const TOOLS = [
  'VirusTotal',
  'PhishTool',
  'MXToolbox',
  'URLScan.io',
  'AnyRun',
  'Whois',
  'Manual Analysis',
]

const IOC_TYPES = ['IP', 'URL', 'Domain', 'Hash', 'Email']

export default function AddEmailForm({ onAdd, onClose, prefill }) {
  const [form, setForm] = useState(prefill ? { ...EMPTY, ...prefill } : EMPTY)
  const [errors, setErrors] = useState({})
  const [iocInput, setIocInput] = useState({ type: 'IP', value: '' })
  const [tab, setTab] = useState('basic')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function toggleFlag(flag) {
    set('redFlags', form.redFlags.includes(flag)
      ? form.redFlags.filter(f => f !== flag)
      : [...form.redFlags, flag])
  }

  function toggleTool(tool) {
    set('tools', form.tools.includes(tool)
      ? form.tools.filter(t => t !== tool)
      : [...form.tools, tool])
  }

  function addIoc() {
    if (!iocInput.value.trim()) return
    set('iocs', [...form.iocs, { type: iocInput.type, value: iocInput.value.trim() }])
    setIocInput(i => ({ ...i, value: '' }))
  }

  function removeIoc(idx) {
    set('iocs', form.iocs.filter((_, i) => i !== idx))
  }

  function validate() {
    const e = {}
    if (!form.sender.trim()) e.sender = 'Required'
    if (!form.subject.trim()) e.subject = 'Required'
    if (!form.date) e.date = 'Required'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); setTab('basic'); return }
    onAdd(form)
    onClose()
  }

  function toggleMitre(tech) {
    const exists = form.mitreTechniques.some(t => t.id === tech.id)
    set('mitreTechniques', exists
      ? form.mitreTechniques.filter(t => t.id !== tech.id)
      : [...form.mitreTechniques, tech])
  }

  const tabs = ['basic', 'flags', 'iocs', 'mitre']
  const tabLabels = { basic: 'Basic Info', flags: 'Red Flags & Tools', iocs: 'IOCs', mitre: 'MITRE ATT&CK' }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">Log New Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 shrink-0">
          {tabs.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t ? 'text-white border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">

            {/* TAB: Basic Info */}
            {tab === 'basic' && (
              <>
                <Field label="Sender Email" error={errors.sender} required>
                  <input type="text" value={form.sender} onChange={e => set('sender', e.target.value)}
                    placeholder="attacker@fake-paypal.com" className={inp(errors.sender)} />
                </Field>
                <Field label="Subject" error={errors.subject} required>
                  <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
                    placeholder="Your account has been suspended" className={inp(errors.subject)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date Received" error={errors.date} required>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                      className={inp(errors.date)} />
                  </Field>
                  <Field label="Spoofed Brand">
                    <input type="text" value={form.spoofedBrand} onChange={e => set('spoofedBrand', e.target.value)}
                      placeholder="PayPal, Microsoft…" className={inp()} />
                  </Field>
                </div>
                <Field label="Verdict">
                  <div className="flex gap-2">
                    {VERDICTS.map(v => (
                      <button key={v.value} type="button" onClick={() => set('verdict', v.value)}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          form.verdict === v.value
                            ? `${v.color} border-current bg-white/5`
                            : 'text-gray-500 border-gray-700 hover:border-gray-500'
                        }`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Analyst Notes">
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                    placeholder="Initial observations, context, actions taken…"
                    rows={3} className={inp() + ' resize-none'} />
                </Field>
              </>
            )}

            {/* TAB: Red Flags & Tools */}
            {tab === 'flags' && (
              <>
                <Field label={`Red Flags (${form.redFlags.length} selected)`}>
                  <div className="grid grid-cols-1 gap-1.5">
                    {RED_FLAGS.map(flag => (
                      <label key={flag}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                          form.redFlags.includes(flag)
                            ? 'border-red-500/50 bg-red-500/10 text-red-300'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}>
                        <input type="checkbox" checked={form.redFlags.includes(flag)}
                          onChange={() => toggleFlag(flag)} className="accent-red-500" />
                        <span className="text-sm">{flag}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Tools Used">
                  <div className="flex flex-wrap gap-2">
                    {TOOLS.map(tool => (
                      <button key={tool} type="button" onClick={() => toggleTool(tool)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          form.tools.includes(tool)
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}>
                        {tool}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* TAB: MITRE ATT&CK */}
            {tab === 'mitre' && (
              <Field label={`MITRE ATT&CK Techniques (${form.mitreTechniques.length} selected)`}>
                <div className="space-y-1.5">
                  {MITRE_TECHNIQUES.map(tech => {
                    const selected = form.mitreTechniques.some(t => t.id === tech.id)
                    const color = TACTIC_COLORS[tech.tactic] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    return (
                      <label key={tech.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                          selected ? color : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleMitre(tech)} className="accent-blue-500" />
                        <span className="text-xs font-mono font-bold w-20 shrink-0">{tech.id}</span>
                        <span className="text-xs flex-1">{tech.name}</span>
                        <span className="text-xs opacity-60">{tech.tactic}</span>
                      </label>
                    )
                  })}
                </div>
              </Field>
            )}

            {/* TAB: IOCs */}
            {tab === 'iocs' && (
              <Field label="Indicators of Compromise">
                <div className="flex gap-2 mb-3">
                  <select value={iocInput.type} onChange={e => setIocInput(i => ({ ...i, type: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {IOC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="text" value={iocInput.value}
                    onChange={e => setIocInput(i => ({ ...i, value: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIoc())}
                    placeholder="Enter value and press Enter or Add"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                  <button type="button" onClick={addIoc}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all">
                    Add
                  </button>
                </div>

                {form.iocs.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No IOCs added yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {form.iocs.map((ioc, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-xs font-mono font-semibold text-blue-400 w-14 shrink-0">{ioc.type}</span>
                        <span className="text-xs text-gray-300 font-mono flex-1 truncate">{ioc.value}</span>
                        <button type="button" onClick={() => removeIoc(i)}
                          className="text-gray-500 hover:text-red-400 text-sm leading-none">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-800 shrink-0">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-all">
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all">
              Log Email
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

function inp(error) {
  return `w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`
}
