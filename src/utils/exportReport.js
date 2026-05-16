const VERDICT_LABEL = {
  phishing:   'Confirmed Phishing',
  suspicious: 'Suspicious',
  legitimate: 'Legitimate',
}

export function exportJSON(emails) {
  const blob = new Blob([JSON.stringify(emails, null, 2)], { type: 'application/json' })
  download(blob, `phishing-report-${today()}.json`)
}

export function exportIOCsCSV(emails) {
  const rows = [['Type', 'Value', 'Source Email', 'Verdict', 'Date']]
  emails.forEach(e => {
    (e.iocs || []).forEach(ioc => {
      rows.push([ioc.type, ioc.value, e.sender, e.verdict, e.date])
    })
  })
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  download(new Blob([csv], { type: 'text/csv' }), `iocs-${today()}.csv`)
}

export function exportSTIX(emails) {
  const bundle = {
    type: 'bundle',
    id: `bundle--${uuid()}`,
    spec_version: '2.1',
    created: new Date().toISOString(),
    objects: emails.flatMap(e => {
      const indicators = (e.iocs || []).map(ioc => ({
        type: 'indicator',
        id: `indicator--${uuid()}`,
        spec_version: '2.1',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: `${ioc.type}: ${ioc.value}`,
        pattern: buildPattern(ioc),
        pattern_type: 'stix',
        valid_from: new Date().toISOString(),
        labels: [e.verdict === 'phishing' ? 'malicious-activity' : 'suspicious-activity'],
      }))
      return indicators
    }),
  }
  download(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }), `stix-${today()}.json`)
}

export function exportHTML(emails) {
  const total = emails.length
  const phishing = emails.filter(e => e.verdict === 'phishing').length
  const suspicious = emails.filter(e => e.verdict === 'suspicious').length
  const legitimate = emails.filter(e => e.verdict === 'legitimate').length

  const rows = emails.map(e => `
    <tr>
      <td>${e.date || ''}</td>
      <td>${esc(e.sender)}</td>
      <td>${esc(e.subject)}</td>
      <td>${esc(e.spoofedBrand || '—')}</td>
      <td><span class="verdict verdict-${e.verdict}">${VERDICT_LABEL[e.verdict] || e.verdict}</span></td>
      <td>${(e.redFlags || []).length}</td>
      <td>${(e.iocs || []).length}</td>
      <td>${(e.mitreTechniques || []).map(t => t.id).join(', ') || '—'}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>VORTEX — Threat Analysis Report — ${today()}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 40px; color: #111; background: #fff; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
  .stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
  .stat { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 24px; min-width: 120px; }
  .stat .num { font-size: 28px; font-weight: 700; }
  .stat .lbl { font-size: 12px; color: #888; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f9fafb; padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tr:hover td { background: #f9fafb; }
  .verdict { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .verdict-phishing   { background: #fee2e2; color: #dc2626; }
  .verdict-suspicious { background: #fef9c3; color: #ca8a04; }
  .verdict-legitimate { background: #dcfce7; color: #16a34a; }
</style>
</head>
<body>
<h1>VORTEX — Threat Analysis Report</h1>
<p class="meta">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Case ID: VTX-${Date.now()}</p>
<div class="stats">
  <div class="stat"><div class="num">${total}</div><div class="lbl">Total Analyzed</div></div>
  <div class="stat"><div class="num" style="color:#dc2626">${phishing}</div><div class="lbl">Confirmed Phishing</div></div>
  <div class="stat"><div class="num" style="color:#ca8a04">${suspicious}</div><div class="lbl">Suspicious</div></div>
  <div class="stat"><div class="num" style="color:#16a34a">${legitimate}</div><div class="lbl">Legitimate</div></div>
</div>
<table>
  <thead><tr><th>Date</th><th>Sender</th><th>Subject</th><th>Spoofed Brand</th><th>Verdict</th><th>Flags</th><th>IOCs</th><th>MITRE</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`

  download(new Blob([html], { type: 'text/html' }), `phishing-report-${today()}.html`)
}

function buildPattern(ioc) {
  switch (ioc.type) {
    case 'IP':     return `[ipv4-addr:value = '${ioc.value}']`
    case 'URL':    return `[url:value = '${ioc.value}']`
    case 'Domain': return `[domain-name:value = '${ioc.value}']`
    case 'Hash':   return `[file:hashes.MD5 = '${ioc.value}']`
    case 'Email':  return `[email-addr:value = '${ioc.value}']`
    default:       return `[artifact:value = '${ioc.value}']`
  }
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function uuid() {
  return crypto.randomUUID()
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
