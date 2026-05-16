const KEY = 'vortex_activity'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function loadActivity() {
  return load()
}

export function trackHeaderParse(auth) {
  const a = load()
  a.headers = a.headers || { total: 0, spfFail: 0, dkimFail: 0, dmarcFail: 0, spfPass: 0, dkimPass: 0, dmarcPass: 0 }
  a.headers.total++
  const spf   = auth?.spf   || ''
  const dkim  = auth?.dkim  || ''
  const dmarc = auth?.dmarc || ''
  if (spf === 'fail' || spf === 'softfail')  a.headers.spfFail++
  else if (spf === 'pass')                    a.headers.spfPass++
  if (dkim === 'fail')  a.headers.dkimFail++
  else if (dkim === 'pass') a.headers.dkimPass++
  if (dmarc === 'fail') a.headers.dmarcFail++
  else if (dmarc === 'pass') a.headers.dmarcPass++
  save(a)
}

export function trackVTScan(result) {
  const a = load()
  a.vt = a.vt || { total: 0, malicious: 0, suspicious: 0, clean: 0, unknown: 0 }
  a.vt.total++
  a.vt[result.verdict] = (a.vt[result.verdict] || 0) + 1
  save(a)
}

export function trackAIAnalysis(verdict) {
  const a = load()
  a.ai = a.ai || { total: 0, phishing: 0, scam: 0, suspicious: 0, legitimate: 0 }
  a.ai.total++
  if (verdict) a.ai[verdict] = (a.ai[verdict] || 0) + 1
  save(a)
}
