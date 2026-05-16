import { motion, AnimatePresence } from 'motion/react'

const VS = {
  phishing:   { bar: '#ef4444', badge: 'bg-red-500/10 text-red-400 border-red-500/20',    dot: 'bg-red-500',    label: 'Phishing',   glow: 'rgba(239,68,68,0.15)'   },
  suspicious: { bar: '#eab308', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400', label: 'Suspicious', glow: 'rgba(234,179,8,0.12)'  },
  legitimate: { bar: '#22c55e', badge: 'bg-green-500/10 text-green-400 border-green-500/20',  dot: 'bg-green-400',  label: 'Legitimate', glow: 'rgba(34,197,94,0.12)'  },
}

export default function EmailLog({ emails, selectedId, onSelect, onDelete }) {
  if (emails.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-gray-700">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <span className="text-5xl">📭</span>
        </motion.div>
        <p className="text-base mt-4 font-medium text-gray-600">No emails logged yet</p>
        <p className="text-sm text-gray-700 mt-1">Click + Log Email to start</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {emails.map((email, i) => {
          const s = VS[email.verdict] || VS.suspicious
          const isSelected = email.id === selectedId
          return (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
              transition={{ duration: 0.3, delay: i < 10 ? i * 0.03 : 0, ease: [0.22, 1, 0.36, 1] }}
              layout
              onClick={() => onSelect(email.id === selectedId ? null : email.id)}
              whileHover={{ x: 3 }}
              className="group relative rounded-2xl border border-white/5 cursor-pointer overflow-hidden transition-all"
              style={{
                background: isSelected
                  ? `rgba(15,20,30,0.9)`
                  : 'rgba(10,14,20,0.6)',
                boxShadow: isSelected ? `0 0 24px ${s.glow}, inset 0 0 1px ${s.bar}40` : 'none',
              }}
            >
              {/* Left verdict bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full transition-all"
                style={{
                  background: s.bar,
                  boxShadow: isSelected ? `0 0 8px ${s.bar}` : 'none',
                  opacity: isSelected ? 1 : 0.3,
                }}
              />

              <div className="px-4 py-3.5 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                          style={{ boxShadow: `0 0 4px ${s.bar}` }} />
                        {s.label}
                      </span>
                      {email.redFlags?.length > 0 && (
                        <span className="text-xs text-gray-600 font-mono">
                          {email.redFlags.length}F
                        </span>
                      )}
                      {email.iocs?.length > 0 && (
                        <span className="text-xs text-gray-600 font-mono">
                          {email.iocs.length}I
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-200 truncate leading-snug">{email.subject}</p>
                    <p className="text-xs text-gray-600 font-mono truncate mt-0.5">{email.sender}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-700 font-mono">{formatDate(email.date)}</span>
                    <motion.button
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); onDelete(email.id) }}
                      className="text-gray-800 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >✕</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function formatDate(s) {
  if (!s) return ''
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
