import type React from 'react'
import { useState, useEffect } from 'react'
import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'

const data = rawData as unknown as PortfolioData

const QTE_KEYS = ['E', 'F', 'SPACE', 'R'] as const
const QTE_TICK_MS = 700

// ── "Split Screen Reality" overlay ────────────────────────────────────────────
// Layered, non-destructive HUD that runs while the controller is engaged.
// Pain-point removals baked into the component:
//   • The whole tree has pointer-events:none so it never blocks dice / sword /
//     laptop clicks — keeping those handlers reachable IS the payoff
//   • Only the floating "EXIT" pill captures clicks (escape hatch with mouse)
//   • Per-item HUD chips are anchored via getBoundingClientRect and re-read on
//     resize/scroll so they stay aligned even if layout shifts
//   • prefers-reduced-motion suppresses the heavier animations (handled in CSS)
interface GameLabelInfo {
  id:      string
  label:   string
  variant: string
  cx:      number
  cy:      number
  top:     number
}

export default function GameModeOverlay({ laptopRef, onExit }: { laptopRef: React.RefObject<HTMLDivElement | null>; onExit: () => void }) {
  const [labels,     setLabels]     = useState<GameLabelInfo[]>([])
  const [laptopRect, setLaptopRect] = useState<DOMRect | null>(null)
  const [qteIndex,   setQteIndex]   = useState(0)

  useEffect(() => {
    const update = () => {
      const items = document.querySelectorAll<HTMLElement>('.desk-item[data-game-label]')
      const next: GameLabelInfo[] = []
      items.forEach(el => {
        const r = el.getBoundingClientRect()
        next.push({
          id:      el.dataset.itemId ?? '',
          label:   el.dataset.gameLabel ?? '',
          variant: el.dataset.gameVariant ?? '',
          cx:      r.left + r.width / 2,
          cy:      r.top  + r.height / 2,
          top:     r.top,
        })
      })
      setLabels(next)
      const lr = laptopRef.current?.getBoundingClientRect() ?? null
      setLaptopRect(lr)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [laptopRef])

  useEffect(() => {
    const id = setInterval(() => setQteIndex(i => (i + 1) % QTE_KEYS.length), QTE_TICK_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="game-mode-overlay" aria-hidden="true">
      <div className="game-mode-tint" />
      <div className="game-mode-scanlines" />
      <div className="game-mode-vignette" />
      <div className="game-mode-letterbox game-mode-letterbox--top" />
      <div className="game-mode-letterbox game-mode-letterbox--bottom" />

      <div className="game-mode-banner">
        <span className="game-mode-banner-bracket">[</span>
        SYSTEM&nbsp;ENGAGED
        <span className="game-mode-banner-bracket">]</span>
      </div>

      <div className="game-mode-hud">
        <div className="game-mode-hud-row">
          <span className="game-mode-hud-key">STATUS</span>
          <span className="game-mode-hud-val game-mode-hud-val--ok">ONLINE</span>
        </div>
        <div className="game-mode-hud-row">
          <span className="game-mode-hud-key">OBJECTS</span>
          <span className="game-mode-hud-val">{data.desk.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="game-mode-hud-row">
          <span className="game-mode-hud-key">EXIT</span>
          <span className="game-mode-hud-val game-mode-hud-val--dim">[ESC]</span>
        </div>
      </div>

      {labels.map(l => (
        <div
          key={l.id}
          className={`game-mode-chip game-mode-chip--${l.variant}`}
          style={{ left: l.cx, top: l.top - 14 }}
        >
          {l.label}
        </div>
      ))}

      {laptopRect && (
        <div
          className="game-mode-qte"
          style={{
            left: laptopRect.left + laptopRect.width / 2,
            top:  laptopRect.top  + laptopRect.height + 10,
          }}
        >
          <div className="game-mode-qte-keycap" key={qteIndex}>
            {QTE_KEYS[qteIndex]}
          </div>
          <div className="game-mode-qte-label">QUICK&nbsp;TIME</div>
        </div>
      )}

      <button
        type="button"
        className="game-mode-exit-pill"
        onClick={onExit}
        aria-label="Exit game mode"
      >
        ✕ EXIT
      </button>
    </div>
  )
}
