import { motion } from 'motion/react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const VERDICT_COLORS = {
  phishing:   '#ef4444',
  suspicious: '#eab308',
  legitimate: '#22c55e',
}

const Panel = ({ children, title, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="rounded-2xl border border-white/5 p-6"
    style={{ background: 'rgba(10,14,20,0.8)' }}
  >
    {title && (
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5 font-mono">{title}</p>
    )}
    {children}
  </motion.div>
)

export default function Charts({ emails }) {
  if (emails.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-64 text-gray-700">
        <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl mb-4">📊</motion.span>
        <p className="text-base font-medium text-gray-600">Charts appear once you log emails</p>
      </motion.div>
    )
  }

  const verdictData = Object.entries(
    emails.reduce((acc, e) => { acc[e.verdict] = (acc[e.verdict] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: VERDICT_COLORS[name] || '#6b7280',
  }))

  const flagCounts = {}
  emails.forEach(e => e.redFlags?.forEach(f => { flagCounts[f] = (flagCounts[f] || 0) + 1 }))
  const flagData = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 21) + '…' : name, count }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300"
        style={{ background: 'rgba(10,14,20,0.95)', backdropFilter: 'blur(10px)' }}>
        <p className="font-semibold">{payload[0].name || payload[0].payload?.name}</p>
        <p style={{ color: payload[0].color || payload[0].fill }}>{payload[0].value}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Panel title="Verdict Breakdown" delay={0}>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="55%" height={170}>
            <PieChart>
              <Pie data={verdictData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                dataKey="value" stroke="none" strokeWidth={0}>
                {verdictData.map((entry, i) => (
                  <Cell key={i} fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 8px ${entry.color}88)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 flex-1">
            {verdictData.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                <span className="text-sm text-gray-400 flex-1">{d.name}</span>
                <span className="text-lg font-bold font-mono" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {flagData.length > 0 && (
        <Panel title="Top Red Flags" delay={0.1}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={flagData} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#374151', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130}
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Space Grotesk' }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}
                fill="url(#flagGrad)" />
              <defs>
                <linearGradient id="flagGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  )
}
