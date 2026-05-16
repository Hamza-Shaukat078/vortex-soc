import { useState } from 'react'
import { scanUrl, scanIp, scanDomain, scanHash, hasVTKey } from '../utils/virustotal'
import { trackVTScan } from '../utils/activityStorage'

const TYPE_OPTIONS = ['URL', 'IP', 'Domain', 'Hash']

const VERDICT_STYLE = {
  malicious:  'text-red-400 bg-red-400/10 border-red-400/30',
  suspicious: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  clean:      'text-green-400 bg-green-400/10 border-green-400/30',
  unknown:    'text-gray-400 bg-gray-400/10 border-gray-400/30',
}

export default function VTScanner() {
  const [type, setType] = useState('URL')
  const [value, setValue] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!hasVTKey()) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">VirusTotal Scanner</h3>
        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
          Add <code className="bg-black/20 px-1 rounded">VITE_VIRUSTOTAL_KEY</code> to your <code className="bg-black/20 px-1 rounded">.env</code> file to enable URL/IP scanning.
        </div>
      </div>
    )
  }

  async function handleScan() {
    if (!value.trim()) return
    setLoading(true)
    setError(null)
    try {
      let result
      if (type === 'URL')    result = await scanUrl(value.trim())
      else if (type === 'IP') result = await scanIp(value.trim())
      else if (type === 'Domain') result = await scanDomain(value.trim())
      else result = await scanHash(value.trim())
      trackVTScan(result)
      setResults(prev => [result, ...prev.slice(0, 19)])
      setValue('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">VirusTotal Scanner</h3>
        <p className="text-xs text-gray-500 mb-3">Scan URLs, IPs, domains, and file hashes</p>
        <div className="flex gap-2">
          <select value={type} onChange={e => setType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
            {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
          <input value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder={`Enter ${type.toLowerCase()} to scan…`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono" />
          <button onClick={handleScan} disabled={!value.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2">
            {loading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Scan
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => {
            const s = VERDICT_STYLE[r.verdict] || VERDICT_STYLE.unknown
            return (
              <div key={i} className={`bg-gray-900 border rounded-xl px-4 py-3 flex items-center gap-4 ${s.split(' ').find(c => c.startsWith('border')) || 'border-gray-700'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-300 truncate">{r.value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{r.type}</p>
                </div>
                <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${s}`}>
                  {r.verdict.toUpperCase()}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-red-400">{r.malicious} malicious</p>
                  <p className="text-xs text-gray-500">/ {r.total} engines</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
