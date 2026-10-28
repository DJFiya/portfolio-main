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
import { actionLabelFor } from './desk/itemLabels'
import SpotifyMiniPlayer from './desk/SpotifyMiniPlayer'
import SpotifyModal from './desk/SpotifyModal'
import PoemParticles, { type PoemBurst } from './desk/PoemParticles'
import InvincibleSequence from './desk/InvincibleSequence'
import GwhPlane from './desk/GwhPlane'
import DeadPoetsParticles, { type DpsBurst } from './desk/DeadPoetsParticles'
import AtlaParticles, { type AtlaBurst, type AtlaEffect } from './desk/AtlaParticles'
import { useCoffeeMug } from './desk/useCoffeeMug'
import { CoffeeSteam, CoffeeBlink } from './desk/CoffeeOverlays'
import { useCassette } from './desk/useCassette'
import CassetteNotes from './desk/CassetteNotes'
import { useDiceRolls } from './desk/useDiceRolls'

const data = rawData as unknown as PortfolioData

const ATLA_MS = 900
const DPS_MS  = 4500
const TERMINAL_HACK_MS = 1900
const GAME_MODE_MS = 4500
const REALITY_HIT_MS = 2100

const ATLA_EFFECTS: AtlaEffect[] = ['fire', 'earth', 'water', 'air']
const POEM_MS = 1700
const POEM_VERSES: [string, string][] = [
  ['ink remembers fingertips', 'long after hands let go'],
  ['paper keeps the midnight hush', 'between each careful line'],
  ['small words fall like rain', 'and bloom into quiet'],
  ['every margin holds a moon', 'for thoughts that missed their train'],
]

export default function DeskClutter() {
  const { rolling, diceValues, criticals, roll } = useDiceRolls(data.desk)
  const [atlaBurst,     setAtlaBurst]     = useState<AtlaBurst | null>(null)
  const [dpsBurst,      setDpsBurst]      = useState<DpsBurst  | null>(null)
  const [poemBurst,     setPoemBurst]     = useState<PoemBurst | null>(null)
  const [spotifyOpen,    setSpotifyOpen]    = useState(false)
  const [gwhActive,      setGwhActive]      = useState(false)
  const [laptopClicking, setLaptopClicking] = useState(false)
  const [terminalHacking, setTerminalHacking] = useState(false)
  const [invincibleActive, setInvincibleActive] = useState(false)
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
  const atlaEffectIndexRef = useRef(0)
  const poemVerseIndexRef = useRef(0)
  const gameModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const coffee = useCoffeeMug(mugRef)
  const cassette = useCassette(cassetteRef)

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
    if (spotifyOpen || gwhActive || invincibleActive || coffee.blinking) return
    setGameMode(true)
    setGameModeTick(t => t + 1)
    gameModeTimerRef.current = setTimeout(() => {
      setGameMode(false)
      gameModeTimerRef.current = null
    }, GAME_MODE_MS)
  }, [gameMode, exitGameMode, spotifyOpen, gwhActive, invincibleActive, coffee.blinking])

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

  // Desk items act as buttons: Enter or Space triggers the same click handler
  const activateOnKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    e.currentTarget.click()
  }

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

          const onActivate: React.MouseEventHandler<HTMLDivElement> | undefined =
            isDice         ? () => roll(item.id, item.type)
            : isAtlaPoster ? handleAtla
            : isDpsPoster  ? handleDps
            : isGwhPoster  ? handleGwh
            : isInvPoster  ? handleInvincible
            : isTerminal   ? handleTerminalClick
            : isVinyl      ? () => setSpotifyOpen(true)
            : isCassette   ? cassette.toggle
            : isLaptop     ? handleLaptopClick
            : isPoem       ? e => handlePoemClick(e.currentTarget)
            : isMug        ? coffee.sip
            : isController ? handleController
            : isSword      ? handleSwordGameOpen
            : undefined

          const actionLabel = actionLabelFor(item.type, item.label)

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
              role={actionLabel ? 'button' : undefined}
              tabIndex={actionLabel ? 0 : undefined}
              aria-label={actionLabel}
              aria-pressed={isCassette ? cassette.active : isController ? gameMode : undefined}
              className={`absolute select-none desk-item${isLaptop ? ' desk-item--laptop' : ''}${isLaptop && laptopClicking ? ' desk-item--laptop-click' : ''}${isCassette && cassette.active ? ' cassette-playing' : ''}${isPoem ? ' desk-item--poem' : ''}${isPoem && poemBurst ? ' desk-item--poem-active' : ''}${isTerminal ? ' desk-item--terminal' : ''}${isTerminal && terminalHacking ? ' desk-item--terminal-hack' : ''}${isController ? ' desk-item--controller' : ''}${isController && gameMode ? ' desk-item--controller-active' : ''}${isSword && realityHitBurst ? ' desk-item--sword-reality-hit' : ''}`}
              style={{
                left: `${item.x}%`,
                top:  `${item.y}%`,
                '--item-rotate': `${item.rotate}deg`,
                zIndex: item.zIndex,
                cursor: actionLabel ? 'pointer' : undefined,
              } as React.CSSProperties}
              onClick={onActivate}
              onKeyDown={actionLabel ? activateOnKey : undefined}
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
                  mugFillLevel={isMug ? coffee.fillLevel : undefined}
                  mugSipping={isMug ? coffee.sipping : undefined}
                  mugEmpty={isMug ? coffee.fillLevel <= 0 : undefined}
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

      {cassette.active && createPortal(
        <>
          <CassetteNotes notes={cassette.notes} />
          <SpotifyMiniPlayer playlistId={cassette.playlistId} onStop={cassette.stop} />
        </>,
        document.body
      )}

      {spotifyOpen && createPortal(
        <SpotifyModal onClose={() => setSpotifyOpen(false)} />,
        document.body
      )}

      {coffee.steam.length > 0 && createPortal(
        <CoffeeSteam steam={coffee.steam} />,
        document.body
      )}

      {coffee.blinking && createPortal(<CoffeeBlink />, document.body)}

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
