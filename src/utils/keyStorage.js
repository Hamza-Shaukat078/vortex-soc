const GH_KEY = 'vortex_github_token'
const VT_KEY = 'vortex_vt_key'

export function getGithubToken() {
  return localStorage.getItem(GH_KEY) || import.meta.env.VITE_GITHUB_TOKEN || ''
}
export function setGithubToken(val) {
  val ? localStorage.setItem(GH_KEY, val) : localStorage.removeItem(GH_KEY)
}

export function getVTKey() {
  return localStorage.getItem(VT_KEY) || import.meta.env.VITE_VIRUSTOTAL_KEY || ''
}
export function setVTKey(val) {
  val ? localStorage.setItem(VT_KEY, val) : localStorage.removeItem(VT_KEY)
}
