import { useState } from 'react'
import { analyzeEmail } from '../utils/analyzeEmail'
import { trackAIAnalysis } from '../utils/activityStorage'

const VERDICT_STYLES = {
  phishing:   { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: 'Phishing'    },
  scam:       { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Scam'        },
  suspicious: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Suspicious'  },
  legitimate: { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  label: 'Legitimate'  },
}

const CONFIDENCE_STYLES = {
  high:   'text-green-400',
  medium: 'text-yellow-400',
  low:    'text-gray-400',
}

const IOC_COLORS = {
  IP:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  URL:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Domain: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Hash:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Email:  'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

export default function EmailAnalyzer({ onSaveToLog }) {
  const [rawEmail, setRawEmail] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    if (!rawEmail.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const analysis = await analyzeEmail(rawEmail)
      setResult(analysis)
      trackAIAnalysis(analysis.verdict)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    if (!result) return
    onSaveToLog({
      sender: result.sender || '',
      subject: result.subject || '',
      date: new Date().toISOString().slice(0, 10),
      spoofedBrand: result.spoofedBrand || '',
      verdict: result.verdict === 'scam' ? 'phishing' : (result.verdict || 'suspicious'),
      notes: result.explanation || '',
      redFlags: result.redFlags || [],
      tools: ['AI Analysis (GitHub Models)'],
      iocs: result.iocs || [],
    })
  }

  const s = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES.suspicious) : null

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Paste Raw Email</h3>
        <p className="text-xs text-gray-500 mb-3">Include headers + body for best results</p>
        <textarea
          value={rawEmail}
          onChange={e => setRawEmail(e.target.value)}
          placeholder={`From: support@paypa1.com\nTo: victim@gmail.com\nSubject: Your account has been suspended\n\nDear Customer,\n\nWe have detected suspicious activity on your account...\n\nClick here to verify: http://paypa1-secure.com/verify`}
          rows={8}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-600">{rawEmail.length} chars</span>
          <div className="flex gap-2">
            {rawEmail && (
              <button onClick={() => { setRawEmail(''); setResult(null); setError(null) }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-white transition-colors">
                Clear
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!rawEmail.trim() || loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : 'Analyze Email'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && s && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Verdict banner */}
          <div className={`px-5 py-4 ${s.bg} border-b ${s.border} flex items-start justify-between gap-4`}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-2xl font-bold ${s.color}`}>{s.label}</span>
                {result.threatType && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${s.border} ${s.color} font-medium`}>
                    {result.threatType}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Confidence:&nbsp;
                <span className={`font-semibold capitalize ${CONFIDENCE_STYLES[result.confidence] || 'text-gray-400'}`}>
                  {result.confidence}
                </span>
                {result.spoofedBrand && (
                  <span className="ml-3 text-gray-500">
                    Spoofed brand: <span className="text-gray-300">{result.spoofedBrand}</span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/10"
            >
              Save to Log
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Explanation */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Analysis</p>
              <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Red Flags */}
            {result.redFlags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Red Flags ({result.redFlags.length})
                </p>
                <div className="space-y-1.5">
                  {result.redFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <span className="text-red-500 mt-0.5 shrink-0">▸</span>
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IOCs */}
            {result.iocs?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  IOCs Found ({result.iocs.length})
                </p>
                <div className="space-y-1.5">
                  {result.iocs.map((ioc, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${IOC_COLORS[ioc.type] || IOC_COLORS.URL}`}>
                      <span className="font-bold w-14 shrink-0">{ioc.type}</span>
                      <span className="font-mono break-all">{ioc.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
