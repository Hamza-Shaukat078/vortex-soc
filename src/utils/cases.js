export function generateCaseId() {
  const year = new Date().getFullYear()
  const seq = String(Date.now()).slice(-5)
  return `VTX-${year}-${seq}`
}

export const CASE_STATUSES = [
  { value: 'open',        label: 'Open',        color: '#38bdf8', bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400'    },
  { value: 'in-progress', label: 'In Progress', color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  { value: 'escalated',   label: 'Escalated',   color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  { value: 'closed',      label: 'Closed',      color: '#22c55e', bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400'  },
]

export const PRIORITIES = [
  { value: 'critical', label: 'Critical', color: '#ef4444', text: 'text-red-400'    },
  { value: 'high',     label: 'High',     color: '#f97316', text: 'text-orange-400' },
  { value: 'medium',   label: 'Medium',   color: '#eab308', text: 'text-yellow-400' },
  { value: 'low',      label: 'Low',      color: '#22c55e', text: 'text-green-400'  },
]

export function getStatus(val) {
  return CASE_STATUSES.find(s => s.value === val) || CASE_STATUSES[0]
}

export function getPriority(val) {
  return PRIORITIES.find(p => p.value === val) || PRIORITIES[1]
}
