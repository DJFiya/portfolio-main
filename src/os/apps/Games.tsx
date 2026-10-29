import { useOs } from '../os-context'
import './games.css'

export default function Games() {
  const os = useOs()
  return (
    <div className="games">
      <button type="button" className="game" style={{ background: '#1E2A1C', color: '#F3F1E6' }} onClick={() => os.open('sword')}>
        <b>Sword</b><span>Boss rush through 12 enemies. Click to strike, spend gold on upgrades.</span>
      </button>
      <button type="button" className="game" style={{ background: '#20262B', color: '#EEF1F2' }} onClick={() => os.open('dice')}>
        <b>Dice</b><span>Roll the d6, d12 and d20. Max is a critical hit, a 1 is a critical fail.</span>
      </button>
    </div>
  )
}
