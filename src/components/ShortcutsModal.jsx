import { motion, AnimatePresence } from 'motion/react'

const SHORTCUTS = [
  { key: 'N',      desc: 'Log new email' },
  { key: '/',      desc: 'Focus search' },
  { key: '1 – 7', desc: 'Switch views' },
  { key: 'Esc',   desc: 'Close modal / deselect' },
  { key: 'Del',   desc: 'Delete selected email' },
  { key: '?',     desc: 'Show this help' },
]

export default function ShortcutsModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 p-6"
            style={{ background: 'rgba(8,12,18,0.98)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors text-lg">×</button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{s.desc}</span>
                  <kbd className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-gray-300 border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-700 mt-5 text-center">Shortcuts disabled while typing in inputs</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
