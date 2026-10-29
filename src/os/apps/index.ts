import { createElement } from 'react'
import type { AppDef } from '../os-context'
import Career from './Career'
import Contact from './Contact'
import Projects from './Projects'
import Resume, { ResumeTools } from './Resume'
import Settings from './Settings'
import Trash from './Trash'

export const APPS: Record<string, AppDef> = {
  projects: { title: 'Projects', icon: 'projects', family: 'instrument', w: 1000, h: 620, Component: Projects },
  career: { title: 'Career', icon: 'career', family: 'instrument', w: 980, h: 600, Component: Career },
  contact: { title: 'Contact', icon: 'contact', family: 'instrument', w: 640, h: 470, Component: Contact },
  resume: { title: 'Résumé', icon: 'resume', family: 'doc', w: 840, h: 640, tools: createElement(ResumeTools), Component: Resume },
  settings: { title: 'Settings', icon: 'settings', w: 560, h: 420, Component: Settings },
  trash: { title: 'Trash', icon: 'trash', w: 520, h: 360, Component: Trash },
}

// Dock groups, left to right, split by separators
export const DOCK: string[][] = [['projects', 'career', 'contact'], ['resume'], ['terminal', 'games', 'cinema', 'music'], ['settings']]
