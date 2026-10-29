import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { PauseGlyph, PlayGlyph } from '../icons'
import invincibleCard from '../../assets/invincible-title-card.png'
import { sizeCanvas, type Screen } from './screen'
import './media.css'
import './cinema.css'

const FILMS = [
  { id: 'atla', title: 'Avatar: The Last Airbender', color: '#C2562E', dur: 8 },
  { id: 'dps', title: 'Dead Poets Society', color: '#4A5A3E', dur: 4.6 },
  { id: 'gwh', title: 'Good Will Hunting', color: '#2C4F7C', dur: 4.6 },
  { id: 'inv', title: 'Invincible', color: '#C9A928', dur: 2.6 },
]

const DPS_LINES = ['Carpe diem', 'O Captain! My Captain!', 'Seize the day', 'Gather ye rosebuds while ye may', 'O me! O life!', 'Make your lives extraordinary', 'Words and ideas can change the world']
const PLANE = '<svg width="160" height="100" viewBox="0 0 100 62" aria-hidden="true"><path d="M98 31L2 5l32 26L2 57z" fill="#F5F0E8" stroke="#BFB49A" stroke-width="1.4"/><path d="M98 31H34" stroke="#BFB49A" stroke-dasharray="4 2.5"/><path d="M66 20L34 31l32 11" fill="none" stroke="#BFB49A" stroke-width=".8"/></svg>'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; col: string; r?: number; gr?: number; sq?: boolean; len?: number; line?: boolean }
type Scene = { events: { t: number; fn: () => void; done: boolean }[]; parts: Particle[]; rings: { r: number }[]; cv?: HTMLCanvasElement; g?: Screen }

const fmt = (s: number) => '0:' + String(Math.floor(s)).padStart(2, '0')

function el(tag: string, cls: string, text = '') {
  const n = document.createElement(tag)
  n.className = cls
  n.textContent = text
  return n
}

function spawn(sc: Scene, kind: string) {
  const cv = sc.cv
  if (!cv) return
  const g = sizeCanvas(cv), d = g.D, cx = g.W / 2, cy = g.H / 2
  sc.g = g
  for (let i = 0; i < 80; i++) {
    if (kind === 'Fire') sc.parts.push({ x: cx + (Math.random() - 0.5) * g.W * 0.5, y: g.H * 0.85, vx: (Math.random() - 0.5) * 0.6 * d, vy: -(1.5 + Math.random() * 3) * d, r: (2 + Math.random() * 4) * d, life: 1, col: ['#FF7A2E', '#FFB341', '#E8452C'][i % 3] })
    if (kind === 'Earth') { const a = Math.random() * Math.PI * 2, s = (2 + Math.random() * 5) * d; sc.parts.push({ x: cx, y: cy + 40 * d, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3 * d, gr: 0.18 * d, r: (3 + Math.random() * 7) * d, life: 1, sq: true, col: ['#8B6A44', '#6E5638', '#A98A5F'][i % 3] }) }
    if (kind === 'Air') sc.parts.push({ x: -Math.random() * g.W * 0.6, y: g.H * (0.15 + Math.random() * 0.7), vx: (6 + Math.random() * 8) * d, vy: 0, len: (40 + Math.random() * 120) * d, life: 1, line: true, col: 'rgba(230,236,240,0.7)' })
  }
  if (kind === 'Water') sc.rings = [0, 1, 2, 3, 4].map(i => ({ r: -i * 40 * d }))
}

function frame(sc: Scene) {
  const g = sc.g
  if (!g) return
  const { c, W, H, D } = g
  c.clearRect(0, 0, W, H)
  sc.parts.forEach(p => {
    p.x += p.vx; p.y += p.vy
    if (p.gr) p.vy += p.gr
    p.life -= 0.012
    c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.col; c.strokeStyle = p.col
    if (p.line) { c.lineWidth = 2 * D; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.len!, p.y); c.stroke() }
    else if (p.sq) c.fillRect(p.x, p.y, p.r!, p.r!)
    else { c.beginPath(); c.arc(p.x, p.y, Math.max(0.1, p.r! * p.life), 0, Math.PI * 2); c.fill() }
  })
  sc.parts = sc.parts.filter(p => p.life > 0)
  sc.rings.forEach(r => {
    r.r += 3.2 * D
    if (r.r <= 0) return
    c.globalAlpha = Math.max(0, 1 - r.r / (W * 0.45)); c.strokeStyle = '#6FB3E6'; c.lineWidth = 3 * D
    c.beginPath(); c.ellipse(W / 2, H / 2, r.r, r.r * 0.45, 0, 0, Math.PI * 2); c.stroke()
  })
  c.globalAlpha = 1
}

// Each film is a short scripted scene of timed events played into the stage
function script(id: string, stage: HTMLDivElement, sc: Scene, reduce: boolean) {
  const at = (t: number, fn: () => void) => sc.events.push({ t, fn, done: false })
  if (id === 'atla') {
    const cv = document.createElement('canvas')
    stage.appendChild(cv)
    sc.cv = cv;
    ([['Fire', '#FF7A2E'], ['Earth', '#A98A5F'], ['Water', '#6FB3E6'], ['Air', '#E6ECF0']] as const).forEach(([kind, col], k) => at(k * 2, () => {
      stage.querySelectorAll('.atla-label').forEach(n => n.remove())
      const lab = el('p', 'atla-label', kind)
      lab.style.color = col
      stage.appendChild(lab)
      spawn(sc, kind)
    }))
  }
  if (id === 'dps') DPS_LINES.forEach((ln, k) => at(k * 0.32, () => {
    const s = el('span', 'dps-word', ln)
    s.style.fontSize = (18 + (k % 3) * 8) + 'px'
    s.style.left = (8 + (k * 37) % 66) + '%'
    s.style.top = (35 + (k * 23) % 50) + '%'
    s.style.setProperty('--dx', ((k % 2 ? 1 : -1) * (10 + k * 4)) + 'px')
    stage.appendChild(s)
  }))
  if (id === 'gwh') {
    at(0, () => { const p = el('div', 'gwh-plane'); p.innerHTML = PLANE; stage.appendChild(p) })
    at(1.15, () => {
      const pl = stage.querySelector<HTMLElement>('.gwh-plane')
      if (pl) pl.style.opacity = '0'
      stage.appendChild(el('p', 'gwh-note', 'Sorry, I had to go see about a girl.'))
    })
    at(3.7, () => {
      const pl = stage.querySelector<HTMLElement>('.gwh-plane')
      if (pl) { pl.style.opacity = '1'; pl.classList.add('out') }
    })
  }
  if (id === 'inv') at(0, () => {
    stage.style.background = '#13A0EC'
    const card = el('img', 'inv-card') as HTMLImageElement
    card.src = invincibleCard
    card.alt = ''
    stage.appendChild(card)
    if (!reduce) stage.classList.add('shake')
  })
}

export default function Cinema() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [cur, setCur] = useState<number | null>(null)
  const [t, setT] = useState(0)
  const [paused, setPaused] = useState(true)
  const [ended, setEnded] = useState(false)
  const scene = useRef<HTMLDivElement>(null)
  const sc = useRef<Scene>({ events: [], parts: [], rings: [] })
  const clock = useRef({ raf: 0, t: 0 })

  useEffect(() => () => cancelAnimationFrame(clock.current.raf), [])

  const play = (i: number) => {
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.5, (now - last) / 1000))
      last = now
      const k = clock.current
      k.t += dt
      sc.current.events.forEach(e => { if (!e.done && k.t >= e.t) { e.done = true; e.fn() } })
      frame(sc.current)
      const dur = FILMS[i].dur
      if (k.t >= dur) { k.t = dur; setT(dur); setEnded(true); setPaused(true); return }
      setT(k.t)
      k.raf = requestAnimationFrame(loop)
    }
    setPaused(false)
    clock.current.raf = requestAnimationFrame(loop)
  }

  const load = (i: number) => {
    const stage = scene.current
    if (!stage) return
    cancelAnimationFrame(clock.current.raf)
    stage.replaceChildren()
    stage.className = 'scene'
    stage.style.background = ''
    sc.current = { events: [], parts: [], rings: [] }
    clock.current.t = 0
    script(FILMS[i].id, stage, sc.current, reduce)
    setCur(i); setT(0); setEnded(false)
    play(i)
  }

  const pause = () => { cancelAnimationFrame(clock.current.raf); setPaused(true) }
  const onPlay = () => {
    if (cur === null) return load(0)
    if (ended) return load(cur)
    if (paused) play(cur)
    else pause()
  }

  const dur = cur === null ? 0 : FILMS[cur].dur
  const u = dur ? t / dur : 0
  return (
    <div className="media">
      <div className="media-main">
        <div className={`stage${paused ? ' paused' : ''}`}>
          {cur === null && <p className="stage-hint">Pick a film to play its scene.</p>}
          <div ref={scene} className="scene" />
        </div>
        <div className="transport">
          <button type="button" className="tp" aria-label={!paused ? 'Pause' : ended ? 'Replay' : 'Play'} onClick={onPlay}>{paused ? <PlayGlyph /> : <PauseGlyph />}</button>
          <div className="scrub" role="progressbar" aria-label="Playback" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(u * 100)}><i style={{ transform: `scaleX(${u})` }} /></div>
          <span className="ttime">{fmt(t)} / {fmt(dur)}</span>
        </div>
      </div>
      <nav className="plist" aria-label="Films">
        <h3>Films</h3>
        {FILMS.map((f, i) => (
          <button key={f.id} type="button" aria-current={i === cur} onClick={() => load(i)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: 'inherit', fontWeight: 600 }}><i className="sw" style={{ background: f.color }} />{f.title}</span>
            <span>0:0{Math.ceil(f.dur)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
