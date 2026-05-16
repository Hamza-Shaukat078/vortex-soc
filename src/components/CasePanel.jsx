import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CASE_STATUSES, PRIORITIES, getStatus, getPriority } from '../utils/cases'

export default function CasePanel({ email, onUpdate }) {
  const [comment, setComment] = useState('')
  const status   = getStatus(email.caseStatus || 'open')
  const priority = getPriority(email.casePriority || 'high')

  function update(patch) {
    onUpdate({ ...email, ...patch })
  }

  function addComment() {
    if (!comment.trim()) return
    const comments = [...(email.comments || []), {
      id: crypto.randomUUID(),
      text: comment.trim(),
      timestamp: new Date().toISOString(),
    }]
    update({ comments })
    setComment('')
  }

  return (
    <div className="space-y-4">
      {/* Case header */}
      <div className="rounded-2xl border border-white/5 p-5"
        style={{ background: 'rgba(10,14,20,0.8)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-0.5">Case ID</p>
            <p className="text-lg font-bold font-mono text-white tracking-wider"
              style={{ textShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
              {email.caseId || '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-0.5">Opened</p>
            <p className="text-sm text-gray-400">{formatDate(email.createdAt)}</p>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Status</p>
          <div className="flex gap-2 flex-wrap">
            {CASE_STATUSES.map(s => (
              <motion.button key={s.value} whileTap={{ scale: 0.95 }}
                onClick={() => update({ caseStatus: s.value })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  status.value === s.value
                    ? `${s.bg} ${s.border} ${s.text}`
                    : 'border-white/5 text-gray-600 hover:text-gray-400'
                }`}>
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Priority</p>
          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map(p => (
              <motion.button key={p.value} whileTap={{ scale: 0.95 }}
                onClick={() => update({ casePriority: p.value })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  priority.value === p.value
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/5 text-gray-600 hover:text-gray-400'
                }`}
                style={priority.value === p.value ? { color: p.color } : {}}>
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-2xl border border-white/5 p-5"
        style={{ background: 'rgba(10,14,20,0.8)' }}>
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">
          Analyst Comments ({email.comments?.length || 0})
        </p>

        <div className="space-y-2 mb-3 max-h-52 overflow-y-auto">
          <AnimatePresence>
            {(email.comments || []).length === 0 && (
              <p className="text-sm text-gray-700 text-center py-4">No comments yet</p>
            )}
            {(email.comments || []).map(c => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/5 px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-sm text-gray-300 leading-relaxed">{c.text}</p>
                <p className="text-xs text-gray-700 font-mono mt-1">{formatDateTime(c.timestamp)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addComment())}
            placeholder="Add analyst comment…"
            className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-300 placeholder-gray-700 border border-white/5 focus:outline-none focus:border-white/10 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          />
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={addComment}
            disabled={!comment.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all"
            style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.2)' }}>
            Add
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
