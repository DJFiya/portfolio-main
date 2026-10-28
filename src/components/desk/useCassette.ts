import type { RefObject } from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'

const data = rawData as unknown as PortfolioData

export interface NoteParticle {
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

const NOTE_COLORS = ['#9b8fb8', '#c49a9e', '#7a8fa3', '#7a9e8a', '#c4a882', '#b89a82', '#7a9a9a', '#b0908a']
const NOTE_GLYPHS = ['♩', '♪', '♫', '♬']

// Build a weighted pool from portfolio.json — no IDs hardcoded here
const CASSETTE_PLAYLIST_POOL: string[] = data.spotify.playlists.flatMap(p => {
  const id = p.url.split('/playlist/')[1]
  return Array.from({ length: p.weight }, () => id)
})

// Clicking the cassette picks a weighted-random playlist and emits music notes
// from the tape until it is clicked again or the player is stopped.
export function useCassette(cassetteRef: RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState(false)
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [notes, setNotes] = useState<NoteParticle[]>([])
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const noteIdRef = useRef(0)

  const stop = useCallback(() => {
    setActive(false)
    setNotes([])
    setPlaylistId(null)
  }, [])

  const toggle = useCallback(() => {
    if (active) {
      stop()
      return
    }
    const r = cassetteRef.current?.getBoundingClientRect()
    if (!r) return
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height })
    if (CASSETTE_PLAYLIST_POOL.length > 0) {
      setPlaylistId(CASSETTE_PLAYLIST_POOL[Math.floor(Math.random() * CASSETTE_PLAYLIST_POOL.length)])
    }
    setActive(true)
  }, [active, stop, cassetteRef])

  useEffect(() => {
    if (!active || !rect) return
    const { left, top, width, height } = rect
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
  }, [active, rect])

  return { active, notes, playlistId, toggle, stop }
}
