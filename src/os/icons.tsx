import type { ReactNode } from 'react'

const PATHS = {
  // A planet with an orbit ring and a satellite, for the launch console
  projects: 'M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zM4.2 15.5c-1.3-1.9 2-5 7.3-7s10.3-2.3 11.4-.4M19.8 8.5c1.3 1.9-2 5-7.3 7s-10.3 2.3-11.4.4M20.5 6.2h.01',
  career: 'M3 17.5c3-6 6-6 9-2.5s6 3.5 9-3M5 17.5a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0zM22.2 12a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0z',
  resume: 'M7 3h7l4 4v14H7zM14 3v4h4M9.8 12h5.4M9.8 15.5h5.4',
  contact: 'M5 18V9.5a7 7 0 0 1 14 0V18M5 14h3v5H5zM16 14h3v5h-3z',
  terminal: 'M3.5 5h17v14h-17zM7 10l3 2.5L7 15M12.5 15.5h4.5',
  cinema: 'M3.5 5.5h17v13h-17zM7 5.5v13M17 5.5v13M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5',
  music: 'M9 17.5V6l10-2v11.5M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 15.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  trash: 'M5 7h14M9.5 7V4.5h5V7M7 7l1 13h8l1-13M10.5 11v5M13.5 11v5',
  sword: 'M20 4l-9 9M20 4h-3.5l-8 8M20 4v3.5l-8 8M6.5 12.5l5 5M9 15l-4.5 4.5M3.8 18.7l1.5 1.5',
}

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 28, color = '#F1F5F2', stroke = 1.6 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

// 16px glyphs for window controls and media transport, coloured by currentColor
function Glyph({ size = 14, children }: { size?: number; children: ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">{children}</svg>
}

export const CloseGlyph = () => <Glyph><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Glyph>
export const MinGlyph = () => <Glyph><path d="M4 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></Glyph>
export const MaxGlyph = () => <Glyph><path d="M4 4h8v8H4z" fill="none" stroke="currentColor" strokeWidth="1.5" /></Glyph>
export const PlayGlyph = () => <Glyph size={16}><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></Glyph>
export const PauseGlyph = () => <Glyph size={16}><path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" fill="currentColor" /></Glyph>
export const PrevGlyph = () => <Glyph size={16}><path d="M4 3.5v9M12.5 3.5v9L6 8z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></Glyph>
export const NextGlyph = () => <Glyph size={16}><path d="M12 3.5v9M3.5 3.5v9L10 8z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></Glyph>
