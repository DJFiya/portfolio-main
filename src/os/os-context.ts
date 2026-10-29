import { createContext, useContext, type ComponentType, type ReactNode } from 'react'
import type { IconName } from './icons'

export type Family = 'light' | 'doc' | 'instrument' | 'media' | 'terminal'

// arg is whatever open() was last called with; argKey bumps each time so an
// already-open app can react to being reopened with a new target
export type AppProps = { arg?: unknown; argKey: number }

export type AppDef = {
  title: string
  icon: IconName
  family?: Family
  w: number
  h: number
  // Opened from inside another app, so left out of the dock and terminal
  hidden?: boolean
  tools?: ReactNode
  Component: ComponentType<AppProps>
}

export type OsApi = {
  open: (id: string, arg?: unknown) => void
  appIds: string[]
  setWall: (i: number) => void
  wall: number
  newNote: () => void
  resetDesk: () => void
  restore: (id: string) => void
  trashed: string[]
  // Returns sips left, or null when the mug is in the Trash
  sip: () => number | null
}

export const OsContext = createContext<OsApi | null>(null)

export function useOs() {
  const api = useContext(OsContext)
  if (!api) throw new Error('useOs must be used inside <Os>')
  return api
}
