export const MITRE_TECHNIQUES = [
  { id: 'T1566', name: 'Phishing', tactic: 'Initial Access' },
  { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access' },
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access' },
  { id: 'T1566.003', name: 'Spearphishing via Service', tactic: 'Initial Access' },
  { id: 'T1598', name: 'Phishing for Information', tactic: 'Reconnaissance' },
  { id: 'T1598.001', name: 'Spearphishing Service', tactic: 'Reconnaissance' },
  { id: 'T1598.002', name: 'Spearphishing Attachment', tactic: 'Reconnaissance' },
  { id: 'T1598.003', name: 'Spearphishing Link', tactic: 'Reconnaissance' },
  { id: 'T1204', name: 'User Execution', tactic: 'Execution' },
  { id: 'T1204.001', name: 'Malicious Link', tactic: 'Execution' },
  { id: 'T1204.002', name: 'Malicious File', tactic: 'Execution' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
  { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access' },
  { id: 'T1539', name: 'Steal Web Session Cookie', tactic: 'Credential Access' },
  { id: 'T1056', name: 'Input Capture / Keylogging', tactic: 'Credential Access' },
  { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
  { id: 'T1190', name: 'Exploit Public-Facing App', tactic: 'Initial Access' },
]

export const TACTIC_COLORS = {
  'Initial Access':    'bg-red-500/10 text-red-400 border-red-500/20',
  'Reconnaissance':    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Execution':         'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Credential Access': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Defense Evasion':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Impact':            'bg-pink-500/10 text-pink-400 border-pink-500/20',
}
