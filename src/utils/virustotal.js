import { getVTKey } from './keyStorage'

const BASE = 'https://www.virustotal.com/api/v3'

export function hasVTKey() {
  return !!getVTKey()
}

async function vtFetch(path, options = {}) {
  const key = getVTKey()
  if (!key) throw new Error('VirusTotal API key not configured — add it in Settings')

  // Try direct first (VT v3 supports CORS on GET)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'x-apikey': key, ...options.headers },
    })
    if (res.status === 401) throw new Error('Invalid VirusTotal API key — check Settings')
    if (res.status === 429) throw new Error('VT rate limit reached — wait 1 minute and try again')
    if (!res.ok) throw new Error(`VT API error ${res.status}`)
    return res.json()
  } catch (e) {
    // If network/CORS error, retry via proxy
    if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
      const proxy = 'https://corsproxy.io/?' + encodeURIComponent(`${BASE}${path}`)
      const res2 = await fetch(proxy, {
        ...options,
        headers: { 'x-apikey': key, ...options.headers },
      })
      if (res2.status === 401) throw new Error('Invalid VirusTotal API key — check Settings')
      if (res2.status === 429) throw new Error('VT rate limit reached — wait 1 minute and try again')
      if (!res2.ok) throw new Error(`VT API error ${res2.status}`)
      return res2.json()
    }
    throw e
  }
}

export async function scanUrl(url) {
  const id = btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  try {
    const data = await vtFetch(`/urls/${id}`)
    return summariseStats(data.data.attributes.last_analysis_stats, url, 'url')
  } catch {
    // Not cached — submit for scanning
    const key = getVTKey()
    let submitRes
    try {
      submitRes = await fetch(`${BASE}/urls`, {
        method: 'POST',
        headers: { 'x-apikey': key, 'content-type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(url)}`,
      })
    } catch {
      submitRes = await fetch('https://corsproxy.io/?' + encodeURIComponent(`${BASE}/urls`), {
        method: 'POST',
        headers: { 'x-apikey': key, 'content-type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(url)}`,
      })
    }
    if (!submitRes.ok) throw new Error(`VT submit failed (${submitRes.status})`)
    const sub = await submitRes.json()
    await new Promise(r => setTimeout(r, 4000))
    const result = await vtFetch(`/analyses/${sub.data.id}`)
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
  const malicious  = stats.malicious  || 0
  const suspicious = stats.suspicious || 0
  const clean      = (stats.undetected || 0) + (stats.harmless || 0)
  const total      = malicious + suspicious + clean + (stats.timeout || 0)
  const verdict    = malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : 'clean'
  return { value, type, malicious, suspicious, clean, total, verdict }
}
