import type React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import rawData from '../data/portfolio.json'
import swordEnemiesData from '../data/swordEnemies.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'
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
const SWORD_BASE_CRIT_CHANCE = 0
const SWORD_IDLE_TICK_MS = 1000
const QTE_KEYS = ['E', 'F', 'SPACE', 'R'] as const
const QTE_TICK_MS = 700

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
}

// Map desk-item type → game-mode HUD label (drives the per-item floating chip in
// the overlay). null = item gets the global glow but no chip.
function gameLabelFor(type: string): { label: string; variant: string } | null {
  if (type === 'diamond-sword') return { label: 'LEGENDARY', variant: 'rare'   }
  if (type === 'poem')          return { label: 'QUEST',     variant: 'quest'  }
  if (type.startsWith('dice-')) return { label: 'ROLL',      variant: 'action' }
  if (type === 'mug')           return { label: '+10 HP',    variant: 'heal'   }
  if (type === 'terminal')      return { label: 'HACK',      variant: 'tech'   }
  if (type === 'laptop')        return { label: 'INTERFACE', variant: 'tech'   }
  if (type === 'controller')    return { label: 'ACTIVE',    variant: 'active' }
  if (type === 'vinyl' || type === 'cassette') return { label: 'AUDIO', variant: 'audio' }
  if (type === 'poster')        return { label: 'LORE',      variant: 'lore'   }
  return null
}

type CritState  = 'hit' | 'fail'
type AtlaEffect = 'fire' | 'earth' | 'water' | 'air'

const ATLA_EFFECTS: AtlaEffect[] = ['fire', 'earth', 'water', 'air']
const POEM_MS = 1700
const POEM_VERSES: [string, string][] = [
  ['ink remembers fingertips', 'long after hands let go'],
  ['paper keeps the midnight hush', 'between each careful line'],
  ['small words fall like rain', 'and bloom into quiet'],
  ['every margin holds a moon', 'for thoughts that missed their train'],
]
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

interface RealityShard {
  id: number
  x: number
  y: number
  size: number
  driftX: number
  driftY: number
  spin: number
  delay: number
}

interface RealityHitBurst {
  left: number
  top: number
  width: number
  height: number
  shards: RealityShard[]
  tick: number
}

interface SwordBoss {
  name: string
  hp: number
}

interface DamageFloat {
  id: number
  amount: number
  crit: boolean
}

type SwordUpgradeKey = 'click' | 'dps' | 'crit' | 'goldps' | 'loot' | 'hp' | 'armor' | 'regen' | 'totem'

const NOTE_COLORS = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#2dd4bf', '#f87171']
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

const SWORD_BOSS_POOL: SwordBoss[] = (swordEnemiesData as SwordBoss[]).length > 0
  ? (swordEnemiesData as SwordBoss[])
  : [{ name: 'Zombie', hp: 30 }]

function SwordIdleModal({ onClose, onSwordHit }: { onClose: () => void; onSwordHit: () => void }) {
  const [bossIndex, setBossIndex] = useState(0)
  const [bossHp, setBossHp] = useState(SWORD_BOSS_POOL[0].hp)
  const [maxHp, setMaxHp] = useState(SWORD_BOSS_POOL[0].hp)
  const [kills, setKills] = useState(0)
  const [gold, setGold] = useState(0)
  const [clickDamage, setClickDamage] = useState(1)
  const [dps, setDps] = useState(0)
  const [critChance, setCritChance] = useState(SWORD_BASE_CRIT_CHANCE)
  const [oreChance, setOreChance] = useState(0.08)
  const [goldPerSecond, setGoldPerSecond] = useState(0)
  const [lootBonus, setLootBonus] = useState(1)
  const [playerMaxHp, setPlayerMaxHp] = useState(24)
  const [playerHp, setPlayerHp] = useState(24)
  const [armor, setArmor] = useState(0)
  const [hpRegen, setHpRegen] = useState(0)
  const [enemyDamage, setEnemyDamage] = useState(1)
  const [deaths, setDeaths] = useState(0)
  const [totems, setTotems] = useState(0)
  const [potions, setPotions] = useState(0)
  const [shopLevelClick, setShopLevelClick] = useState(0)
  const [shopLevelDps, setShopLevelDps] = useState(0)
  const [shopLevelCrit, setShopLevelCrit] = useState(0)
  const [shopLevelOre, setShopLevelOre] = useState(0)
  const [shopLevelGoldps, setShopLevelGoldps] = useState(0)
  const [shopLevelLoot, setShopLevelLoot] = useState(0)
  const [shopLevelHp, setShopLevelHp] = useState(0)
  const [shopLevelArmor, setShopLevelArmor] = useState(0)
  const [shopLevelRegen, setShopLevelRegen] = useState(0)
  const [shopLevelTotem, setShopLevelTotem] = useState(0)
  const [combo, setCombo] = useState(0)
  const [victory, setVictory] = useState(false)
  const [statusText, setStatusText] = useState('Hunt mobs and build your gear.')
  const [floats, setFloats] = useState<DamageFloat[]>([])
  const floatIdRef = useRef(0)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentBoss = SWORD_BOSS_POOL[bossIndex]
  const hpPct = Math.max(0, Math.min(100, (bossHp / maxHp) * 100))
  const playerHpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))
  const progressPct = Math.round((bossIndex / (SWORD_BOSS_POOL.length - 1)) * 100)
  const enemyAttackMs = Math.max(1000, 2200 - bossIndex * 5)
  const potionCost = Math.ceil(8 + playerMaxHp * 0.14)
  const potionHeal = Math.ceil(playerMaxHp * 0.35)

  const costs: Record<SwordUpgradeKey | 'ore', number> = {
    click: Math.ceil(9 * (1.42 ** shopLevelClick)),
    dps: Math.ceil(20 * (1.6 ** shopLevelDps)),
    crit: Math.ceil(16 * (1.54 ** shopLevelCrit)),
    ore: Math.ceil(18 * (1.5 ** shopLevelOre)),
    goldps: Math.ceil(22 * (1.62 ** shopLevelGoldps)),
    loot: Math.ceil(26 * (1.58 ** shopLevelLoot)),
    hp: Math.ceil(18 * (1.55 ** shopLevelHp)),
    armor: Math.ceil(16 * (1.52 ** shopLevelArmor)),
    regen: Math.ceil(20 * (1.56 ** shopLevelRegen)),
    totem: Math.ceil(34 * (1.7 ** shopLevelTotem)),
  }

  const queueStatus = useCallback((text: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setStatusText(text)
    statusTimerRef.current = setTimeout(() => {
      setStatusText(victory ? 'You cleared every boss. GG.' : 'Hunt mobs and build your gear.')
      statusTimerRef.current = null
    }, 1200)
  }, [victory])

  const spawnNextBoss = useCallback(() => {
    const isLastBoss = bossIndex >= SWORD_BOSS_POOL.length - 1
    const reward = Math.round((6 + maxHp * 0.085) * lootBonus)
    setKills((prev) => prev + 1)
    setGold((prev) => prev + reward)
    setCombo((prev) => prev + 1)
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + Math.ceil(playerMaxHp * 0.12)))
    if ((kills + 1) % 5 === 0) {
      const chest = Math.round(22 * lootBonus)
      setGold((prev) => prev + chest)
      queueStatus(`Loot chest found: +${chest} gold`)
    } else {
      queueStatus(`Target down: +${reward} gold`)
    }
    if (isLastBoss) {
      setVictory(true)
      return
    }
    setBossIndex((prev) => prev + 1)
  }, [bossIndex, kills, lootBonus, maxHp, playerMaxHp, queueStatus])

  useEffect(() => {
    if (victory) return
    const boss = SWORD_BOSS_POOL[bossIndex]
    const exponentialScale = 1.07 ** bossIndex
    const nextHp = Math.max(1, Math.round(boss.hp * exponentialScale))
    const nextEnemyDamage = Math.max(1, Math.round(1 + bossIndex * 0.18 + nextHp * 0.0018))
    setMaxHp(nextHp)
    setBossHp(nextHp)
    setEnemyDamage(nextEnemyDamage)
  }, [bossIndex, victory])

  const dealDamage = useCallback((base: number, crit: boolean) => {
    if (victory || base <= 0) return
    const amount = crit ? Math.ceil(base * 1.5) : base
    const id = floatIdRef.current++
    setFloats((prev) => [...prev, { id, amount, crit }].slice(-10))
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 700)
    setBossHp((prev) => {
      const next = Math.max(0, prev - amount)
      if (next === 0 && prev > 0) {
        spawnNextBoss()
      }
      return next
    })
  }, [spawnNextBoss, victory])

  const handleHit = useCallback(() => {
    if (victory) return
    onSwordHit()
    const crit = Math.random() < critChance
    dealDamage(clickDamage, crit)
    if (Math.random() < oreChance) {
      setGold((prev) => prev + 1)
      queueStatus('Lucky drop: +1 gold')
    }
  }, [clickDamage, critChance, dealDamage, onSwordHit, oreChance, queueStatus, victory])

  const buyUpgrade = useCallback((kind: SwordUpgradeKey | 'ore') => {
    if (victory) return
    const cost = costs[kind]
    if (gold < cost) return
    setGold((prev) => prev - cost)
    if (kind === 'click') {
      setClickDamage((prev) => prev + 1)
      setShopLevelClick((prev) => prev + 1)
      queueStatus('Click damage increased')
      return
    }
    if (kind === 'dps') {
      setDps((prev) => prev + 3)
      setShopLevelDps((prev) => prev + 1)
      queueStatus('Passive damage increased by 3')
      return
    }
    if (kind === 'crit') {
      setCritChance((prev) => Math.min(0.75, prev + 0.02))
      setShopLevelCrit((prev) => prev + 1)
      queueStatus('Critical chance increased')
      return
    }
    if (kind === 'goldps') {
      setGoldPerSecond((prev) => prev + 3)
      setShopLevelGoldps((prev) => prev + 1)
      queueStatus('Passive gold increased by 3')
      return
    }
    if (kind === 'loot') {
      setLootBonus((prev) => prev + 0.08)
      setShopLevelLoot((prev) => prev + 1)
      queueStatus('Loot multiplier increased')
      return
    }
    if (kind === 'hp') {
      setPlayerMaxHp((prev) => prev + 10)
      setPlayerHp((prev) => prev + 10)
      setShopLevelHp((prev) => prev + 1)
      queueStatus('Max HP increased')
      return
    }
    if (kind === 'armor') {
      setArmor((prev) => prev + 1)
      setShopLevelArmor((prev) => prev + 1)
      queueStatus('Armor increased')
      return
    }
    if (kind === 'regen') {
      setHpRegen((prev) => prev + 1)
      setShopLevelRegen((prev) => prev + 1)
      queueStatus('HP regen increased')
      return
    }
    if (kind === 'totem') {
      setTotems((prev) => prev + 1)
      setShopLevelTotem((prev) => prev + 1)
      queueStatus('Totem of Undying acquired')
      return
    }
    setOreChance((prev) => Math.min(0.35, prev + 0.02))
    setShopLevelOre((prev) => prev + 1)
    queueStatus('Lucky drop chance increased')
  }, [costs, gold, queueStatus, victory])

  const handlePotion = useCallback(() => {
    if (victory || potions <= 0 || playerHp >= playerMaxHp) return
    setPotions((prev) => prev - 1)
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + potionHeal))
    queueStatus(`Potion used: +${potionHeal} HP`)
  }, [playerHp, playerMaxHp, potionHeal, potions, queueStatus, victory])

  const handleBuyPotion = useCallback(() => {
    if (victory || gold < potionCost) return
    setGold((prev) => prev - potionCost)
    setPotions((prev) => prev + 1)
    queueStatus('Potion added to inventory')
  }, [gold, potionCost, queueStatus, victory])

  useEffect(() => {
    if (victory || dps <= 0) return
    const timer = setInterval(() => {
      dealDamage(dps, false)
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [dealDamage, dps, victory])

  useEffect(() => {
    if (victory || goldPerSecond <= 0) return
    const timer = setInterval(() => {
      setGold((prev) => prev + goldPerSecond)
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [goldPerSecond, victory])

  useEffect(() => {
    if (victory || hpRegen <= 0) return
    const timer = setInterval(() => {
      setPlayerHp((prev) => Math.min(playerMaxHp, prev + hpRegen))
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [hpRegen, playerMaxHp, victory])

  useEffect(() => {
    if (victory) return
    const timer = setInterval(() => {
      const reduction = Math.min(0.72, armor * 0.045)
      const taken = Math.max(1, Math.ceil(enemyDamage * (1 - reduction)))
      setPlayerHp((prev) => {
        const next = prev - taken
        if (next <= 0) {
          if (totems > 0) {
            setTotems((t) => t - 1)
            queueStatus('Totem triggered: death avoided')
            return Math.ceil(playerMaxHp * 0.65)
          }
          setDeaths((d) => d + 1)
          setCombo(0)
          setGold((g) => Math.max(0, g - Math.ceil(g * 0.1)))
          setBossHp(maxHp)
          queueStatus('You were defeated. Current target reset.')
          return playerMaxHp
        }
        return next
      })
    }, enemyAttackMs)
    return () => clearInterval(timer)
  }, [armor, enemyAttackMs, enemyDamage, maxHp, playerMaxHp, queueStatus, totems, victory])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  return (
    <div className="sword-idle-modal-backdrop" onClick={onClose}>
      <div
        className="sword-idle-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sword boss simulator"
      >
        <div className="sword-idle-modal-header">
          <div className="sword-idle-title-wrap">
            <p className="sword-idle-title">BOSS FIGHT SIM</p>
            <p className="sword-idle-subtitle">Minecraft sword training</p>
          </div>
          <button type="button" className="sword-idle-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sword-idle-top-grid">
          <div className="sword-idle-info-card">
            <p className="sword-idle-info-title">Run</p>
            <div className="sword-idle-kv-grid">
              <span>Kills</span><span>{kills}</span>
              <span>Gold</span><span>{gold}</span>
              <span>Combo</span><span>{combo}</span>
              <span>Deaths</span><span>{deaths}</span>
            </div>
          </div>
          <div className="sword-idle-info-card">
            <p className="sword-idle-info-title">Build</p>
            <div className="sword-idle-kv-grid">
              <span>Click</span><span>{clickDamage}</span>
              <span>DPS</span><span>{dps}</span>
              <span>GPS</span><span>{goldPerSecond}</span>
              <span>Crit</span><span>{(critChance * 100).toFixed(0)}%</span>
              <span>Armor</span><span>{armor}</span>
              <span>Regen</span><span>{hpRegen}</span>
            </div>
          </div>
        </div>

        <div className="sword-idle-run-progress">
          <span>Run progress</span>
          <span>{progressPct}%</span>
          <span>{bossIndex + 1}/{SWORD_BOSS_POOL.length}</span>
        </div>
        <div className="sword-idle-run-bar">
          <span className="sword-idle-run-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="sword-idle-boss-panel">
          <div className="sword-idle-boss-row">
            <span className="sword-idle-boss-name">{currentBoss.name}</span>
            <span className="sword-idle-boss-hp">{bossHp} / {maxHp} | DMG {enemyDamage}</span>
          </div>
          <p className="sword-idle-bar-label sword-idle-bar-label--enemy">Enemy HP</p>
          <div className="sword-idle-boss-bar">
            <span className="sword-idle-boss-fill" style={{ width: `${hpPct}%` }} />
          </div>
          <p className="sword-idle-bar-label sword-idle-bar-label--player">Your HP</p>
          <div className="sword-idle-boss-bar sword-idle-boss-bar--player">
            <span className="sword-idle-boss-fill sword-idle-boss-fill--player" style={{ width: `${playerHpPct}%` }} />
          </div>
          <div className="sword-idle-float-layer" aria-hidden="true">
            {floats.map((f) => (
              <span key={f.id} className={`sword-idle-float${f.crit ? ' sword-idle-float--crit' : ''}`}>
                -{f.amount}{f.crit ? ' CRIT!' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="sword-idle-actions">
          <div className="sword-idle-actions-row">
            <button type="button" className="sword-idle-hit-btn" onClick={handleHit} disabled={victory}>
              {victory ? 'VICTORY' : 'HIT BOSS'}
            </button>
            <button type="button" className="sword-idle-hit-btn sword-idle-hit-btn--alt" onClick={handlePotion} disabled={victory || potions <= 0 || playerHp >= playerMaxHp}>
              USE POTION ({potions})
            </button>
          </div>
          <p className="sword-idle-help">Enemy HP bar is red. Your HP bar is green. Enemy attacks automatically.</p>
          <p className="sword-idle-status">{statusText}</p>
        </div>

        <div className="sword-idle-shop sword-idle-shop--upgrades">
          <p className="sword-idle-shop-title">Upgrades</p>
          <div className="sword-idle-shop-grid">
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('click')} disabled={gold < costs.click || victory}>
                +1 Click Damage
                <small>Boosts manual hit strength.</small>
                <span>Cost: {costs.click}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('dps')} disabled={gold < costs.dps || victory}>
                +3 Passive Damage
                <small>Auto damage every second.</small>
                <span>Cost: {costs.dps}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('crit')} disabled={gold < costs.crit || victory}>
                +2% Crit Chance
                <small>Raises chance for x1.5 hits.</small>
                <span>Cost: {costs.crit}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('ore')} disabled={gold < costs.ore || victory}>
                +2% Lucky Drop
                <small>Chance for +1 gold on hit.</small>
                <span>Cost: {costs.ore}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('goldps')} disabled={gold < costs.goldps || victory}>
                +3 Passive Gold
                <small>Auto gold income per second.</small>
                <span>Cost: {costs.goldps}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('loot')} disabled={gold < costs.loot || victory}>
                +8% Bounty Bonus
                <small>More boss and chest rewards.</small>
                <span>Cost: {costs.loot}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('hp')} disabled={gold < costs.hp || victory}>
                +10 Max HP
                <small>Increases survival pool.</small>
                <span>Cost: {costs.hp}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('armor')} disabled={gold < costs.armor || victory}>
                +1 Armor
                <small>Reduces incoming damage.</small>
                <span>Cost: {costs.armor}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('regen')} disabled={gold < costs.regen || victory}>
                +1 HP Regen
                <small>Restores HP each second.</small>
                <span>Cost: {costs.regen}</span>
              </button>
          </div>
        </div>

        <div className="sword-idle-shop sword-idle-shop--items">
          <p className="sword-idle-shop-title">Items</p>
          <div className="sword-idle-shop-grid sword-idle-shop-grid--items">
              <button type="button" className="sword-idle-shop-btn" onClick={handleBuyPotion} disabled={victory || gold < potionCost}>
                +1 Potion
                <small>Inventory heal item. Use any time.</small>
                <span>Buy: {potionCost}g</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('totem')} disabled={gold < costs.totem || victory}>
                +1 Totem
                <small>Auto-revive once at lethal damage.</small>
                <span>Cost: {costs.totem} | Owned: {totems}</span>
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

function RealityHitOverlay({
  burst,
}: {
  burst: RealityHitBurst | null
}) {
  return (
    <div className="reality-hit-overlay" aria-hidden="true">
      {burst && (
        <>
          {burst.shards.map((s) => (
            <span
              key={`${burst.tick}-${s.id}`}
              className="reality-hit-shard"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                ['--shard-dx' as string]: `${s.driftX}px`,
                ['--shard-dy' as string]: `${s.driftY}px`,
                ['--shard-spin' as string]: `${s.spin}deg`,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

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

function GameModeOverlay({ laptopRef, onExit }: { laptopRef: React.RefObject<HTMLDivElement | null>; onExit: () => void }) {
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

// ── Spotify mini-player (bottom-left, slides in when cassette is active) ──────
function SpotifyMiniPlayer({ playlistId, onStop }: { playlistId: string | null; onStop: () => void }) {
  const hasPlaylist = playlistId !== null

  return (
    <div className="cassette-player">
      <div className="cassette-player-header">
        <span className="cassette-player-now">
          <span className="cassette-player-dot" />
          Now Playing
        </span>
        <span className="cassette-player-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
          </svg>
          Spotify
        </span>
        <button className="cassette-player-stop" onClick={onStop} aria-label="Stop">■</button>
      </div>
      {hasPlaylist ? (
        <iframe
          className="cassette-player-frame"
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&autoplay=1&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify player"
        />
      ) : (
        <div className="cassette-player-placeholder">
          <p>Add playlist IDs to<br /><code>CASSETTE_PLAYLIST_IDS</code></p>
        </div>
      )}
    </div>
  )
}

// ── Spotify Modal ─────────────────────────────────────────────────────────────
const SPOTIFY_PLAYLISTS = ['Soft Angels', 'All Good', 'Nostalgia']

function SpotifyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="spotify-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="spotify-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Spotify profile"
      >
        {/* Header */}
        <div className="spotify-modal-header">
          <span className="spotify-modal-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
            </svg>
            Spotify
          </span>
          <button
            className="spotify-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Vinyl art */}
        <div className="spotify-modal-art">
          <div className="spotify-modal-disc">
            <svg width="72" height="72" viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="43" fill="#111" />
              {[38, 34, 30, 26, 22].map((r) => (
                <circle key={r} cx="44" cy="44" r={r} stroke="#1a1a1a" strokeWidth="1.2" />
              ))}
              <circle cx="44" cy="44" r="16" fill="#121212" />
              <circle cx="44" cy="44" r="14" fill="none" stroke="#1DB954" strokeWidth="0.8" opacity="0.6" />
              <circle cx="44" cy="44" r="2.5" fill="#0d0f14" />
            </svg>
          </div>
        </div>

        {/* Profile info */}
        <div className="spotify-modal-info">
          <p className="spotify-modal-username">Poetist</p>
          <p className="spotify-modal-meta">{SPOTIFY_PLAYLISTS.length} public playlists</p>
        </div>

        {/* Playlists preview */}
        <div className="spotify-modal-playlists">
          {SPOTIFY_PLAYLISTS.map((name) => (
            <div key={name} className="spotify-modal-playlist-chip">
              <span className="spotify-modal-playlist-icon">♪</span>
              {name}
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={data.spotify.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-modal-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
          </svg>
          Open on Spotify
        </a>
      </div>
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

