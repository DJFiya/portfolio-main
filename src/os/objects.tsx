import { useId, type ReactNode } from 'react'

// Desktop and dock icons: each is the object itself, flat in two or three tones, lit from the top left.
// Drawn on a 48×48 grid with no tile behind them, like icons on a real desktop.

// [x, y, w, h, fill] on the 8×8 sprite grid the games use
type Px = [number, number, number, number, string]
const sprite = (px: Px[]) => (
  <g transform="translate(6 6) scale(4.5)" shapeRendering="crispEdges">
    {px.map(([x, y, w, h, f], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={f} />)}
  </g>
)
const SNAKE: Px[] = [
  [0, 0, 8, 8, '#18211C'], [1, 5, 4, 1, '#6FBF73'], [4, 3, 1, 2, '#7FD38B'], [4, 3, 2, 1, '#7FD38B'], [5, 3, 1, 1, '#A8E6A0'], [6, 1, 1, 1, '#F2B24C'],
]
const CREEPER: Px[] = [
  [0, 0, 8, 8, '#5FB04C'], [0, 0, 8, 1, '#73C160'], [0, 7, 8, 1, '#4A8C3B'],
  [1, 2, 2, 2, '#1A1D22'], [5, 2, 2, 2, '#1A1D22'], [3, 4, 2, 2, '#1A1D22'], [2, 5, 1, 2, '#1A1D22'], [5, 5, 1, 2, '#1A1D22'],
]

const ART: Record<string, (stripes: string) => ReactNode> = {
  resume: () => <>
    <path d="M12 7a2 2 0 0 1 2-2h16l7 7v29a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z" fill="#F4F1EA" />
    <path d="M30 5v5a2 2 0 0 0 2 2h5z" fill="#D6D0C2" />
    <rect x="16" y="11" width="10" height="3" rx="1" fill="#3C4C6E" />
    <path d="M17 19h15M17 24h12M17 29h15M17 34h9" stroke="#B9B4A8" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 39h25v2a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z" fill="#DDD8CB" />
  </>,
  projects: () => <>
    <path d="M4 24a20 6.5 0 0 1 40 0" transform="rotate(-18 24 24)" fill="none" stroke="#C98F2E" strokeWidth="3" />
    <circle cx="24" cy="24" r="11" fill="#8FA2C8" />
    <path d="M24 13a11 11 0 0 1 0 22 9 11 0 0 0 0-22z" fill="#6C80A8" />
    <circle cx="20" cy="20" r="2" fill="#A9B9DA" />
    <path d="M4 24a20 6.5 0 0 0 40 0" transform="rotate(-18 24 24)" fill="none" stroke="#F2B24C" strokeWidth="3" />
    <rect x="37" y="9" width="4" height="4" rx="1" fill="#F4F1EA" />
  </>,
  career: () => <>
    <path d="M6 12l11-4 13 4 12-4v28l-12 4-13-4-11 4z" fill="#E8DDBF" />
    <path d="M17 8l13 4v28l-13-4z" fill="#D5C7A1" />
    <path d="M10 34c4-1 5-6 9-6s5 4 9 2 4-9 8-12" fill="none" stroke="#C2562E" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 4.2" />
    <path d="M36 9a4 4 0 0 1 4 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 0 1 4-4z" fill="#C2562E" />
    <circle cx="36" cy="13" r="1.5" fill="#F4F1EA" />
  </>,
  games: () => <>
    <path d="M6 13a2 2 0 0 1 2-2h10l3 3h19a2 2 0 0 1 2 2v4H6z" fill="#C9973F" />
    <path d="M5 19h38a1 1 0 0 1 1 1.1l-1.8 18.1A2 2 0 0 1 40.2 40H7.8a2 2 0 0 1-2-1.8L4 20.1A1 1 0 0 1 5 19z" fill="#E2B65C" />
    <g transform="translate(19 24) scale(1.25)" shapeRendering="crispEdges">
      {CREEPER.map(([x, y, w, h, f], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={f} />)}
    </g>
  </>,
  trash: () => <>
    <rect x="19" y="5" width="10" height="4" rx="1.5" fill="#7F8893" />
    <rect x="9" y="9" width="30" height="5" rx="1.5" fill="#B7BEC7" />
    <path d="M12 15h24l-2 25a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="#9AA3AE" />
    <path d="M30 15h6l-2 25a2 2 0 0 1-2 2h-3z" fill="#88919C" />
    <path d="M19 19v18M24 19v18" stroke="#7F8893" strokeWidth="2" strokeLinecap="round" />
  </>,
  contact: () => <>
    <rect x="17" y="3" width="3" height="11" rx="1.5" fill="#4A5157" />
    <rect x="13" y="12" width="22" height="32" rx="4" fill="#4A5157" />
    <rect x="29" y="12" width="6" height="32" rx="3" fill="#3A4045" />
    <path d="M17 18h12M17 21h12M17 24h12" stroke="#6E767D" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="16" y="29" width="14" height="8" rx="1.5" fill="#0A110D" />
    <path d="M18 33h7" stroke="#F2B24C" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="31" cy="16" r="1.6" fill="#F2B24C" />
  </>,
  terminal: () => <>
    <rect x="6" y="7" width="36" height="28" rx="4" fill="#D9D2BE" />
    <rect x="10" y="11" width="28" height="20" rx="2.5" fill="#0A110D" />
    <path d="M14 17l4 3-4 3" fill="none" stroke="#7FD38B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="20" y="22" width="7" height="2" fill="#7FD38B" />
    <rect x="19" y="35" width="10" height="4" fill="#BFB7A1" />
    <rect x="14" y="39" width="20" height="3" rx="1.5" fill="#D9D2BE" />
  </>,
  cinema: stripes => <>
    <rect x="8" y="11" width="32" height="7" rx="1" transform="rotate(-14 8 18)" fill={`url(#${stripes})`} />
    <rect x="8" y="19" width="32" height="5" fill={`url(#${stripes})`} />
    <rect x="8" y="24" width="32" height="17" rx="1.5" fill="#2A2E31" />
    <path d="M12 30h14M12 35h9" stroke="#8E959B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="18.5" r="1.8" fill="#8E959B" />
  </>,
  music: () => <>
    <rect x="4" y="11" width="40" height="27" rx="3" fill="#2A2C2E" />
    <rect x="9" y="15" width="30" height="10" rx="1.5" fill="#C2562E" />
    <path d="M12 19h16" stroke="#F4F1EA" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M13 38l3-6h16l3 6z" fill="#3A3D40" />
    <rect x="15" y="27" width="18" height="6" rx="3" fill="#111" />
    <circle cx="19" cy="30" r="2" fill="#8E959B" />
    <circle cx="29" cy="30" r="2" fill="#8E959B" />
  </>,
  settings: () => <>
    <rect x="5" y="9" width="38" height="30" rx="4" fill="#C9C3B3" />
    {[[9, 13], [39, 13], [9, 35], [39, 35]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill="#A39C89" />)}
    <rect x="16" y="14" width="3" height="20" rx="1.5" fill="#2A2E31" />
    <rect x="29" y="14" width="3" height="20" rx="1.5" fill="#2A2E31" />
    <rect x="12.5" y="25" width="10" height="6" rx="1.5" fill="#E9E4D7" />
    <rect x="12.5" y="27.3" width="10" height="1.4" fill="#2A2E31" />
    <rect x="25.5" y="16" width="10" height="6" rx="1.5" fill="#E9E4D7" />
    <rect x="25.5" y="18.3" width="10" height="1.4" fill="#2A2E31" />
  </>,
  snake: () => sprite(SNAKE),
  bossrush: () => sprite(CREEPER),
}

export function ObjectIcon({ id, size = 56 }: { id: string; size?: number }) {
  const stripes = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {id === 'cinema' && (
        <defs>
          <pattern id={stripes} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="#1A1D22" /><rect x="3" width="3" height="6" fill="#F4F1EA" />
          </pattern>
        </defs>
      )}
      {ART[id]?.(stripes)}
    </svg>
  )
}

// The mug drops its coffee level and steam as it is drunk
export function MugObject({ fill, size = 56 }: { fill: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {fill > 0 && <path className="steam" d="M17 4c-2 2 2 3 0 5M23 4c-2 2 2 3 0 5M29 4c-2 2 2 3 0 5" fill="none" stroke="#F4F1EA" strokeWidth="1.8" strokeLinecap="round" opacity=".65" />}
      <path d="M34 19h3a6 6 0 0 1 0 12h-3" fill="none" stroke="#DDD8CB" strokeWidth="3.5" />
      <path d="M10 14h24v19a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="#F4F1EA" />
      <path d="M27 14h7v19a8 8 0 0 1-8 8h-1a8 8 0 0 0 2-8z" fill="#DDD8CB" />
      <ellipse cx="22" cy="14" rx="12" ry="2.8" fill="#8A8476" />
      <ellipse cx="22" cy="14" rx={12 * fill} ry={2.8 * fill} fill="#6B4428" />
    </svg>
  )
}
