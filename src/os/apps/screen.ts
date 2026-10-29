import { useEffect, useRef, type RefObject } from 'react'

// Drawing helpers for the green phosphor screens on the instrument apps

export const PH = '#CFE8D3'
export const PH2 = 'rgba(143,174,150,'
export const AMB = '#F2B24C'

export type Screen = { c: CanvasRenderingContext2D; W: number; H: number; D: number }

export function sizeCanvas(cv: HTMLCanvasElement): Screen {
  const r = cv.getBoundingClientRect(), D = devicePixelRatio || 1
  cv.width = Math.max(1, Math.round(r.width * D))
  cv.height = Math.max(1, Math.round(r.height * D))
  return { W: cv.width, H: cv.height, D, c: cv.getContext('2d')! }
}

export function grid({ c, W, H, D }: Screen) {
  c.clearRect(0, 0, W, H)
  c.lineWidth = D
  c.strokeStyle = PH2 + '0.12)'
  for (let i = 1; i < 12; i++) { const x = W / 12 * i; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke() }
  for (let i = 1; i < 6; i++) { const y = H / 6 * i; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke() }
}

export const padOf = (g: Screen) => ({ l: 40 * g.D, r: 40 * g.D, t: 56 * g.D, b: 40 * g.D })

// Redraws a canvas whenever its box changes size
export function useCanvasResize(ref: RefObject<HTMLCanvasElement | null>, draw: () => void) {
  const latest = useRef(draw)
  useEffect(() => { latest.current = draw })
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ro = new ResizeObserver(() => latest.current())
    ro.observe(cv)
    return () => ro.disconnect()
  }, [ref])
}
