import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getGithubToken, setGithubToken, getVTKey, setVTKey } from '../utils/keyStorage'

export default function SettingsModal({ open, onClose }) {
  const [gh, setGh]   = useState(() => getGithubToken())
  const [vt, setVt]   = useState(() => getVTKey())
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setGithubToken(gh.trim())
    setVTKey(vt.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 900)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md border border-white/10 rounded-2xl p-6 space-y-5"
              style={{ background: 'rgba(8,12,18,0.97)', backdropFilter: 'blur(30px)' }}>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">API Keys</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Stored in your browser only — never sent anywhere</p>
                </div>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xl transition-colors">✕</button>
              </div>

              <Field
                label="GitHub Token"
                hint={<>Free — <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-400 underline">github.com/settings/tokens</a> → Generate new token (classic), no scopes needed</>}
                value={gh}
                onChange={setGh}
                placeholder="github_pat_..."
              />

              <Field
                label="VirusTotal API Key"
                hint={<>Free — <a href="https://www.virustotal.com/gui/my-apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">virustotal.com</a> → Sign up → Account → API Key</>}
                value={vt}
                onChange={setVt}
                placeholder="64-character hex key"
              />

              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}
              >
                {saved ? '✓ Saved' : 'Save Keys'}
              </button>

              <p className="text-xs text-gray-700 text-center">
                Keys are stored in <code className="text-gray-600">localStorage</code>. Clear browser data to remove them.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, hint, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 pr-12 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          {show ? 'hide' : 'show'}
        </button>
      </div>
      <p className="text-xs text-gray-600">{hint}</p>
    </div>
  )
}
