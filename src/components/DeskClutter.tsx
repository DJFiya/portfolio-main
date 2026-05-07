import type React from 'react'
import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'

const data = rawData as unknown as PortfolioData

const ROLL_MS = 820
const CRIT_MS = 2600
const ATLA_MS = 900
const DPS_MS  = 4500

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
}

type CritState  = 'hit' | 'fail'
type AtlaEffect = 'fire' | 'earth' | 'water' | 'air'

const ATLA_EFFECTS: AtlaEffect[] = ['fire', 'earth', 'water', 'air']
const ATLA_LABELS: Record<AtlaEffect, string> = {
  fire:  '🔥 FIRE',
  earth: '🪨 EARTH',
  water: '💧 WATER',
  air:   '💨 AIR',
}

interface AtlaBurst {
  effect: AtlaEffect
  // poster's viewport position/size at click time
  left: number
  top: number
  width: number
  height: number
  tick: number
}

interface DpsBurst {
  left: number
  top: number
  width: number
  height: number
  tick: number
}

export default function DeskClutter() {
  const [rolling,    setRolling]    = useState<Set<string>>(new Set())
  const [diceValues, setDiceValues] = useState<Record<string, number>>(
    Object.fromEntries(
      data.desk.filter(i => i.type.startsWith('dice-')).map(i => [i.id, DICE_MAX[i.type]])
    )
  )
  const [criticals,  setCriticals]  = useState<Record<string, CritState>>({})
  const [atlaBurst,  setAtlaBurst]  = useState<AtlaBurst | null>(null)
  const [dpsBurst,   setDpsBurst]   = useState<DpsBurst  | null>(null)
  const atlaRef = useRef<HTMLDivElement | null>(null)
  const dpsRef  = useRef<HTMLDivElement | null>(null)

  const handleRoll = useCallback((id: string, type: string) => {
    if (rolling.has(id)) return
    const max    = DICE_MAX[type] ?? 6
    const result = Math.floor(Math.random() * max) + 1
    setRolling(prev => new Set(prev).add(id))
    setTimeout(() => {
      setDiceValues(prev => ({ ...prev, [id]: result }))
      setRolling(prev => { const s = new Set(prev); s.delete(id); return s })
      const crit: CritState | null = result === max ? 'hit' : result === 1 ? 'fail' : null
      if (crit) {
        setCriticals(prev => ({ ...prev, [id]: crit }))
        setTimeout(() => {
          setCriticals(prev => { const s = { ...prev }; delete s[id]; return s })
        }, CRIT_MS)
      }
    }, ROLL_MS)
  }, [rolling])

  const handleDps = useCallback(() => {
    if (dpsBurst) return
    const rect = dpsRef.current?.getBoundingClientRect()
    if (!rect) return
    setDpsBurst(prev => ({
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      tick: (prev?.tick ?? 0) + 1,
    }))
    setTimeout(() => setDpsBurst(null), DPS_MS)
  }, [dpsBurst])

  const handleAtla = useCallback(() => {
    if (atlaBurst) return
    const rect = atlaRef.current?.getBoundingClientRect()
    if (!rect) return
    const effect = ATLA_EFFECTS[Math.floor(Math.random() * ATLA_EFFECTS.length)]
    setAtlaBurst(prev => ({
      effect,
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      tick: (prev?.tick ?? 0) + 1,
    }))
    setTimeout(() => setAtlaBurst(null), ATLA_MS)
  }, [atlaBurst])

  return (
    <>
      {data.desk.map((item) => {
        const isDice       = item.type.startsWith('dice-')
        const isAtlaPoster = item.type === 'poster' && item.label === 'ATLA'
        const isDpsPoster  = item.type === 'poster' && item.label === 'Dead Poets'
        const isRolling    = rolling.has(item.id)
        const crit         = criticals[item.id]

        const innerClass = [
          isRolling       ? 'dice-rolling'   : undefined,
          crit === 'hit'  ? 'dice-crit-hit'  : undefined,
          crit === 'fail' ? 'dice-crit-fail' : undefined,
        ].filter(Boolean).join(' ') || undefined

        return (
          <div
            key={item.id}
            ref={isAtlaPoster ? atlaRef : isDpsPoster ? dpsRef : undefined}
            className="absolute select-none desk-item"
            style={{
              left: `${item.x}%`,
              top:  `${item.y}%`,
              '--item-rotate': `${item.rotate}deg`,
              zIndex: item.zIndex,
              cursor: isDice || isAtlaPoster || isDpsPoster ? 'pointer' : undefined,
            } as React.CSSProperties}
            onClick={
              isDice         ? () => handleRoll(item.id, item.type)
              : isAtlaPoster ? handleAtla
              : isDpsPoster  ? handleDps
              : undefined
            }
          >
            {crit && (
              <div className={`dice-crit-label dice-crit-label--${crit}`}>
                {crit === 'hit' ? 'CRITICAL HIT' : 'CRITICAL FAIL'}
              </div>
            )}
            <div className={innerClass}>
              <DeskItemSVG
                type={item.type}
                label={item.label}
                diceValue={isRolling ? undefined : diceValues[item.id]}
              />
            </div>
          </div>
        )
      })}

      {/* Render burst into document.body so nothing can clip or block it */}
      {atlaBurst && createPortal(
        <AtlaParticles key={atlaBurst.tick} burst={atlaBurst} />,
        document.body
      )}

      {dpsBurst && createPortal(
        <DeadPoetsParticles key={dpsBurst.tick} burst={dpsBurst} />,
        document.body
      )}
    </>
  )
}

// ── Dead Poets Society — words drifting off the poster like embers ────────────
const DPS_PHRASES: {
  text: string
  xPct: number
  yPct: number
  drift: number
  size: number
  delay: string
  dur: string
  italic: boolean
}[] = [
  { text: 'O Captain! My Captain!',           xPct: 0.08, yPct: 0.60, drift: -16, size: 18,  delay: '0s',    dur: '2.9s', italic: true  },
  { text: 'Carpe Diem',                       xPct: 0.48, yPct: 0.30, drift:  13, size: 22,  delay: '0.22s', dur: '3.4s', italic: false },
  { text: 'Suck the marrow out of life',      xPct: 0.05, yPct: 0.78, drift: -20, size: 15,  delay: '0.52s', dur: '3.1s', italic: true  },
  { text: 'O me! O life!',                    xPct: 0.60, yPct: 0.50, drift: -9,  size: 16,  delay: '0.38s', dur: '3.6s', italic: true  },
  { text: 'Gather ye rosebuds',               xPct: 0.02, yPct: 0.40, drift:  24, size: 14,  delay: '1.05s', dur: '3.2s', italic: false },
  { text: 'To strive, to seek, to find',      xPct: 0.10, yPct: 0.70, drift: -22, size: 14,  delay: '1.40s', dur: '3.0s', italic: true  },
  { text: 'Seize the day',                    xPct: 0.55, yPct: 0.20, drift:  10, size: 16,  delay: '0.65s', dur: '3.3s', italic: false },
  { text: 'make your lives extraordinary',    xPct: 0.03, yPct: 0.92, drift:  28, size: 13,  delay: '1.75s', dur: '3.1s', italic: true  },
  { text: 'No matter what anybody says',      xPct: 0.06, yPct: 0.55, drift: -14, size: 13,  delay: '1.20s', dur: '3.4s', italic: true  },
  { text: 'words and ideas can change the world', xPct: 0.00, yPct: 0.98, drift: 30, size: 12, delay: '2.0s', dur: '3.2s', italic: true },
]

function DeadPoetsParticles({ burst }: { burst: DpsBurst }) {
  const { left, top, width, height } = burst

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'visible' }}>
      {DPS_PHRASES.map((p, i) => (
        <div
          key={i}
          className="dps-word"
          style={{
            left: left + width  * p.xPct,
            top:  top  + height * p.yPct,
            fontSize:          p.size,
            fontStyle:         p.italic ? 'italic' : 'normal',
            animationDelay:    p.delay,
            animationDuration: p.dur,
            ['--drift-x' as string]: `${p.drift}px`,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  )
}

// ── Particle overlay rendered via portal (position:fixed, no parent clips) ────
function AtlaParticles({ burst }: { burst: AtlaBurst }) {
  const { effect, left, top, width, height } = burst
  const cx = left + width  / 2
  const cy = top  + height / 2

  const label = ATLA_LABELS[effect]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'visible',
      }}
    >
      {/* ── label ── */}
      <div className={`atla-label-popup atla-label-popup--${effect}`}
        style={{ left: cx, top: top - 14 }}>
        {label}
      </div>

      {effect === 'fire' && <FireParticles left={left} top={top} width={width} height={height} />}
      {effect === 'earth' && <EarthParticles cx={cx} cy={cy} />}
      {effect === 'water' && <WaterParticles cx={cx} cy={cy} />}
      {effect === 'air' && <AirParticles left={left} top={top} width={width} height={height} />}
    </div>
  )
}

function FireParticles({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  const sparks = [
    { x: left + width * 0.15, delay: '0s',    size: 9  },
    { x: left + width * 0.30, delay: '0.06s', size: 7  },
    { x: left + width * 0.47, delay: '0.02s', size: 12 },
    { x: left + width * 0.62, delay: '0.08s', size: 8  },
    { x: left + width * 0.75, delay: '0.04s', size: 7  },
    { x: left + width * 0.88, delay: '0.10s', size: 10 },
  ]
  const baseY = top + height - 10
  return <>
    {sparks.map((s, i) => (
      <div key={i} className="atla-particle atla-particle--fire" style={{
        left: s.x, top: baseY,
        width: s.size, height: s.size,
        animationDelay: s.delay,
      }} />
    ))}
  </>
}

function EarthParticles({ cx, cy }: { cx: number; cy: number }) {
  const rocks = [
    { dx: -38, dy: -26, delay: '0s',    w: 11, h: 9  },
    { dx: -20, dy: -42, delay: '0.03s', w: 8,  h: 8  },
    { dx:   0, dy: -48, delay: '0.01s', w: 14, h: 10 },
    { dx:  20, dy: -42, delay: '0.05s', w: 10, h: 8  },
    { dx:  38, dy: -26, delay: '0.02s', w: 8,  h: 7  },
    { dx:   0, dy:  28, delay: '0.04s', w: 9,  h: 9  },
  ]
  return <>
    {rocks.map((r, i) => (
      <div key={i} className={`atla-particle atla-particle--earth-${i + 1}`} style={{
        left: cx - r.w / 2, top: cy - r.h / 2,
        width: r.w, height: r.h,
        animationDelay: r.delay,
        ['--dx' as string]: `${r.dx}px`,
        ['--dy' as string]: `${r.dy}px`,
      }} />
    ))}
  </>
}

function WaterParticles({ cx, cy }: { cx: number; cy: number }) {
  const rings = [
    { size: 40,  delay: '0s',    color: '#38bdf8', bw: '2.5px' },
    { size: 70,  delay: '0.1s',  color: '#7dd3fc', bw: '2px'   },
    { size: 100, delay: '0.2s',  color: '#bae6fd', bw: '1.5px' },
    { size: 130, delay: '0.3s',  color: '#e0f2fe', bw: '1px'   },
  ]
  return <>
    {rings.map((r, i) => (
      <div key={i} className="atla-particle atla-particle--water" style={{
        left: cx - r.size / 2, top: cy - r.size / 2,
        width: r.size, height: r.size,
        borderColor: r.color,
        borderWidth: r.bw,
        animationDelay: r.delay,
      }} />
    ))}
  </>
}

function AirParticles({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  const lines = [
    { y: top + height * 0.20, delay: '0s',    h: 2.5 },
    { y: top + height * 0.35, delay: '0.07s', h: 2   },
    { y: top + height * 0.50, delay: '0.03s', h: 2.5 },
    { y: top + height * 0.65, delay: '0.10s', h: 2   },
    { y: top + height * 0.80, delay: '0.05s', h: 1.5 },
  ]
  return <>
    {lines.map((l, i) => (
      <div key={i} className="atla-particle atla-particle--air" style={{
        left: left + width * 0.04,
        top: l.y,
        width: width * 0.92,
        height: l.h,
        animationDelay: l.delay,
      }} />
    ))}
  </>
}
