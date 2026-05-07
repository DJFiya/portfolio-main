// ─── Meta ────────────────────────────────────────────────────────────────────

export interface Meta {
  title: string
  subtitle: string
}

// ─── Experiences ─────────────────────────────────────────────────────────────

export interface Experience {
  title: string
  company: string
  skills: string[]
}

// ─── Projects ────────────────────────────────────────────────────────────────

export type AwardTier = 'gold' | 'silver' | 'bronze'

export interface Project {
  name: string
  tagline: string
  awardLabel: string
  awardTier: AwardTier
  devpostUrl: string
}

// ─── Clubs ───────────────────────────────────────────────────────────────────

export interface Club {
  role: string
  org: string
}

// ─── Links ───────────────────────────────────────────────────────────────────

export type LinkIcon = 'github' | 'linkedin' | 'devpost' | 'twitter' | 'web'

export interface SocialLink {
  label: string
  handle: string
  url: string
  icon: LinkIcon
}

// ─── Desk props ──────────────────────────────────────────────────────────────

export type DeskPropType =
  | 'terminal'
  | 'blueprint'
  | 'stickers'
  | 'cables'
  | 'vinyl'
  | 'cassette'
  | 'controller'
  | 'book'
  | 'poem'
  | 'mug'
  | 'poster'
  | 'dice-d20'
  | 'dice-d12'
  | 'dice-d6'

export interface DeskProp {
  id: string
  type: DeskPropType
  label: string
  /** Percentage from left edge of desk container */
  x: number
  /** Percentage from top edge of desk container */
  y: number
  /** CSS rotation in degrees */
  rotate: number
  zIndex: number
}

// ─── Root portfolio data ──────────────────────────────────────────────────────

export interface PortfolioData {
  meta: Meta
  experiences: Experience[]
  projects: Project[]
  clubs: Club[]
  links: SocialLink[]
  desk: DeskProp[]
}
