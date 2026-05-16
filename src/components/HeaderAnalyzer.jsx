import { useState } from 'react'
import { parseEmailHeaders, getAuthStatus } from '../utils/parseHeaders'
import { trackHeaderParse } from '../utils/activityStorage'

const STATUS_STYLE = {
  pass:      'text-green-400 bg-green-400/10 border-green-400/20',
  fail:      'text-red-400 bg-red-400/10 border-red-400/20',
  softfail:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  neutral:   'text-gray-400 bg-gray-400/10 border-gray-400/20',
  none:      'text-gray-500 bg-gray-500/10 border-gray-500/20',
  unknown:   'text-gray-500 bg-gray-500/10 border-gray-500/20',
}

export default function HeaderAnalyzer() {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState(null)

  function handleParse() {
    if (!raw.trim()) return
    const p = parseEmailHeaders(raw)
    setParsed(p)
    const a = getAuthStatus(p)
    trackHeaderParse(a)
  }

  const auth = parsed ? getAuthStatus(parsed) : null

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Email Header Analyzer</h3>
        <p className="text-xs text-gray-500 mb-3">Paste raw email headers to check SPF, DKIM, DMARC and routing</p>
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Delivered-To: user@gmail.com&#10;Received: from mail.example.com...&#10;Authentication-Results: spf=fail...&#10;DKIM-Signature: v=1; a=rsa-sha256..."
          rows={7}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono"
        />
        <div className="flex justify-end mt-3">
          <button onClick={handleParse} disabled={!raw.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all">
            Parse Headers
          </button>
        </div>
      </div>

      {parsed && (
        <>
          {/* Auth Results */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Authentication Results</p>
            <div className="grid grid-cols-3 gap-3">
              {[['SPF', auth.spf], ['DKIM', auth.dkim], ['DMARC', auth.dmarc]].map(([name, status]) => (
                <div key={name} className={`rounded-xl border px-4 py-3 text-center ${STATUS_STYLE[status] || STATUS_STYLE.none}`}>
                  <p className="text-lg font-bold uppercase">{status || 'N/A'}</p>
                  <p className="text-xs opacity-70 mt-0.5">{name}</p>
                </div>
              ))}
            </div>
            {(auth.spf === 'fail' || auth.dkim === 'fail' || auth.dmarc === 'fail') && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-300">
                Auth failures detected — high risk of spoofed sender
              </div>
            )}
          </div>

          {/* Header Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Extracted Fields</p>
            {[
              ['From', parsed.from],
              ['Reply-To', parsed.replyTo],
              ['Return-Path', parsed.returnPath],
              ['Subject', parsed.subject],
              ['Date', parsed.date],
              ['Message-ID', parsed.messageId],
              ['X-Originating-IP', parsed.xOriginating],
              ['X-Mailer', parsed.xMailer],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
                <span className="text-xs text-gray-300 font-mono break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* Routing hops */}
          {parsed.received?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Routing Hops ({parsed.received.length})
              </p>
              <div className="space-y-2">
                {parsed.received.map((hop, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xs text-gray-600 w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs text-gray-400 font-mono break-all">{hop}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
