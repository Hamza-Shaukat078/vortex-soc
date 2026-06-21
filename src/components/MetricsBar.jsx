import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Activity, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react'

function CountUp({ value }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current
    prev.current = value
    if (start === value) return
    const dur = 800
    const t0 = performance.now()
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 4)
      setDisplay(Math.round(start + (value - start) * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display}</>
}

const CARDS = [
  {
    key: 'total',
    label: 'Total Analyzed',
    sublabel: 'all time',
    color: '#38bdf8',
    glow: 'glow-blue',
    textGlow: 'text-glow-blue',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5',
    dot: 'bg-sky-400',
    ring: 'bg-sky-400/20',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    Icon: Activity,
  },
  {
    key: 'phishing',
    label: 'Confirmed Phishing',
    sublabel: 'high threat',
    color: '#ef4444',
    glow: 'glow-red',
    textGlow: 'text-glow-red',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    dot: 'bg-red-500',
    ring: 'bg-red-500/20',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    Icon: ShieldAlert,
    pulse: true,
  },
  {
    key: 'suspicious',
    label: 'Suspicious',
    sublabel: 'under review',
    color: '#eab308',
    glow: 'glow-yellow',
    textGlow: 'text-glow-yellow',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    dot: 'bg-yellow-400',
    ring: 'bg-yellow-400/20',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Icon: AlertTriangle,
  },
  {
    key: 'legitimate',
    label: 'Legitimate',
    sublabel: 'cleared',
    color: '#22c55e',
    glow: 'glow-green',
    textGlow: 'text-glow-green',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
    dot: 'bg-green-400',
    ring: 'bg-green-400/20',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    Icon: ShieldCheck,
  },
]

export default function MetricsBar({ emails }) {
  const total      = emails.length
  const phishing   = emails.filter(e => e.verdict === 'phishing').length
  const suspicious = emails.filter(e => e.verdict === 'suspicious').length
  const legitimate = emails.filter(e => e.verdict === 'legitimate').length
  const values = { total, phishing, suspicious, legitimate }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {CARDS.map((card, i) => {
        const val = values[card.key]
        const pct = total > 0 && card.key !== 'total'
          ? Math.round((val / total) * 100) : 100

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} ${card.glow} p-6 cursor-default`}
          >
            {/* Scan overlay */}
            <div className="scan-overlay" />

            {/* Corner icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span
                    className={`w-3 h-3 rounded-full ${card.dot} block relative z-10`}
                    style={{ boxShadow: `0 0 8px ${card.color}` }}
                  />
                  {card.pulse && (
                    <motion.span
                      animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full ${card.dot} opacity-40`}
                    />
                  )}
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: card.color, opacity: 0.8 }}>
                  {card.label}
                </span>
              </div>
              <card.Icon size={16} style={{ color: card.color, opacity: 0.3 }} />
            </div>

            {/* Big number */}
            <div className="mb-3">
              <motion.span
                key={val}
                className={`text-7xl font-bold leading-none tracking-tight ${card.textGlow}`}
                style={{ color: card.color, fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <CountUp value={val} />
              </motion.span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.08 + 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color})` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 uppercase tracking-wider">{card.sublabel}</span>
              <span className="text-xs font-semibold font-mono" style={{ color: card.color }}>
                {pct}%
              </span>
            </div>

            {/* Background glow blob */}
            <div
              className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: card.color }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
