import { createElement } from 'react'
import type { AppDef } from '../os-context'
import BossRush from './bossrush/BossRush'
import Career from './Career'
import Cinema from './Cinema'
import Contact from './Contact'
import Games from './Games'
import Music from './Music'
import Projects from './Projects'
import Resume, { ResumeTools } from './Resume'
import Settings from './Settings'
import Snake from './Snake'
import Terminal from './Terminal'
import Trash from './Trash'

export const APPS: Record<string, AppDef> = {
  bossrush: { title: 'Boss Rush', icon: 'sword', family: 'media', hidden: true, w: 820, h: 560, Component: BossRush },
  games: { title: 'Games', icon: 'folder', w: 520, h: 300, Component: Games },
  music: { title: 'Music', icon: 'music', family: 'media', w: 760, h: 420, Component: Music },
  projects: { title: 'Projects', icon: 'projects', family: 'instrument', w: 1000, h: 620, Component: Projects },
  career: { title: 'Career', icon: 'career', family: 'instrument', w: 980, h: 600, Component: Career },
  cinema: { title: 'Cinema', icon: 'cinema', family: 'media', w: 900, h: 540, Component: Cinema },
  contact: { title: 'Contact', icon: 'contact', family: 'instrument', w: 640, h: 470, Component: Contact },
  resume: { title: 'Résumé', icon: 'resume', family: 'doc', w: 840, h: 640, tools: createElement(ResumeTools), Component: Resume },
  settings: { title: 'Settings', icon: 'settings', w: 560, h: 420, Component: Settings },
  snake: { title: 'Snake', icon: 'snake', family: 'media', hidden: true, w: 620, h: 520, Component: Snake },
  terminal: { title: 'Terminal', icon: 'terminal', family: 'terminal', w: 640, h: 400, Component: Terminal },
  trash: { title: 'Trash', icon: 'trash', w: 520, h: 360, Component: Trash },
}

// Dock groups, left to right, split by separators
export const DOCK: string[][] = [['projects', 'career', 'contact'], ['resume'], ['terminal', 'games', 'cinema', 'music'], ['settings']]
