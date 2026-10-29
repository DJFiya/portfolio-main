import { APPS } from './apps'
import type { LaunchArg } from './apps/Projects'
import { PROJECTS } from './content'

// Paths from the old book site, so links already on a résumé or LinkedIn still land somewhere useful
const OLD_PATHS: Record<string, string> = { '/projects': 'projects', '/experience': 'career', '/links': 'contact', '/links/resume': 'resume' }

// #resume opens that app; #compass opens Projects on that project
export function routeFor(name: string): [string, unknown?] | null {
  if (APPS[name]) return [name]
  const p = PROJECTS.find(x => x.id === name)
  return p ? ['projects', { id: p.id } satisfies LaunchArg] : null
}

// Moves an old path onto its hash, and any other path back to /, so every link resolves to one URL shape
export function normalizeUrl() {
  const old = OLD_PATHS[location.pathname.replace(/\/$/, '')]
  if (old) history.replaceState(null, '', '/#' + old)
  else if (location.pathname !== '/') history.replaceState(null, '', '/' + location.hash)
}

// Keeps the address bar on the window in front, so copying the URL shares what you are looking at
export function syncHash(topId: string | undefined) {
  const current = location.hash.slice(1)
  if (topId === 'projects' && PROJECTS.some(p => p.id === current)) return
  const want = topId ? '#' + topId : ''
  if (location.hash !== want) history.replaceState(null, '', '/' + location.search + want)
}
