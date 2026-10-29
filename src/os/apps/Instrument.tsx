import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

// [css class, text]; an empty text is a blank line
export type Line = [string, string]
type ReportProps = { title: string; lines: Line[]; links?: [string, string][] }

const linkAttrs = (url: string) => url.startsWith('mailto') ? {} : { target: '_blank', rel: 'noopener' }

function Typed({ title, lines, links = [] }: ReportProps) {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const plain = lines.map(([, t]) => t).join('\n')
  const [typed, setTyped] = useState(reduce ? plain.length : 0)
  const done = typed >= plain.length

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTyped(n => n + 3), 12)
    return () => clearInterval(t)
  }, [done])

  return (
    <div className="scr rep-box">
      <h3>{title}</h3>
      <div className="rep" aria-live="polite">
        {done ? lines.map(([c, t], i) => <div key={i} className={c}>{t || ' '}</div>) : plain.slice(0, typed)}
      </div>
      <div className="rep-links">
        {done && links.map(([l, u]) => <a key={l} href={u} {...linkAttrs(u)}>{l}</a>)}
      </div>
    </div>
  )
}

// A report screen that types itself out again whenever its content changes
export function Report(props: ReportProps) {
  return <Typed key={props.title + JSON.stringify(props.lines)} {...props} />
}

const ANG = [-60, -20, 20, 60]

// Four-position rotary selector: drag it, click a label, or use the arrow keys
export function Knob({ names, sel, onSel, label }: { names: string[]; sel: number; onSel: (i: number) => void; label: string }) {
  const [dragDeg, setDragDeg] = useState<number | null>(null)
  const dragging = useRef(false)
  const set = (i: number) => onSel((i + names.length) % names.length)

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(sel + 1); e.preventDefault() }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(sel - 1); e.preventDefault() }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const r = e.currentTarget.getBoundingClientRect()
    let a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90
    if (a > 180) a -= 360
    const deg = Math.max(-75, Math.min(75, a))
    setDragDeg(deg)
    let best = 0
    ANG.forEach((g, i) => { if (Math.abs(g - deg) < Math.abs(ANG[best] - deg)) best = i })
    if (best !== sel) onSel(best)
  }
  const end = () => { dragging.current = false; setDragDeg(null) }

  return (
    <div className="knob-dial">
      {names.map((n, i) => {
        const a = (ANG[i] - 90) * Math.PI / 180
        return (
          <button
            key={n}
            type="button"
            className={`lbl${i === sel ? ' sel' : ''}`}
            style={{ left: 115 + Math.cos(a) * 56, top: 69 + Math.sin(a) * 56, transform: `translate(${i < 2 ? '-100%' : '0'}, -50%)` }}
            onClick={() => set(i)}
          >
            {n}
          </button>
        )
      })}
      <div
        className={`knob${dragDeg !== null ? ' dragging' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={names.length - 1}
        aria-valuenow={sel}
        aria-valuetext={names[sel]}
        style={{ transform: `rotate(${dragDeg ?? ANG[sel]}deg)` }}
        onKeyDown={onKey}
        onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
      />
    </div>
  )
}
