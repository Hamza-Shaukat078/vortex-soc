export function parseEml(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const headers = {}
  let headersDone = false
  let bodyLines = []
  let current = null

  for (const line of lines) {
    if (!headersDone) {
      if (line === '') { headersDone = true; continue }
      if (/^\s/.test(line) && current) {
        headers[current] += ' ' + line.trim()
      } else {
        const idx = line.indexOf(':')
        if (idx > 0) {
          current = line.slice(0, idx).toLowerCase().trim()
          headers[current] = line.slice(idx + 1).trim()
        }
      }
    } else {
      bodyLines.push(line)
    }
  }

  const from = headers['from'] || ''
  const subject = decodeRfc2047(headers['subject'] || '')
  const date = parseHeaderDate(headers['date'])
  const body = bodyLines.join('\n').slice(0, 3000)

  return {
    raw: content,
    sender: extractEmail(from),
    subject,
    date,
    body,
    headers,
  }
}

function extractEmail(str) {
  const m = str.match(/<([^>]+)>/) || str.match(/[\w.+-]+@[\w.-]+\.\w+/)
  return m ? m[1] || m[0] : str.trim()
}

function decodeRfc2047(str) {
  return str.replace(/=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g, (_, charset, enc, text) => {
    try {
      if (enc.toUpperCase() === 'B') return atob(text)
      return text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    } catch { return text }
  })
}

function parseHeaderDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10)
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}
