import { useState, useEffect } from 'react'
import invincibleFlying from '../../assets/invincible/invincible-flying.png'
import invincibleTitleCard from '../../assets/invincible/title-card.png'

const INVINCIBLE_FLY_MS = 2200
const INVINCIBLE_TITLE_MS = 2000

type InvinciblePhase = 'fly' | 'title'

export default function InvincibleSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<InvinciblePhase>('fly')

  useEffect(() => {
    const toTitle = setTimeout(() => setPhase('title'), INVINCIBLE_FLY_MS)
    const toDone = setTimeout(() => onDone(), INVINCIBLE_FLY_MS + INVINCIBLE_TITLE_MS)
    return () => {
      clearTimeout(toTitle)
      clearTimeout(toDone)
    }
  }, [onDone])

  return (
    <div className="invincible-overlay" aria-hidden="true">
      {phase === 'fly' && (
        <div className="invincible-fly-stage">
          <div className="invincible-fly-grow">
            <img
              src={invincibleFlying}
              alt=""
              className="invincible-fly-image"
              draggable={false}
            />
          </div>
        </div>
      )}
      {phase === 'title' && (
        <img
          src={invincibleTitleCard}
          alt=""
          className="invincible-title-image"
          draggable={false}
        />
      )}
    </div>
  )
}
