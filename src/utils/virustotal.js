import { getVTKey } from './keyStorage'

const BASE = 'https://www.virustotal.com/api/v3'

export function hasVTKey() {
  return !!getVTKey()
}

async function vtFetch(path) {
  const key = getVTKey()
  if (!key) throw new Error('VirusTotal API key not configured — add it in Settings')
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-apikey': key },
  })
  if (!res.ok) throw new Error(`VT API ${res.status}`)
  return res.json()
}

export async function scanUrl(url) {
  const id = btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  try {
    const data = await vtFetch(`/urls/${id}`)
    return summariseStats(data.data.attributes.last_analysis_stats, url, 'url')
  } catch {
    const submit = await fetch(`${BASE}/urls`, {
      method: 'POST',
      headers: { 'x-apikey': getVTKey(), 'content-type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`,
    })
    if (!submit.ok) throw new Error('VT submit failed')
    const sub = await submit.json()
    const analysisId = sub.data.id
    await new Promise(r => setTimeout(r, 3000))
    const result = await vtFetch(`/analyses/${analysisId}`)
    return summariseStats(result.data.attributes.stats, url, 'url')
  }
}

export async function scanIp(ip) {
  const data = await vtFetch(`/ip_addresses/${ip}`)
  return summariseStats(data.data.attributes.last_analysis_stats, ip, 'ip')
}

export async function scanDomain(domain) {
  const data = await vtFetch(`/domains/${domain}`)
  return summariseStats(data.data.attributes.last_analysis_stats, domain, 'domain')
}

export async function scanHash(hash) {
  const data = await vtFetch(`/files/${hash}`)
  return summariseStats(data.data.attributes.last_analysis_stats, hash, 'hash')
}

function summariseStats(stats, value, type) {
  if (!stats) return { value, type, malicious: 0, suspicious: 0, clean: 0, total: 0, verdict: 'unknown' }
  const malicious = stats.malicious || 0
  const suspicious = stats.suspicious || 0
  const clean = (stats.undetected || 0) + (stats.harmless || 0)
  const total = malicious + suspicious + clean + (stats.timeout || 0)
  const verdict = malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : 'clean'
  return { value, type, malicious, suspicious, clean, total, verdict }
}
