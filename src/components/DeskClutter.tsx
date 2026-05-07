import type React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'

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

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
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
  const [coffeeSips, setCoffeeSips] = useState(0)
  const [mugSipping, setMugSipping] = useState(false)
  const [coffeeBlinking, setCoffeeBlinking] = useState(false)
  const [steam, setSteam] = useState<SteamParticle[]>([])
  const atlaRef     = useRef<HTMLDivElement | null>(null)
  const dpsRef      = useRef<HTMLDivElement | null>(null)
  const cassetteRef = useRef<HTMLDivElement | null>(null)
  const mugRef      = useRef<HTMLDivElement | null>(null)
  const noteIdRef   = useRef(0)
  const steamIdRef  = useRef(0)
  const atlaEffectIndexRef = useRef(0)
  const poemVerseIndexRef = useRef(0)

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
      {data.desk.map((item) => {
        const isDice       = item.type.startsWith('dice-')
        const isAtlaPoster = item.type === 'poster' && item.label === 'ATLA'
        const isDpsPoster  = item.type === 'poster' && item.label === 'Dead Poets'
        const isGwhPoster  = item.type === 'poster' && item.label === 'Good Will Hunting'
        const isTerminal   = item.type === 'terminal'
        const isVinyl      = item.type === 'vinyl'
        const isCassette   = item.type === 'cassette'
        const isLaptop     = item.type === 'laptop'
        const isPoem       = item.type === 'poem'
        const isMug        = item.type === 'mug'
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
            ref={isAtlaPoster ? atlaRef : isDpsPoster ? dpsRef : isCassette ? cassetteRef : isMug ? mugRef : undefined}
            className={`absolute select-none desk-item${isLaptop ? ' desk-item--laptop' : ''}${isLaptop && laptopClicking ? ' desk-item--laptop-click' : ''}${isCassette && cassetteActive ? ' cassette-playing' : ''}${isPoem ? ' desk-item--poem' : ''}${isPoem && poemBurst ? ' desk-item--poem-active' : ''}${isTerminal ? ' desk-item--terminal' : ''}${isTerminal && terminalHacking ? ' desk-item--terminal-hack' : ''}`}
            style={{
              left: `${item.x}%`,
              top:  `${item.y}%`,
              '--item-rotate': `${item.rotate}deg`,
              zIndex: item.zIndex,
              cursor: isDice || isAtlaPoster || isDpsPoster || isGwhPoster || isVinyl || isCassette || isLaptop || isPoem || isTerminal || isMug ? 'pointer' : undefined,
            } as React.CSSProperties}
            onClick={
              isDice         ? () => handleRoll(item.id, item.type)
              : isAtlaPoster ? handleAtla
              : isDpsPoster  ? handleDps
              : isGwhPoster  ? handleGwh
              : isTerminal   ? handleTerminalClick
              : isVinyl      ? () => setSpotifyOpen(true)
              : isCassette   ? handleCassette
              : isLaptop     ? handleLaptopClick
              : isPoem       ? (e) => handlePoemClick(e.currentTarget)
              : isMug        ? handleMugClick
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
        <GwhPlane onDone={() => setGwhActive(false)} />,
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
    </>
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

