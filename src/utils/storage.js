import { generateCaseId } from './cases'

const KEY = 'phishing_analyzer_emails'

export function loadEmails() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEmails(emails) {
  localStorage.setItem(KEY, JSON.stringify(emails))
}

export function addEmail(emails, entry) {
  const id = crypto.randomUUID()
  const updated = [{
    ...entry,
    id,
    caseId: generateCaseId(),
    caseStatus: 'open',
    casePriority: entry.verdict === 'phishing' ? 'high' : entry.verdict === 'suspicious' ? 'medium' : 'low',
    comments: [],
    createdAt: new Date().toISOString(),
  }, ...emails]
  saveEmails(updated)
  return updated
}

export function updateEmail(emails, updated) {
  const list = emails.map(e => e.id === updated.id ? updated : e)
  saveEmails(list)
  return list
}

export function deleteEmail(emails, id) {
  const updated = emails.filter(e => e.id !== id)
  saveEmails(updated)
  return updated
}
