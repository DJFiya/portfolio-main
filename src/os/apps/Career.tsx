import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ROLES } from '../content'
import { Report, type Line } from './Instrument'
import { AMB, grid, padOf, PH, PH2, sizeCanvas, useCanvasResize, type Screen } from './screen'
import './instrument.css'

const LAST = ROLES.length - 1

// The track: a rising wave across the screen, u from 0 (first role) to 1 (latest)
function pt(g: Screen, u: number) {
  const p = padOf(g), x = p.l + (g.W - p.l - p.r) * u, mid = p.t + (g.H - p.t - p.b) / 2, amp = (g.H - p.t - p.b) * 0.32
  return [x, mid - Math.sin(u * Math.PI * 2.2 + 0.4) * amp * (0.55 + u * 0.45)]
}

function draw(cv: HTMLCanvasElement, shown: number) {
  const g = sizeCanvas(cv), { c, D } = g
  grid(g)
  c.lineWidth = 2 * D; c.strokeStyle = PH2 + '0.55)'; c.setLineDash([6 * D, 6 * D]); c.beginPath()
  for (let i = 0; i <= 200; i++) { const [x, y] = pt(g, i / 200); if (i) c.lineTo(x, y); else c.moveTo(x, y) }
  c.stroke(); c.setLineDash([])
  const u = shown / LAST
  c.strokeStyle = AMB; c.lineWidth = 3 * D; c.beginPath()
  for (let i = 0; i <= 200 * u; i++) { const [x, y] = pt(g, i / 200); if (i) c.lineTo(x, y); else c.moveTo(x, y) }
  c.stroke()
  ROLES.forEach((r, i) => {
    const [x, y] = pt(g, i / LAST), on = Math.round(shown) === i
    c.fillStyle = i <= shown + 0.01 ? AMB : '#2B3A31'
    c.beginPath(); c.arc(x, y, (on ? 7 : 5) * D, 0, Math.PI * 2); c.fill()
    c.textAlign = i === 0 ? 'left' : i === LAST ? 'right' : 'center'
    const ly = y + (Math.sin((i / LAST) * Math.PI * 2.2 + 0.4) > 0 ? -18 : 28) * D
    c.fillStyle = on ? '#FFF' : PH; c.font = `${on ? 600 : 500} ${13 * D}px 'JetBrains Mono', monospace`; c.fillText(r.tick, x, ly)
    c.fillStyle = PH2 + '0.9)'; c.font = `${11 * D}px 'JetBrains Mono', monospace`; c.fillText(r.when.split(' – ')[0], x, ly + 15 * D)
  })
  const [cx, cy] = pt(g, u)
  c.strokeStyle = '#FFF'; c.lineWidth = 2 * D; c.beginPath(); c.arc(cx, cy, 11 * D, 0, Math.PI * 2); c.stroke()
}

export default function Career() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [pos, setPos] = useState(LAST)
  const cv = useRef<HTMLCanvasElement>(null)
  // Where the marker is drawn; eases toward pos
  const shown = useRef(LAST)

  useCanvasResize(cv, () => { if (cv.current) draw(cv.current, shown.current) })

  useEffect(() => {
    let raf = 0
    const step = () => {
      const d = pos - shown.current
      shown.current = reduce || Math.abs(d) < 0.01 ? pos : shown.current + d * 0.16
      if (cv.current) draw(cv.current, shown.current)
      if (shown.current !== pos) raf = requestAnimationFrame(step)
    }
    step()
    return () => cancelAnimationFrame(raf)
  }, [pos, reduce])

  const r = ROLES[pos]
  const lines: Line[] = [['h', r.role], ['a', r.org], ['k', r.when], ['', ''], ...r.points.map((p): Line => ['', '— ' + p])]
  return (
    <div className="ins">
      <div className="ins-screens">
        <div className="scr" style={{ minHeight: 260 }}>
          <h3>Career track</h3>
          <canvas ref={cv} aria-hidden="true" />
        </div>
        <Report title={'Role · ' + r.tick} lines={lines} />
      </div>
      <div className="hw">
        <span className="plate">Career</span>
        <div className="fader">
          <label className="cap" htmlFor="career-fader">Slide along the track</label>
          <input type="range" id="career-fader" min={0} max={LAST} step={1} value={pos} aria-valuetext={r.tick} onChange={e => setPos(+e.target.value)} />
          <div className="ticks">
            {ROLES.map((x, i) => <button key={x.tick} type="button" className={i === pos ? 'sel' : ''} onClick={() => setPos(i)}>{x.tick}</button>)}
          </div>
        </div>
      </div>
    </div>
  )
}
