# VORTEX — SOC Threat Analyzer

A browser-based SOC (Security Operations Center) dashboard for analyzing phishing emails, scanning IOCs, and managing threat cases — no backend required. Built as a portfolio-grade tool with a futuristic cyber UI.

**Live demo:** https://hamza-shaukat078.github.io/vortex-soc

---

## Features

### Tier 1 — Core SOC Workflow
| Feature | Description |
|---|---|
| **Email Log** | Manually log emails with sender, subject, verdict, red flags, IOCs, and MITRE tags |
| **AI Analyzer** | Paste raw email text — GPT-4o-mini detects phishing, scams, spoofed brands, and extracts IOCs automatically |
| **Header Analyzer** | Parse raw email headers; checks SPF, DKIM, DMARC, routing hops, and originating IP |
| **VirusTotal Scanner** | Scan URLs, IPs, domains, and file hashes against 70+ AV engines via VT API v3 |
| **EML Upload** | Drag-and-drop `.eml` files to auto-populate the log form |
| **Search & Filter** | Full-text search + verdict filter across the email log |

### Tier 2 — Advanced Analysis
| Feature | Description |
|---|---|
| **Campaign Grouping** | Emails auto-grouped by spoofed brand or sender domain |
| **Attack Timeline** | Chronological view of all logged threats |
| **Threat Actor Profiles** | Per-sender domain intelligence: verdict breakdown, IOC count, MITRE techniques |
| **MITRE ATT\&CK Tagging** | Tag each email with relevant ATT&CK technique IDs |
| **IOC Export** | Export IOCs as CSV or full STIX 2.1 bundle; HTML/JSON report export |
| **Case Management** | Auto-generated case IDs (VTX-YEAR-XXXXX), status tracking (open → escalated → closed), priority levels, and timestamped comments |
| **Stats & Trends** | 30-day detection chart, top spoofed brands, IOC type breakdown, MITRE technique coverage |
| **Tool Metrics Dashboard** | Live counters for headers parsed, VT scans run, AI analyses performed, and case statuses |
| **Keyboard Shortcuts** | Full keyboard navigation (press `?` for the shortcut reference) |
| **PWA** | Installable as a desktop/mobile app via service worker |

---

## Tech Stack

- **React 19** + **Vite 5**
- **Tailwind CSS v3** — cyber dark theme with custom glow utilities
- **motion** (Framer Motion v12) — animated transitions, counters, modals
- **Recharts** — trend line chart, bar chart, donut chart
- **GitHub Models API** — free GPT-4o-mini inference for AI analysis
- **VirusTotal API v3** — free tier IOC scanning
- **localStorage** — all data persisted client-side, zero backend
- **vite-plugin-pwa** — service worker + installable PWA
- **gh-pages** — GitHub Pages deployment

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Hamza-Shaukat078/vortex-soc.git
cd vortex-soc
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up API keys

Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

```env
VITE_GITHUB_TOKEN=your_github_pat_here
VITE_VIRUSTOTAL_KEY=your_virustotal_api_key_here
```

**Getting the keys (both are free):**

- **GitHub Token** → [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → no special scopes needed → copy the `github_pat_...` value
- **VirusTotal Key** → [virustotal.com](https://www.virustotal.com) → Sign up free → Account → API Key

> The app works without either key — AI Analyzer requires the GitHub token; VT Scanner requires the VirusTotal key. All other features work with no keys.

### 4. Run locally
```bash
npm run dev
```
Opens at `http://localhost:5173/vortex-soc/`

---

## Adding API Keys (Deployed / Browser)

If you're using the **live site** (GitHub Pages) or don't want to set up a local `.env`, you can enter keys directly in the app:

1. Open the app in your browser
2. Click the **⚙ gear icon** in the top-right corner of the header
3. Paste your **GitHub Token** and/or **VirusTotal API Key**
4. Click **Save Keys**

Keys are saved to your browser's `localStorage` — they persist across sessions on that browser and are never sent to any server. Each user/device enters their own keys.

**Getting the keys (both are free):**

- **GitHub Token** → [github.com/settings/tokens](https://github.com/settings/tokens) → **Generate new token (classic)** → give it any name → no scopes needed → Generate → copy the `github_pat_...` value
- **VirusTotal Key** → [virustotal.com](https://www.virustotal.com) → Sign up free → top-right avatar → **API Key**

> To remove saved keys, open Settings again, clear the fields, and click Save — or clear your browser's site data.

---

## Deployment (GitHub Pages)

```bash
npm run deploy
```

This builds the app and pushes the `dist/` folder to the `gh-pages` branch. GitHub Pages serves it from:
```
https://hamza-shaukat078.github.io/vortex-soc/
```

Make sure GitHub Pages is enabled on the repo: **Settings → Pages → Source → Deploy from branch → `gh-pages` / `/ (root)`**

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | New email form |
| `/` | Focus search |
| `1`–`8` | Switch views |
| `Del` | Delete selected email |
| `Esc` | Close modal |
| `?` | Shortcut reference |

---

## Project Structure

```
src/
├── components/
│   ├── AddEmailForm.jsx     # 4-tab log form (Basic / Red Flags / IOCs / MITRE)
│   ├── CampaignView.jsx     # Emails grouped by brand/domain
│   ├── CasePanel.jsx        # Case status, priority, comments
│   ├── Charts.jsx           # Recharts visualisations
│   ├── DetailPanel.jsx      # Email detail with Case tab
│   ├── EmailAnalyzer.jsx    # AI email analysis UI
│   ├── EmailLog.jsx         # Scrollable email list
│   ├── HeaderAnalyzer.jsx   # Header parsing UI
│   ├── MetricsBar.jsx       # Top-level email count cards
│   ├── SearchFilter.jsx     # Search + verdict filter
│   ├── ShortcutsModal.jsx   # Keyboard shortcut reference
│   ├── StatsView.jsx        # Trends + charts page
│   ├── ThreatActors.jsx     # Per-sender domain profiles
│   ├── TimelineView.jsx     # Chronological threat timeline
│   ├── ToolMetrics.jsx      # Tool usage counters on dashboard
│   └── VTScanner.jsx        # VirusTotal scan UI
├── hooks/
│   └── useKeyboardShortcuts.js
└── utils/
    ├── activityStorage.js   # Tracks tool usage in localStorage
    ├── analyzeEmail.js      # GitHub Models API call
    ├── cases.js             # Case ID generation + status enums
    ├── exportReport.js      # HTML / JSON / CSV / STIX export
    ├── parseEml.js          # .eml file parser
    ├── parseHeaders.js      # Raw header parser (SPF/DKIM/DMARC)
    ├── storage.js           # Email CRUD in localStorage
    └── virustotal.js        # VirusTotal API v3 wrapper
```

---

## Data & Privacy

All data is stored in your browser's `localStorage` — nothing is sent to any server except:
- Email text sent to **GitHub Models API** (Microsoft Azure, governed by GitHub's terms) when you click **Analyze Email**
- IOC values sent to **VirusTotal API** when you click **Scan**

No accounts, no databases, no telemetry.

---

## License

MIT
