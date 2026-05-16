import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'

const Panel = ({ title, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl border border-white/5 p-6 ${className}`}
    style={{ background: 'rgba(10,14,20,0.8)' }}
  >
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5 font-mono">{title}</p>
    {children}
  </motion.div>
)

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl border border-white/10 text-xs"
      style={{ background: 'rgba(8,12,18,0.95)', backdropFilter: 'blur(10px)' }}>
      {label && <p className="text-gray-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name || p.dataKey}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/5 p-5"
      style={{ background: 'rgba(10,14,20,0.8)' }}
    >
      <p className="text-xs text-gray-600 uppercase tracking-widest font-mono mb-2">{label}</p>
      <p className="text-4xl font-bold leading-none mb-1" style={{ color, textShadow: `0 0 20px ${color}66` }}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function StatsView({ emails }) {
  const stats = useMemo(() => {
    const total      = emails.length
    const phishing   = emails.filter(e => e.verdict === 'phishing').length
    const suspicious = emails.filter(e => e.verdict === 'suspicious').length
    const withFlags  = emails.filter(e => e.redFlags?.length > 0)
    const avgFlags   = withFlags.length
      ? (withFlags.reduce((a, e) => a + e.redFlags.length, 0) / withFlags.length).toFixed(1)
      : 0
    const totalIocs  = emails.reduce((a, e) => a + (e.iocs?.length || 0), 0)
    const detectionRate = total ? Math.round(((phishing + suspicious) / total) * 100) : 0

    // Daily volume — last 30 days
    const days = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days[key] = { date: key, phishing: 0, suspicious: 0, legitimate: 0, total: 0 }
    }
    emails.forEach(e => {
      if (e.date && days[e.date]) {
        days[e.date][e.verdict] = (days[e.date][e.verdict] || 0) + 1
        days[e.date].total++
      }
    })
    const dailyData = Object.values(days).map(d => ({
      ...d,
      label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))

    // Top brands
    const brands = {}
    emails.forEach(e => { if (e.spoofedBrand?.trim()) brands[e.spoofedBrand] = (brands[e.spoofedBrand] || 0) + 1 })
    const brandData = Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    // IOC types
    const iocTypes = {}
    emails.forEach(e => e.iocs?.forEach(i => { iocTypes[i.type] = (iocTypes[i.type] || 0) + 1 }))
    const iocData = Object.entries(iocTypes).map(([type, count]) => ({ type, count }))

    // MITRE top techniques
    const mitreMap = {}
    emails.forEach(e => e.mitreTechniques?.forEach(t => {
      mitreMap[t.id] = { id: t.id, name: t.name, count: (mitreMap[t.id]?.count || 0) + 1 }
    }))
    const mitreData = Object.values(mitreMap).sort((a, b) => b.count - a.count).slice(0, 5)

    return { total, phishing, suspicious, avgFlags, totalIocs, detectionRate, dailyData, brandData, iocData, mitreData }
  }, [emails])

  if (emails.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-gray-700">
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl mb-4">📈</motion.span>
        <p className="text-base font-medium text-gray-600">Stats appear once you log emails</p>
      </motion.div>
    )
  }

  const IOC_COLORS = ['#38bdf8','#ef4444','#22c55e','#eab308','#a78bfa']

  return (
    <div className="space-y-5">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Detection Rate"   value={`${stats.detectionRate}%`} sub="phishing + suspicious" color="#ef4444" delay={0}    />
        <StatCard label="Avg Red Flags"    value={stats.avgFlags}           sub="per phishing email"   color="#eab308" delay={0.06}  />
        <StatCard label="Total IOCs"       value={stats.totalIocs}          sub="across all emails"    color="#a78bfa" delay={0.12}  />
        <StatCard label="Threat Emails"    value={stats.phishing + stats.suspicious} sub="phishing + suspicious" color="#f97316" delay={0.18} />
      </div>

      {/* Volume over time */}
      <Panel title="Email Volume — Last 30 Days" delay={0.1}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.dailyData} margin={{ left: -20, right: 10, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="label" tick={{ fill: '#374151', fontSize: 10 }} axisLine={false} tickLine={false}
              interval={6} />
            <YAxis tick={{ fill: '#374151', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="phishing"   stroke="#ef4444" strokeWidth={2} dot={false}
              style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
            <Line type="monotone" dataKey="suspicious" stroke="#eab308" strokeWidth={2} dot={false}
              style={{ filter: 'drop-shadow(0 0 4px #eab308)' }} />
            <Line type="monotone" dataKey="legitimate" stroke="#22c55e" strokeWidth={2} dot={false}
              style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-3 justify-center">
          {[['Phishing','#ef4444'],['Suspicious','#eab308'],['Legitimate','#22c55e']].map(([l,c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: c, boxShadow: `0 0 4px ${c}` }} />
              <span className="text-xs text-gray-600">{l}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top spoofed brands */}
        {stats.brandData.length > 0 && (
          <Panel title="Top Spoofed Brands" delay={0.15}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.brandData} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#374151', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="url(#brandGrad)" />
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {/* IOC type breakdown */}
        {stats.iocData.length > 0 && (
          <Panel title="IOC Type Breakdown" delay={0.2}>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={stats.iocData} dataKey="count" nameKey="type" cx="50%" cy="50%"
                    innerRadius={40} outerRadius={68} stroke="none">
                    {stats.iocData.map((_, i) => (
                      <Cell key={i} fill={IOC_COLORS[i % IOC_COLORS.length]}
                        style={{ filter: `drop-shadow(0 0 6px ${IOC_COLORS[i % IOC_COLORS.length]}88)` }} />
                    ))}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {stats.iocData.map((d, i) => (
                  <div key={d.type} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: IOC_COLORS[i % IOC_COLORS.length], boxShadow: `0 0 5px ${IOC_COLORS[i % IOC_COLORS.length]}` }} />
                    <span className="text-sm text-gray-500 flex-1 font-mono">{d.type}</span>
                    <span className="text-sm font-bold text-gray-300">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* MITRE techniques */}
      {stats.mitreData.length > 0 && (
        <Panel title="Top MITRE ATT&CK Techniques" delay={0.25}>
          <div className="space-y-3">
            {stats.mitreData.map((t, i) => (
              <div key={t.id} className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-sky-400 w-20 shrink-0">{t.id}</span>
                <span className="text-sm text-gray-400 flex-1 truncate">{t.name}</span>
                <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.count / stats.mitreData[0].count) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded-full bg-sky-500"
                    style={{ boxShadow: '0 0 6px #38bdf8' }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-600 w-4 text-right">{t.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
