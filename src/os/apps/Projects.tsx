import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { PROJECTS, type Project } from '../content'
import type { AppProps } from '../os-context'
import { Knob, Report, type Line } from './Instrument'
import { AMB, grid, padOf, PH, PH2, sizeCanvas, useCanvasResize } from './screen'
import './instrument.css'

// What the terminal passes to fly a project straight away
export type LaunchArg = { id: string; launch?: boolean }

type Phase = 'idle' | 'count' | 'fly'
type Shown = 'brief' | 'report' | 'unarmed' | 'countdown'

function drawIdle(cv: HTMLCanvasElement, p: Project) {
  const g = sizeCanvas(cv), pd = padOf(g), { c, W, H, D } = g
  grid(g)
  c.strokeStyle = PH2 + '0.5)'; c.lineWidth = D
  c.beginPath(); c.moveTo(pd.l, pd.t - 8 * D); c.lineTo(pd.l, H - pd.b); c.lineTo(W - pd.r, H - pd.b); c.stroke()
  c.fillStyle = PH; c.font = `${13 * D}px 'JetBrains Mono', monospace`; c.textAlign = 'center'
  c.fillText('Arm and launch to fly ' + p.name, W / 2, H / 2)
}

// Ascent curve to the project's target orbit, drawn up to progress u (0–1)
function drawAscent(cv: HTMLCanvasElement, p: Project, u: number) {
  const g = sizeCanvas(cv), { c, W, H, D } = g, pd = padOf(g)
  grid(g)
  const y0 = H - pd.b, yO = pd.t + (H - pd.t - pd.b) * (1 - p.apo)
  const pt = (t: number) => {
    const k = Math.min(1, t / p.turn)
    return [pd.l + (W - pd.l - pd.r) * t, y0 - (y0 - yO) * (t < p.turn ? Math.sin(k * Math.PI / 2) ** 1.4 : 1)]
  }
  c.strokeStyle = PH2 + '0.4)'; c.setLineDash([4 * D, 6 * D]); c.lineWidth = 1.5 * D
  c.beginPath(); c.moveTo(pd.l, yO); c.lineTo(W - pd.r, yO); c.stroke(); c.setLineDash([])
  c.fillStyle = PH2 + '0.9)'; c.font = `${12 * D}px 'JetBrains Mono', monospace`; c.textAlign = 'left'
  c.fillText('target orbit', pd.l + 10 * D, yO - 8 * D)
  c.strokeStyle = PH2 + '0.5)'; c.lineWidth = D
  c.beginPath(); c.moveTo(pd.l, pd.t - 8 * D); c.lineTo(pd.l, y0); c.lineTo(W - pd.r, y0); c.stroke()
  c.strokeStyle = AMB; c.lineWidth = 3 * D; c.beginPath()
  const n = Math.max(1, Math.round(240 * u))
  for (let i = 0; i <= n; i++) { const [x, y] = pt(i / 240); if (i) c.lineTo(x, y); else c.moveTo(x, y) }
  c.stroke()
  const [cx, cy] = pt(u)
  c.fillStyle = '#FFF'; c.beginPath(); c.arc(cx, cy, 6 * D, 0, Math.PI * 2); c.fill()
  c.font = `600 ${13 * D}px 'JetBrains Mono', monospace`
  c.fillText(p.name.toUpperCase() + (u >= 1 ? ' · ORBIT' : ''), Math.min(cx + 12 * D, W - 170 * D), cy - 14 * D)
}

function reportFor(shown: Shown, p: Project): { title: string; lines: Line[]; links: [string, string][] } {
  const award: Line = ['a', p.award + (p.prize ? ' · ' + p.prize : '')]
  if (shown === 'unarmed') return { title: 'Briefing · ' + p.name, lines: [['a', 'Not armed.'], ['', 'Flip the Arm switch first, then launch.']], links: [] }
  if (shown === 'countdown') return { title: 'Mission report · ' + p.name, lines: [['k', 'Countdown…']], links: [] }
  if (shown === 'report') {
    return {
      title: 'Mission report · ' + p.name,
      lines: [['h', p.name], award, ['', ''], ['k', 'What it does'], ['', p.line], ['', ''], ['k', 'How it works'], ...p.points.map((x): Line => ['', '— ' + x]), ['', ''], ['k', 'Built with'], ['', p.stack.join(', ')]],
      links: p.links.map(([l, u]) => ['Open ' + l, u]),
    }
  }
  return { title: 'Briefing · ' + p.name, lines: [['h', p.name], award, ['', ''], ['', p.line], ['', ''], ['k', 'Arm and launch for the full report.']], links: [['Open ' + p.links[0][0], p.links[0][1]]] }
}

export default function Projects({ arg, argKey }: AppProps) {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [sel, setSel] = useState(0)
  const [armed, setArmed] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [orbit, setOrbit] = useState(false)
  const [shown, setShown] = useState<Shown>('brief')
  const [count, setCount] = useState(3)
  const [seenArg, setSeenArg] = useState<number | null>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const flight = useRef<{ p: Project; u: number } | null>(null)
  const p = PROJECTS[sel]

  const redraw = () => {
    if (!cv.current) return
    if (flight.current) drawAscent(cv.current, flight.current.p, flight.current.u)
    else drawIdle(cv.current, p)
  }
  useCanvasResize(cv, redraw)

  const choose = (i: number) => {
    if (phase !== 'idle') return
    setSel(i); setShown('brief'); setOrbit(false)
  }
  const launch = () => {
    if (phase !== 'idle') return
    if (!armed) { setShown('unarmed'); return }
    setOrbit(false); setShown('countdown'); setCount(3)
    setPhase(reduce ? 'fly' : 'count')
  }

  // Reopened from the terminal: select the project, and fly it if asked
  if (arg !== undefined && argKey !== seenArg) {
    setSeenArg(argKey)
    const a = arg as LaunchArg | undefined
    const i = PROJECTS.findIndex(x => x.id === a?.id)
    if (i >= 0 && phase === 'idle') {
      setSel(i); setShown('brief'); setOrbit(false)
      if (a?.launch) { setArmed(true); setShown('countdown'); setCount(3); setPhase(reduce ? 'fly' : 'count') }
    }
  }

  // A new selection clears the plot back to the idle prompt
  useEffect(() => {
    if (phase !== 'idle' || orbit || !cv.current) return
    flight.current = null
    drawIdle(cv.current, PROJECTS[sel])
  }, [sel, phase, orbit])

  useEffect(() => {
    if (phase !== 'count') return
    const t = setTimeout(() => { if (count > 1) setCount(count - 1); else setPhase('fly') }, 1000)
    return () => clearTimeout(t)
  }, [phase, count])

  useEffect(() => {
    if (phase !== 'fly') return
    const target = PROJECTS[sel], t0 = performance.now(), dur = reduce ? 1 : 2400
    let raf = 0
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / dur)
      flight.current = { p: target, u: 1 - Math.pow(1 - u, 3) }
      if (cv.current) drawAscent(cv.current, target, flight.current.u)
      if (u < 1) raf = requestAnimationFrame(step)
      else { setPhase('idle'); setOrbit(true); setArmed(false); setShown('report') }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, sel, reduce])

  const r = reportFor(shown, p)
  return (
    <div className="ins">
      <div className="ins-screens">
        <div className="scr" style={{ minHeight: 260 }}>
          <h3 className="plot-h">{phase === 'idle' && !orbit ? 'Ascent' : 'Ascent · ' + p.name}</h3>
          <canvas ref={cv} aria-hidden="true" />
          {phase === 'count' && <div key={count} className="count on" aria-hidden="true">{count}</div>}
        </div>
        <Report title={r.title} lines={r.lines} links={r.links} />
      </div>
      <div className="hw">
        <span className="plate">Missions</span>
        <Knob names={PROJECTS.map(x => x.name)} sel={sel} onSel={choose} label="Project selector" />
        <button type="button" className="tog arm" aria-pressed={armed} onClick={() => { if (phase === 'idle') setArmed(a => !a) }}>
          <span className="base"><span className="lever" /></span>
          <span className="t"><b>Arm</b><span>{armed ? 'Armed' : 'Safe'}</span></span>
        </button>
        <button type="button" className={`push launch${armed ? ' armed' : ''}`} onClick={() => launch()}>Launch</button>
        <div className="lamps" aria-hidden="true">
          <span className={`lamp${armed ? ' on' : ''}`}>Armed</span>
          <span className={`lamp${phase !== 'idle' ? ' on' : ''}`}>Launch</span>
          <span className={`lamp go${orbit ? ' on' : ''}`}>Orbit</span>
        </div>
      </div>
    </div>
  )
}
