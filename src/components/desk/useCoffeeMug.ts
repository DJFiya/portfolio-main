import type { RefObject } from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'

const MUG_MAX_SIPS = 6
const MUG_SIP_MS = 260
const COFFEE_BLINK_MS = 1100
const COFFEE_REFILL_SYNC_MS = 550

export interface SteamParticle {
  id: number
  x: number
  y: number
  drift: number
  size: number
  dur: number
  removeAt: number
}

// Each click is a sip; the last sip triggers a blink, and the mug refills
// mid-blink so the reset happens while the eyes are closed.
export function useCoffeeMug(mugRef: RefObject<HTMLDivElement | null>) {
  const [sips, setSips] = useState(0)
  const [sipping, setSipping] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [steam, setSteam] = useState<SteamParticle[]>([])
  const steamIdRef = useRef(0)

  const sip = useCallback(() => {
    if (blinking) return
    setSipping(false)
    requestAnimationFrame(() => {
      setSipping(true)
      setTimeout(() => setSipping(false), MUG_SIP_MS)
    })

    setSips(prev => {
      const next = Math.min(prev + 1, MUG_MAX_SIPS)
      if (next >= MUG_MAX_SIPS) {
        setBlinking(true)
        setTimeout(() => {
          setSips(0)
          setSteam([])
        }, COFFEE_REFILL_SYNC_MS)
        setTimeout(() => {
          setBlinking(false)
        }, COFFEE_BLINK_MS)
      }
      return next
    })
  }, [blinking])

  const fillLevel = 1 - sips / MUG_MAX_SIPS

  useEffect(() => {
    if (fillLevel <= 0 || blinking) {
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
  }, [fillLevel, blinking, mugRef])

  return { fillLevel, sipping, blinking, steam, sip }
}
