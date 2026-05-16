const ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions'
const MODEL = 'gpt-4o-mini'

const SYSTEM_PROMPT = `You are an expert email security analyst. Analyze the provided raw email and return a JSON object with exactly these fields:

{
  "verdict": "phishing" | "scam" | "suspicious" | "legitimate",
  "threatType": string,
  "confidence": "high" | "medium" | "low",
  "sender": string,
  "subject": string,
  "spoofedBrand": string or null,
  "redFlags": string[],
  "iocs": [{ "type": "IP" | "URL" | "Domain" | "Hash" | "Email", "value": string }],
  "explanation": string
}

Guidelines:
- "phishing": tries to steal credentials or personal info
- "scam": financial fraud, fake prizes, advance fee fraud
- "suspicious": something is off but not conclusive
- "legitimate": appears genuine
- threatType examples: "Credential Harvesting", "Advance Fee Fraud", "Business Email Compromise", "Malware Delivery", "Spam", "Spear Phishing", "Legitimate"
- Extract ALL URLs, IPs, domains and suspicious email addresses as IOCs
- redFlags: list every specific red flag you observe
- explanation: 2-3 sentences explaining your verdict

Return ONLY valid JSON, no markdown, no extra text.`

export async function analyzeEmail(rawEmail) {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  if (!token || token === 'paste_your_new_token_here') {
    throw new Error('GitHub token not configured in .env file')
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this email:\n\n${rawEmail}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}
