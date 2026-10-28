import type React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'
import SwordIdleModal from './desk/SwordIdleModal'
import RealityHitOverlay, { type RealityHitBurst, type RealityShard } from './desk/RealityHitOverlay'
import GameModeOverlay from './desk/GameModeOverlay'
import { gameLabelFor } from './desk/gameLabels'
import SpotifyMiniPlayer from './desk/SpotifyMiniPlayer'
import SpotifyModal from './desk/SpotifyModal'
import DeadPoetsParticles, { type DpsBurst } from './desk/DeadPoetsParticles'
import AtlaParticles, { type AtlaBurst, type AtlaEffect } from './desk/AtlaParticles'
import invincibleFlying from '../assets/invincible/invincible-flying.png'
import invincibleTitleCard from '../assets/invincible/title-card.png'

const data = rawData as unknown as PortfolioData

const ROLL_MS = 820
const CRIT_MS = 2600
const ATLA_MS = 900
const DPS_MS  = 4500
const TERMINAL_HACK_MS = 1900
const MUG_MAX_SIPS = 6
const MUG_SIP_MS = 260
const COFFEE_BLINK_MS = 1100
const COFFEE_REFILL_SYNC_MS = 550
const INVINCIBLE_FLY_MS = 2200
const INVINCIBLE_TITLE_MS = 2000
const GAME_MODE_MS = 4500
const REALITY_HIT_MS = 2100

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
}

type CritState  = 'hit' | 'fail'

const ATLA_EFFECTS: AtlaEffect[] = ['fire', 'earth', 'water', 'air']
const POEM_MS = 1700
const POEM_VERSES: [string, string][] = [
  ['ink remembers fingertips', 'long after hands let go'],
  ['paper keeps the midnight hush', 'between each careful line'],
  ['small words fall like rain', 'and bloom into quiet'],
  ['every margin holds a moon', 'for thoughts that missed their train'],
]

interface PoemBurst {
  left: number
  top: number
  width: number
  height: number
  lines: [string, string]
  tick: number
}

interface NoteParticle {
  id: number
  x: number
  y: number
  color: string
  glyph: string
  size: number
  drift: number
  spin: number
  dur: number
  removeAt: number
}

interface SteamParticle {
  id: number
  x: number
  y: number
  drift: number
  size: number
  dur: number
  removeAt: number
}

const NOTE_COLORS = ['#9b8fb8', '#c49a9e', '#7a8fa3', '#7a9e8a', '#c4a882', '#b89a82', '#7a9a9a', '#b0908a']
const NOTE_GLYPHS = ['♩', '♪', '♫', '♬']

// Build a weighted pool from portfolio.json — no IDs hardcoded here
const CASSETTE_PLAYLIST_POOL: string[] = data.spotify.playlists.flatMap(p => {
  const id = p.url.split('/playlist/')[1]
  return Array.from({ length: p.weight }, () => id)
})

export default function DeskClutter() {
  const [rolling,       setRolling]       = useState<Set<string>>(new Set())
  const [diceValues,    setDiceValues]    = useState<Record<string, number>>(
    Object.fromEntries(
      data.desk.filter(i => i.type.startsWith('dice-')).map(i => [i.id, DICE_MAX[i.type]])
    )
  )
  const [criticals,     setCriticals]     = useState<Record<string, CritState>>({})
  const [atlaBurst,     setAtlaBurst]     = useState<AtlaBurst | null>(null)
  const [dpsBurst,      setDpsBurst]      = useState<DpsBurst  | null>(null)
  const [poemBurst,     setPoemBurst]     = useState<PoemBurst | null>(null)
  const [spotifyOpen,    setSpotifyOpen]    = useState(false)
  const [cassetteActive, setCassetteActive] = useState(false)
  const [cassetteRect,   setCassetteRect]   = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [notes,          setNotes]          = useState<NoteParticle[]>([])
  const [playlistId,     setPlaylistId]     = useState<string | null>(null)
  const [gwhActive,      setGwhActive]      = useState(false)
  const [laptopClicking, setLaptopClicking] = useState(false)
  const [terminalHacking, setTerminalHacking] = useState(false)
  const [invincibleActive, setInvincibleActive] = useState(false)
  const [coffeeSips, setCoffeeSips] = useState(0)
  const [mugSipping, setMugSipping] = useState(false)
  const [coffeeBlinking, setCoffeeBlinking] = useState(false)
  const [steam, setSteam] = useState<SteamParticle[]>([])
  const [realityHitBurst, setRealityHitBurst] = useState<RealityHitBurst | null>(null)
  const [gameMode, setGameMode] = useState(false)
  const [gameModeTick, setGameModeTick] = useState(0)
  const [swordGameOpen, setSwordGameOpen] = useState(false)
  const atlaRef     = useRef<HTMLDivElement | null>(null)
  const dpsRef      = useRef<HTMLDivElement | null>(null)
  const cassetteRef = useRef<HTMLDivElement | null>(null)
  const mugRef      = useRef<HTMLDivElement | null>(null)
  const laptopRef   = useRef<HTMLDivElement | null>(null)
  const swordRef    = useRef<HTMLDivElement | null>(null)
  const noteIdRef   = useRef(0)
  const steamIdRef  = useRef(0)
  const atlaEffectIndexRef = useRef(0)
  const poemVerseIndexRef = useRef(0)
  const gameModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const effect = ATLA_EFFECTS[atlaEffectIndexRef.current]
    atlaEffectIndexRef.current = (atlaEffectIndexRef.current + 1) % ATLA_EFFECTS.length
    setAtlaBurst(prev => ({
      effect,
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      tick: (prev?.tick ?? 0) + 1,
    }))
    setTimeout(() => setAtlaBurst(null), ATLA_MS)
  }, [atlaBurst])

  const handleGwh = useCallback(() => {
    if (gwhActive) return
    setGwhActive(true)
  }, [gwhActive])

  const handleLaptopClick = useCallback(() => {
    setLaptopClicking(false)
    requestAnimationFrame(() => {
      setLaptopClicking(true)
      setTimeout(() => setLaptopClicking(false), 920)
    })
  }, [])

  const handleTerminalClick = useCallback(() => {
    setTerminalHacking(false)
    requestAnimationFrame(() => {
      setTerminalHacking(true)
      setTimeout(() => setTerminalHacking(false), TERMINAL_HACK_MS)
    })
  }, [])

  const handleInvincible = useCallback(() => {
    if (invincibleActive) return
    setInvincibleActive(true)
  }, [invincibleActive])

  const handleRealityHit = useCallback(() => {
    if (realityHitBurst) return
    const rect = swordRef.current?.getBoundingClientRect()
    if (!rect) return
    const shards: RealityShard[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: rect.left + rect.width * (0.28 + Math.random() * 0.44),
      y: rect.top + rect.height * (0.24 + Math.random() * 0.52),
      size: 10 + Math.random() * 16,
      driftX: -115 + Math.random() * 230,
      driftY: -130 - Math.random() * 130,
      spin: -88 + Math.random() * 176,
      delay: Math.random() * 0.18,
    }))
    setRealityHitBurst(prev => ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      shards,
      tick: (prev?.tick ?? 0) + 1,
    }))
    setTimeout(() => setRealityHitBurst(null), REALITY_HIT_MS)
  }, [realityHitBurst])

  const handleSwordGameOpen = useCallback(() => {
    setSwordGameOpen(true)
  }, [])

  // ── Controller "Split Screen Reality" toggle ──────────────────────────────
  // Pain-point removals:
  //  • Second click immediately exits (no trapping the user)
  //  • Won't trigger if a major modal/scene is already running (avoids stacked overlays)
  //  • Auto-reverts at GAME_MODE_MS so it never overstays its welcome
  //  • ESC handler below is the keyboard escape hatch
  const exitGameMode = useCallback(() => {
    if (gameModeTimerRef.current) {
      clearTimeout(gameModeTimerRef.current)
      gameModeTimerRef.current = null
    }
    setGameMode(false)
  }, [])

  const handleController = useCallback(() => {
    if (gameMode) {
      exitGameMode()
      return
    }
    if (spotifyOpen || gwhActive || invincibleActive || coffeeBlinking) return
    setGameMode(true)
    setGameModeTick(t => t + 1)
    gameModeTimerRef.current = setTimeout(() => {
      setGameMode(false)
      gameModeTimerRef.current = null
    }, GAME_MODE_MS)
  }, [gameMode, exitGameMode, spotifyOpen, gwhActive, invincibleActive, coffeeBlinking])

  // body class drives all per-item CSS (HUD glow, rarity, parchment, etc.)
  useEffect(() => {
    if (!gameMode) return
    document.body.classList.add('desk-game-mode')
    return () => document.body.classList.remove('desk-game-mode')
  }, [gameMode])

  // ESC exits game mode
  useEffect(() => {
    if (!gameMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitGameMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameMode, exitGameMode])

  // unmount cleanup
  useEffect(() => {
    return () => {
      if (gameModeTimerRef.current) clearTimeout(gameModeTimerRef.current)
      document.body.classList.remove('desk-game-mode')
    }
  }, [])

  const handleInvincibleDone = useCallback(() => {
    setInvincibleActive(false)
  }, [])

  const handleGwhDone = useCallback(() => {
    setGwhActive(false)
  }, [])

  const handleMugClick = useCallback(() => {
    if (coffeeBlinking) return
    setMugSipping(false)
    requestAnimationFrame(() => {
      setMugSipping(true)
      setTimeout(() => setMugSipping(false), MUG_SIP_MS)
    })

    setCoffeeSips(prev => {
      const next = Math.min(prev + 1, MUG_MAX_SIPS)
      if (next >= MUG_MAX_SIPS) {
        setCoffeeBlinking(true)
        setTimeout(() => {
          setCoffeeSips(0)
          setSteam([])
        }, COFFEE_REFILL_SYNC_MS)
        setTimeout(() => {
          setCoffeeBlinking(false)
        }, COFFEE_BLINK_MS)
      }
      return next
    })
  }, [coffeeBlinking])

  const handlePoemClick = useCallback((target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect()
    const lines = POEM_VERSES[poemVerseIndexRef.current]
    poemVerseIndexRef.current = (poemVerseIndexRef.current + 1) % POEM_VERSES.length
    setPoemBurst(prev => ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      lines,
      tick: (prev?.tick ?? 0) + 1,
    }))
    setTimeout(() => setPoemBurst(null), POEM_MS)
  }, [])

  const stopCassette = useCallback(() => {
    setCassetteActive(false)
    setNotes([])
    setPlaylistId(null)
  }, [])

  const handleCassette = useCallback(() => {
    if (cassetteActive) {
      stopCassette()
      return
    }
    const rect = cassetteRef.current?.getBoundingClientRect()
    if (!rect) return
    setCassetteRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    if (CASSETTE_PLAYLIST_POOL.length > 0) {
      setPlaylistId(CASSETTE_PLAYLIST_POOL[Math.floor(Math.random() * CASSETTE_PLAYLIST_POOL.length)])
    }
    setCassetteActive(true)
  }, [cassetteActive, stopCassette])

  useEffect(() => {
    if (!cassetteActive || !cassetteRect) return
    const { left, top, width, height } = cassetteRect
    const interval = setInterval(() => {
      const now   = Date.now()
      const count = Math.random() < 0.55 ? 1 : 2
      const fresh: NoteParticle[] = Array.from({ length: count }, () => ({
        id:       noteIdRef.current++,
        x:        left + width  * (0.05 + Math.random() * 0.88),
        y:        top  + height * (0.1  + Math.random() * 0.55),
        color:    NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        glyph:    NOTE_GLYPHS[Math.floor(Math.random() * NOTE_GLYPHS.length)],
        size:     13 + Math.random() * 10,
        drift:    (Math.random() - 0.5) * 46,
        spin:     (Math.random() - 0.5) * 38,
        dur:      2.3 + Math.random() * 0.9,
        removeAt: now + 3400,
      }))
      setNotes(prev => [...prev.filter(n => n.removeAt > now), ...fresh].slice(-20))
    }, 330)
    return () => clearInterval(interval)
  }, [cassetteActive, cassetteRect])

  const coffeeFillLevel = 1 - coffeeSips / MUG_MAX_SIPS

  useEffect(() => {
    if (coffeeFillLevel <= 0 || coffeeBlinking) {
      setSteam([])
      return
    }

    const interval = setInterval(() => {
      const rect = mugRef.current?.getBoundingClientRect()
      if (!rect) return
      const now = Date.now()
      const count = Math.random() < 0.7 ? 2 : 1
      const fresh: SteamParticle[] = Array.from({ length: count }, () => ({
        id: steamIdRef.current++,
        x: rect.left + rect.width * (0.30 + Math.random() * 0.34),
        y: rect.top + rect.height * (0.20 + Math.random() * 0.11),
        drift: (Math.random() - 0.5) * 24,
        size: 7 + Math.random() * 8,
        dur: 1.8 + Math.random() * 0.9,
        removeAt: now + 2400,
      }))
      setSteam(prev => [...prev.filter(p => p.removeAt > now), ...fresh].slice(-18))
    }, 240)

    return () => clearInterval(interval)
  }, [coffeeFillLevel, coffeeBlinking])

  return (
    <>
      <div className="desk-clutter-layer">
        <div className="desk-clutter-content">
        {data.desk.map((item) => {
          const isDice       = item.type.startsWith('dice-')
          const isAtlaPoster = item.type === 'poster' && item.label === 'ATLA'
          const isDpsPoster  = item.type === 'poster' && item.label === 'Dead Poets'
          const isGwhPoster  = item.type === 'poster' && item.label === 'Good Will Hunting'
          const isInvPoster  = item.type === 'poster' && item.label === 'Invincible'
          const isTerminal   = item.type === 'terminal'
          const isVinyl      = item.type === 'vinyl'
          const isCassette   = item.type === 'cassette'
          const isLaptop     = item.type === 'laptop'
          const isPoem       = item.type === 'poem'
          const isMug        = item.type === 'mug'
          const isController = item.type === 'controller'
          const isSword      = item.type === 'diamond-sword'
          const isRolling    = rolling.has(item.id)
          const crit         = criticals[item.id]
          const gl           = gameLabelFor(item.type)

          const innerClass = [
            isRolling       ? 'dice-rolling'   : undefined,
            crit === 'hit'  ? 'dice-crit-hit'  : undefined,
            crit === 'fail' ? 'dice-crit-fail' : undefined,
          ].filter(Boolean).join(' ') || undefined

          return (
            <div
              key={item.id}
              ref={
                isAtlaPoster ? atlaRef :
                isDpsPoster ? dpsRef :
                isCassette ? cassetteRef :
                isMug ? mugRef :
                isLaptop ? laptopRef :
                isSword ? swordRef :
                undefined
              }
              data-item-id={item.id}
              data-item-type={item.type}
              data-game-label={gl?.label}
              data-game-variant={gl?.variant}
              className={`absolute select-none desk-item${isLaptop ? ' desk-item--laptop' : ''}${isLaptop && laptopClicking ? ' desk-item--laptop-click' : ''}${isCassette && cassetteActive ? ' cassette-playing' : ''}${isPoem ? ' desk-item--poem' : ''}${isPoem && poemBurst ? ' desk-item--poem-active' : ''}${isTerminal ? ' desk-item--terminal' : ''}${isTerminal && terminalHacking ? ' desk-item--terminal-hack' : ''}${isController ? ' desk-item--controller' : ''}${isController && gameMode ? ' desk-item--controller-active' : ''}${isSword && realityHitBurst ? ' desk-item--sword-reality-hit' : ''}`}
              style={{
                left: `${item.x}%`,
                top:  `${item.y}%`,
                '--item-rotate': `${item.rotate}deg`,
                zIndex: item.zIndex,
                cursor: isDice || isAtlaPoster || isDpsPoster || isGwhPoster || isInvPoster || isVinyl || isCassette || isLaptop || isPoem || isTerminal || isMug || isController || isSword ? 'pointer' : undefined,
              } as React.CSSProperties}
              onClick={
                isDice         ? () => handleRoll(item.id, item.type)
                : isAtlaPoster ? handleAtla
                : isDpsPoster  ? handleDps
                : isGwhPoster  ? handleGwh
                : isInvPoster  ? handleInvincible
                : isTerminal   ? handleTerminalClick
                : isVinyl      ? () => setSpotifyOpen(true)
                : isCassette   ? handleCassette
                : isLaptop     ? handleLaptopClick
                : isPoem       ? (e) => handlePoemClick(e.currentTarget)
                : isMug        ? handleMugClick
                : isController ? handleController
                : isSword      ? handleSwordGameOpen
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
                  terminalHacking={isTerminal ? terminalHacking : undefined}
                  mugFillLevel={isMug ? coffeeFillLevel : undefined}
                  mugSipping={isMug ? mugSipping : undefined}
                  mugEmpty={isMug ? coffeeFillLevel <= 0 : undefined}
                />
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Render burst into document.body so nothing can clip or block it */}
      {atlaBurst && createPortal(
        <AtlaParticles key={atlaBurst.tick} burst={atlaBurst} />,
        document.body
      )}

      {dpsBurst && createPortal(
        <DeadPoetsParticles key={dpsBurst.tick} burst={dpsBurst} />,
        document.body
      )}
      {poemBurst && createPortal(
        <PoemParticles key={poemBurst.tick} burst={poemBurst} />,
        document.body
      )}

      {gwhActive && createPortal(
        <GwhPlane onDone={handleGwhDone} />,
        document.body
      )}

      {invincibleActive && createPortal(
        <InvincibleSequence onDone={handleInvincibleDone} />,
        document.body
      )}

      {cassetteActive && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998, overflow: 'visible' }}>
            {notes.map(n => (
              <div
                key={n.id}
                className="cassette-note"
                style={{
                  left:              n.x,
                  top:               n.y,
                  fontSize:          n.size,
                  color:             n.color,
                  animationDuration: `${n.dur}s`,
                  ['--note-drift' as string]: `${n.drift}px`,
                  ['--note-spin'  as string]: `${n.spin}deg`,
                }}
              >
                {n.glyph}
              </div>
            ))}
          </div>
          <SpotifyMiniPlayer playlistId={playlistId} onStop={stopCassette} />
        </>,
        document.body
      )}

      {spotifyOpen && createPortal(
        <SpotifyModal onClose={() => setSpotifyOpen(false)} />,
        document.body
      )}

      {steam.length > 0 && createPortal(
        <div className="coffee-steam-layer">
          {steam.map(s => (
            <span
              key={s.id}
              className="coffee-steam-particle"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size * 1.6,
                animationDuration: `${s.dur}s`,
                ['--steam-drift' as string]: `${s.drift}px`,
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {coffeeBlinking && createPortal(
        <div className="coffee-blink-overlay">
          <div className="coffee-eyelid coffee-eyelid--top" />
          <div className="coffee-eyelid coffee-eyelid--bottom" />
        </div>,
        document.body
      )}

      {gameMode && createPortal(
        <GameModeOverlay key={gameModeTick} laptopRef={laptopRef} onExit={exitGameMode} />,
        document.body
      )}

      {realityHitBurst && createPortal(
        <RealityHitOverlay burst={realityHitBurst} />,
        document.body
      )}

      {swordGameOpen && createPortal(
        <SwordIdleModal onClose={() => setSwordGameOpen(false)} onSwordHit={handleRealityHit} />,
        document.body
      )}
    </>
  )
}

type InvinciblePhase = 'fly' | 'title'

function InvincibleSequence({ onDone }: { onDone: () => void }) {
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

function PoemParticles({ burst }: { burst: PoemBurst }) {
  const { left, top, width, lines } = burst
  return (
    <div className="poem-burst" style={{ left: left + width / 2, top: top - 8 }}>
      <div className="poem-burst-line poem-burst-line--1">{lines[0]}</div>
      <div className="poem-burst-line poem-burst-line--2">{lines[1]}</div>
    </div>
  )
}

// ── Good Will Hunting — paper airplane carries the message ───────────────────

type GwhPhase = 'fly-in' | 'align' | 'unfurl' | 'open' | 'refold' | 'fly-out'

const GWH_TIMINGS: Record<GwhPhase, number> = {
  'fly-in':  950,
  'align':   180,
  'unfurl':  650,
  'open':    2100,
  'refold':  650,
  'fly-out': 900,
}

function GwhPlane({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<GwhPhase>('fly-in')

  useEffect(() => {
    const phases: GwhPhase[] = ['fly-in', 'align', 'unfurl', 'open', 'refold', 'fly-out']
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    phases.slice(1).forEach((ph, i) => {
      elapsed += GWH_TIMINGS[phases[i]]
      timers.push(setTimeout(() => setPhase(ph), elapsed))
    })
    elapsed += GWH_TIMINGS['fly-out']
    timers.push(setTimeout(onDone, elapsed))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const showPlane = true
  const showNote  = phase === 'unfurl'  || phase === 'open'   || phase === 'refold'

  const planeAnim =
    phase === 'unfurl' ? 'fold'   :
    phase === 'open'   ? 'folded' :
    phase === 'refold' ? 'emerge' : 'steady'

  const planeMotion =
    phase === 'fly-in'  ? 'fly-in'  :
    phase === 'fly-out' ? 'fly-out' : 'center'

  const noteAnim =
    phase === 'refold'  ? 'fold'   :
    phase === 'unfurl'  ? 'unfold' : 'open'

  return (
    <div style={{
      position: 'fixed',
      top: '42vh',
      left: '50vw',
      width: 0,
      height: 0,
      overflow: 'visible',
      zIndex: 100001,
      pointerEvents: 'none',
    }}>
      {showPlane && (
        <div className={`gwh-plane-motion gwh-plane-motion--${planeMotion}`}>
          <div className={`gwh-plane-anim gwh-plane-anim--${planeAnim}`}>
            {(phase === 'fly-in' || phase === 'fly-out') && (
              <div className="gwh-plane-trail" aria-hidden="true">
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--1" />
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--2" />
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--3" />
              </div>
            )}
            <PaperPlaneIcon />
          </div>
        </div>
      )}
      {showNote && (
        <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
          <div className={`gwh-note-anim gwh-note-anim--${noteAnim}`}>
            <div className="gwh-note-paper">
              <span className="gwh-note-text">Sorry, I had to go see about a girl ❤️</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 100 62" width="100" height="62" fill="none">
      {/* main body */}
      <path d="M98 31 L2 5 L34 31 L2 57 Z" fill="#f5f0e8" stroke="#bfb49a" strokeWidth="1.4"/>
      {/* centre fold crease */}
      <line x1="98" y1="31" x2="34" y2="31" stroke="#bfb49a" strokeWidth="0.9" strokeDasharray="4 2.5" opacity="0.7"/>
      {/* wing fold lines */}
      <path d="M66 20 L34 31 L66 42" stroke="#bfb49a" strokeWidth="0.75" fill="none" opacity="0.55"/>
      {/* subtle highlight on upper wing */}
      <path d="M98 31 L2 5 L34 31 Z" fill="rgba(255,255,255,0.18)"/>
    </svg>
  )
}

