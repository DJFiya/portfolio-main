import { Icon, type IconName } from '../icons'
import { useOs } from '../os-context'
import './games.css'

const GAMES: { app: string; name: string; meta: string; icon: IconName; bg: string; fg: string }[] = [
  { app: 'sword', name: 'Sword', meta: '12-boss rush', icon: 'sword', bg: '#1E2A1C', fg: '#F3F1E6' },
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
            <span className="cart" style={{ background: g.bg }}><Icon name={g.icon} size={36} color={g.fg} /></span>
            <span className="fi-name">{g.name}</span>
            <span className="fi-meta">{g.meta}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
