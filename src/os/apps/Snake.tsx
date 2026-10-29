import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import './snake.css'

const COLS = 21, ROWS = 15
// Matches .snake-wrap padding on both sides
const PAD = 28
const BEST_KEY = 'daevikos:snake-best'

type P = { x: number; y: number }
type Status = 'ready' | 'playing' | 'paused' | 'over'

const KEYS: Record<string, P> = {
  ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
}

const fresh = () => ({ snake: [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }], dir: { x: 1, y: 0 }, queue: [] as P[], food: { x: 14, y: 7 } })

function placeFood(snake: P[]): P {
  const free: P[] = []
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!snake.some(s => s.x === x && s.y === y)) free.push({ x, y })
  return free[Math.floor(Math.random() * free.length)]
}

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}

export default function Snake() {
  const [status, setStatus] = useState<Status>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [cell, setCell] = useState(20)
  const [newBest, setNewBest] = useState(false)
  const game = useRef(fresh())
  const cv = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const swipe = useRef<P | null>(null)

  const draw = useCallback(() => {
    const canvas = cv.current
    if (!canvas) return
    const D = devicePixelRatio || 1, s = cell * D
    canvas.width = COLS * s; canvas.height = ROWS * s
    const c = canvas.getContext('2d')!
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      c.fillStyle = (x + y) % 2 ? '#151D19' : '#18211C'
      c.fillRect(x * s, y * s, s, s)
    }
    const { snake, food, dir } = game.current
    const inset = Math.max(1, s * 0.08)
    c.fillStyle = '#F2B24C'
    c.fillRect(food.x * s + s * 0.2, food.y * s + s * 0.2, s * 0.6, s * 0.6)
    c.fillStyle = '#7FC46A'
    c.fillRect(food.x * s + s * 0.45, food.y * s + s * 0.05, s * 0.1, s * 0.2)
    snake.forEach((p, i) => {
      c.fillStyle = i === 0 ? '#A8E6A0' : i % 2 ? '#6FBF73' : '#7FD38B'
      c.fillRect(p.x * s + inset, p.y * s + inset, s - inset * 2, s - inset * 2)
    })
    // Eyes look the way the snake is heading
    const h = snake[0], e = s * 0.14
    c.fillStyle = '#0F1512'
    const ex = h.x * s + s / 2 + dir.x * s * 0.18, ey = h.y * s + s / 2 + dir.y * s * 0.18
    c.fillRect(ex - dir.y * s * 0.18 - e / 2, ey - dir.x * s * 0.18 - e / 2, e, e)
    c.fillRect(ex + dir.y * s * 0.18 - e / 2, ey + dir.x * s * 0.18 - e / 2, e, e)
  }, [cell])

  // Largest whole-pixel cell that fits the board area
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setCell(Math.max(8, Math.floor(Math.min((el.clientWidth - PAD) / COLS, (el.clientHeight - PAD) / ROWS)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    if (status !== 'playing') return
    const t = setInterval(() => {
      const g = game.current
      const next = g.queue.shift()
      if (next) g.dir = next
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }
      const eating = head.x === g.food.x && head.y === g.food.y
      const body = eating ? g.snake : g.snake.slice(0, -1)
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some(p => p.x === head.x && p.y === head.y)) {
        const beat = score > best
        if (beat) {
          setBest(score)
          try { localStorage.setItem(BEST_KEY, String(score)) } catch { /* private mode: best lasts this visit */ }
        }
        setNewBest(beat)
        setStatus('over')
        return
      }
      g.snake = [head, ...body]
      if (eating) {
        g.food = placeFood(g.snake)
        setScore(n => n + 1)
      }
      draw()
    }, Math.max(60, 130 - score * 3))
    return () => clearInterval(t)
  }, [status, score, best, draw])

  const app = useRef<HTMLDivElement>(null)
  useEffect(() => { app.current?.focus({ preventScroll: true }) }, [])

  const start = () => {
    game.current = fresh()
    setScore(0)
    setStatus('playing')
    draw()
    app.current?.focus({ preventScroll: true })
  }

  const steer = (d: P) => {
    const g = game.current
    const last = g.queue[g.queue.length - 1] ?? g.dir
    if (d.x === -last.x && d.y === -last.y) return
    if (d.x === last.x && d.y === last.y) return
    if (g.queue.length < 3) g.queue.push(d)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault()
      if (status === 'ready' || status === 'over') start()
      else setStatus(status === 'playing' ? 'paused' : 'playing')
      return
    }
    const d = KEYS[e.code]
    if (!d) return
    e.preventDefault()
    if (status === 'ready') start()
    steer(d)
  }

  const onUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s || (e.target as HTMLElement).closest('button')) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.hypot(dx, dy) < 24) {
      if (status !== 'playing') start()
      return
    }
    steer(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) })
  }

  return (
    <div ref={app} className="snake-app" tabIndex={0} onKeyDown={onKey} aria-label="Snake. Arrow keys or WASD to steer, Space to start or pause.">
      <div className="snake-bar">
        <span>Score <b>{score}</b></span>
        <span>Best <b>{best}</b></span>
        <span className="snake-hint">Arrows or WASD · Space to pause</span>
      </div>
      <div className="snake-wrap" ref={wrap}>
        <div className="snake-board" style={{ width: COLS * cell, height: ROWS * cell }} onPointerDown={e => { swipe.current = { x: e.clientX, y: e.clientY } }} onPointerUp={onUp}>
          <canvas ref={cv} style={{ width: COLS * cell, height: ROWS * cell }} aria-hidden="true" />
          {status !== 'playing' && (
            <div className="snake-overlay" aria-live="polite">
              <b>{status === 'over' ? 'Game over' : status === 'paused' ? 'Paused' : 'Snake'}</b>
              {status === 'over' && <span>Score {score}{newBest ? ' · new best' : ''}</span>}
              {status !== 'paused' && <button type="button" className="snake-go" onClick={start}>{status === 'over' ? 'Play again' : 'Play'}</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
