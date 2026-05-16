export function parseEmailHeaders(raw) {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const headers = {}
  let current = null

  for (const line of lines) {
    if (line === '') break
    if (/^\s/.test(line) && current) {
      headers[current] += ' ' + line.trim()
    } else {
      const idx = line.indexOf(':')
      if (idx > 0) {
        current = line.slice(0, idx).toLowerCase().trim()
        headers[current] = line.slice(idx + 1).trim()
      }
    }
  }

  return {
    from: headers['from'] || null,
    to: headers['to'] || null,
    subject: headers['subject'] || null,
    date: headers['date'] || null,
    replyTo: headers['reply-to'] || null,
    returnPath: headers['return-path'] || null,
    messageId: headers['message-id'] || null,
    receivedSpf: parseAuthResult(headers['received-spf']),
    dkimSignature: headers['dkim-signature'] ? parseDkim(headers['dkim-signature']) : null,
    authResults: parseAuthResults(headers['authentication-results']),
    xMailer: headers['x-mailer'] || null,
    xOriginating: headers['x-originating-ip'] || null,
    received: extractReceived(raw),
  }
}

function parseAuthResult(val) {
  if (!val) return null
  const status = val.match(/^(pass|fail|softfail|neutral|none|permerror|temperror)/i)
  return { raw: val, status: status ? status[1].toLowerCase() : 'unknown' }
}

function parseAuthResults(val) {
  if (!val) return null
  const spf = val.match(/spf=(pass|fail|softfail|neutral|none|permerror|temperror)/i)
  const dkim = val.match(/dkim=(pass|fail|neutral|none|permerror|temperror)/i)
  const dmarc = val.match(/dmarc=(pass|fail|bestguesspass|none|temperror|permerror)/i)
  return {
    raw: val,
    spf: spf ? spf[1].toLowerCase() : null,
    dkim: dkim ? dkim[1].toLowerCase() : null,
    dmarc: dmarc ? dmarc[1].toLowerCase() : null,
  }
}

function parseDkim(val) {
  const domain = val.match(/d=([^;]+)/i)
  const selector = val.match(/s=([^;]+)/i)
  return { domain: domain ? domain[1].trim() : null, selector: selector ? selector[1].trim() : null }
}

function extractReceived(raw) {
  const matches = [...raw.matchAll(/^Received:(.+?)(?=^\S)/gims)]
  return matches.slice(0, 5).map(m => m[1].replace(/\s+/g, ' ').trim())
}

export function getAuthStatus(parsed) {
  const auth = parsed.authResults
  const spf = auth?.spf || parsed.receivedSpf?.status || null
  const dkim = auth?.dkim || null
  const dmarc = auth?.dmarc || null
  return { spf, dkim, dmarc }
}
