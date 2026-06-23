import { getVTKey } from './keyStorage'

const BASE = 'https://www.virustotal.com/api/v3'

export function hasVTKey() {
  return !!getVTKey()
}

// Builds VT URL with key as query param (avoids CORS preflight from custom headers)
function vtUrl(path) {
  const key = getVTKey()
  const sep = path.includes('?') ? '&' : '?'
  return `${BASE}${path}${sep}apikey=${key}`
}

// Tries direct, falls back to allorigins proxy (reliable, no header forwarding needed)
async function vtGet(path) {
  const key = getVTKey()
  if (!key) throw new Error('VirusTotal API key not configured — add it in Settings')

  const directUrl = vtUrl(path)

  try {
    const res = await fetch(directUrl)
    if (res.status === 401) throw new Error('Invalid VirusTotal API key — check Settings')
    if (res.status === 429) throw new Error('VT rate limit — wait 1 minute and retry')
    if (!res.ok) throw new Error(`VT API error ${res.status}`)
    return res.json()
  } catch (e) {
    if (e.message !== 'Failed to fetch' && e.name !== 'TypeError') throw e

    // CORS fallback via allorigins
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`
    const res2 = await fetch(proxy)
    if (res2.status === 401) throw new Error('Invalid VirusTotal API key — check Settings')
    if (res2.status === 429) throw new Error('VT rate limit — wait 1 minute and retry')
    if (!res2.ok) throw new Error(`VT API error ${res2.status}`)
    return res2.json()
  }
}

export async function scanUrl(url) {
  const id = btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  try {
    const data = await vtGet(`/urls/${id}`)
    return summariseStats(data.data.attributes.last_analysis_stats, url, 'url')
  } catch {
    // Not cached — submit for scanning
    const key = getVTKey()
    const submitUrl = `${BASE}/urls?apikey=${key}`
    let submitRes
    try {
      submitRes = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(url)}`,
      })
    } catch {
      submitRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(submitUrl)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(url)}`,
      })
    }
    if (!submitRes.ok) throw new Error(`VT submit failed (${submitRes.status})`)
    const sub = await submitRes.json()
    await new Promise(r => setTimeout(r, 4000))
    const result = await vtGet(`/analyses/${sub.data.id}`)
    return summariseStats(result.data.attributes.stats, url, 'url')
  }
}

export async function scanIp(ip) {
  const data = await vtGet(`/ip_addresses/${ip}`)
  return summariseStats(data.data.attributes.last_analysis_stats, ip, 'ip')
}

export async function scanDomain(domain) {
  const data = await vtGet(`/domains/${domain}`)
  return summariseStats(data.data.attributes.last_analysis_stats, domain, 'domain')
}

export async function scanHash(hash) {
  const data = await vtGet(`/files/${hash}`)
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
