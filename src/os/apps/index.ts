import { createElement } from 'react'
import type { AppDef } from '../os-context'
import Resume, { ResumeTools } from './Resume'
import Settings from './Settings'
import Trash from './Trash'

export const APPS: Record<string, AppDef> = {
  resume: { title: 'Résumé', icon: 'resume', family: 'doc', w: 840, h: 640, tools: createElement(ResumeTools), Component: Resume },
  settings: { title: 'Settings', icon: 'settings', w: 560, h: 420, Component: Settings },
  trash: { title: 'Trash', icon: 'trash', w: 520, h: 360, Component: Trash },
}

// Dock groups, left to right, split by separators
export const DOCK: string[][] = [['projects', 'career', 'contact'], ['resume'], ['terminal', 'games', 'cinema', 'music'], ['settings']]
