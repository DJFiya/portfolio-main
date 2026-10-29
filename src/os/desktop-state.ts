import { useEffect, useState } from 'react'
import type { IconName } from './icons'

export type Point = { x: number; y: number }
export type Note = { id: number; text: string }
export type DesktopState = {
  wall: number
  pos: Record<string, Point>
  notes: Note[]
  trashed: string[]
}

const KEY = 'daevikos'
const SEED_NOTE = 'Start here: Projects launches like a mission, Career slides along the timeline, and the Résumé is one click from the top bar. Right-click the desktop for more.'

function load(): DesktopState {
  const fresh: DesktopState = { wall: 0, pos: {}, notes: [{ id: 1, text: SEED_NOTE }], trashed: [] }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...fresh, ...JSON.parse(raw) } : fresh
  } catch {
    return fresh
  }
}

// Wallpaper, item positions, sticky notes and the Trash survive reloads
export function useDesktopState() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode: keep it in memory */ }
  }, [state])
  return [state, setState] as const
}

export function defaultPos(id: string, W: number, H: number): Point {
  const right = W - 112
  const map: Record<string, [number, number]> = {
    resume: [right, 18], projects: [right, 122], career: [right, 226], sword: [right, 330],
    mug: [right - 104, 18], trash: [right, Math.max(434, H - 210)], note: [Math.max(24, W * 0.5 - 115), 24],
  }
  const [x, y] = map[id] ?? [80, 80]
  return { x, y }
}

type ItemDef = { id: string; label?: string; icon?: IconName; app?: string; doc?: boolean; trashable: boolean }

export const ITEMS: ItemDef[] = [
  { id: 'resume', label: 'Résumé', icon: 'resume', doc: true, app: 'resume', trashable: true },
  { id: 'projects', label: 'Projects', icon: 'projects', app: 'projects', trashable: true },
  { id: 'career', label: 'Career', icon: 'career', app: 'career', trashable: true },
  { id: 'sword', label: 'Sword', icon: 'sword', app: 'sword', trashable: true },
  { id: 'mug', label: 'Coffee mug', trashable: true },
  { id: 'trash', label: 'Trash', icon: 'trash', app: 'trash', trashable: false },
]

export const MUG_SIPS = 6
