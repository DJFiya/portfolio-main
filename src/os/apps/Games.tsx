import type { ReactNode } from 'react'
import { useOs } from '../os-context'
import './games.css'

// [x, y, w, h, fill] on an 8×8 pixel grid
type Px = [number, number, number, number, string]

function Pixels({ px }: { px: Px[] }) {
  return (
    <svg viewBox="0 0 8 8" width="76" height="76" shapeRendering="crispEdges" aria-hidden="true">
      {px.map(([x, y, w, h, f], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={f} />)}
    </svg>
  )
}

// Each card is a still from the game itself, in its own palette
const SNAKE: Px[] = [
  ...Array.from({ length: 64 }, (_, i): Px => [i % 8, Math.floor(i / 8), 1, 1, (i % 8 + Math.floor(i / 8)) % 2 ? '#151D19' : '#18211C']),
  [1, 5, 4, 1, '#6FBF73'], [4, 3, 1, 2, '#7FD38B'], [4, 3, 2, 1, '#7FD38B'], [5, 3, 1, 1, '#A8E6A0'],
  [6, 1, 1, 1, '#F2B24C'],
]
const BOSS: Px[] = [
  [0, 0, 8, 8, '#5FB04C'], [0, 0, 8, 1, '#73C160'], [0, 7, 8, 1, '#4A8C3B'],
  [1, 2, 2, 2, '#111'], [5, 2, 2, 2, '#111'], [3, 4, 2, 2, '#111'], [2, 5, 1, 2, '#111'], [5, 5, 1, 2, '#111'],
]

const GAMES: { app: string; name: string; art: ReactNode }[] = [
  { app: 'snake', name: 'Snake', art: <Pixels px={SNAKE} /> },
  { app: 'bossrush', name: 'Boss Rush', art: <Pixels px={BOSS} /> },
]

export default function Games() {
  const os = useOs()
  return (
    <div className="folder">
      <div className="toolbar">
        <div className="crumb">Games</div>
        <span className="folder-count">{GAMES.length} {GAMES.length === 1 ? 'game' : 'games'}</span>
      </div>
      <div className="folder-grid">
        {GAMES.map(g => (
          <button key={g.app} type="button" className="folder-item" onClick={() => os.open(g.app)}>
            <span className="cart">{g.art}</span>
            <span className="fi-name">{g.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
