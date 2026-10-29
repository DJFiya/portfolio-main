import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { CloseGlyph, Icon } from './icons'
import { defaultPos, ITEMS, MUG_SIPS, type DesktopState, type Point } from './desktop-state'

const overlaps = (a: DOMRect, b: DOMRect) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)

type DragProps = {
  id: string
  pos: Point
  z: number
  trashable: boolean
  desk: { w: number; h: number }
  disabled: boolean
  trashEl: () => HTMLElement | null
  setHot: (hot: boolean) => void
  onDrop: (pos: Point) => void
  onTrash: () => void
  onClick?: () => void
  // Notes drag by this grip bar only, so their text stays editable
  grip?: ReactNode
  label?: string
  delay?: number
  children: ReactNode
}

function Draggable({ id, pos, z, trashable, desk, disabled, trashEl, setHot, onDrop, onTrash, onClick, grip, label, delay = 0, children }: DragProps) {
  const el = useRef<HTMLElement | null>(null)
  const start = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  // Latest drag position; pointerup can land before React re-renders the move
  const moved = useRef<Point | null>(null)
  const justDragged = useRef(false)
  const [live, setLive] = useState<Point | null>(null)
  const at = live ?? { x: Math.min(pos.x, desk.w - 60), y: Math.min(pos.y, desk.h - 60) }

  // Hit-test at the given desk position, or where the item is drawn now
  const overTrash = (p?: Point) => {
    const t = trashEl()
    if (!trashable || !t || !el.current) return false
    const r = el.current.getBoundingClientRect()
    const box = p ? new DOMRect(r.x + p.x - parseFloat(el.current.style.left), r.y + p.y - parseFloat(el.current.style.top), r.width, r.height) : r
    return overlaps(box, t.getBoundingClientRect())
  }

  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || disabled) return
    if (grip && (e.target as HTMLElement).closest('button')) return
    start.current = { x: e.clientX, y: e.clientY, ox: at.x, oy: at.y }
    moved.current = null
    justDragged.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent<HTMLElement>) => {
    const s = start.current
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (!moved.current && Math.hypot(dx, dy) < 4) return
    moved.current = { x: Math.max(0, Math.min(desk.w - 60, s.ox + dx)), y: Math.max(0, Math.min(desk.h - 60, s.oy + dy)) }
    setLive(moved.current)
    setHot(overTrash(moved.current))
  }
  const up = () => {
    if (!start.current) return
    start.current = null
    setHot(false)
    const p = moved.current
    if (!p) return
    justDragged.current = true
    if (overTrash(p)) onTrash()
    else onDrop(p)
    setLive(null)
  }
  const cancel = () => { start.current = null; setLive(null); setHot(false) }

  const style = { left: at.x, top: at.y, zIndex: z, animationDelay: `${delay}ms` }
  const cls = ['item', 'entering', live && 'dragging'].filter(Boolean).join(' ')
  if (grip) {
    return (
      <div ref={n => { el.current = n }} className={cls} data-id={id} style={style}>
        <div className="sticky">
          <div className="grip" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}>{grip}</div>
          {children}
        </div>
      </div>
    )
  }
  return (
    <button
      ref={n => { el.current = n }}
      type="button"
      className={cls}
      data-id={id}
      aria-label={label}
      style={style}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={cancel}
      onClick={() => { if (!justDragged.current) onClick?.() }}
    >
      {children}
    </button>
  )
}

// Drawn as a regular desktop icon; the coffee level drops with each sip
function Mug({ sips }: { sips: number }) {
  const left = MUG_SIPS - sips
  return (
    <span className="icon">
      <span className="tile">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <defs><clipPath id="mugclip"><path d="M4.5 8h11v8.5a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5z" /></clipPath></defs>
          <rect x="4.5" y={9 + (sips / MUG_SIPS) * 11} width="11" height="12" fill="#B07A4E" clipPath="url(#mugclip)" />
          <path d="M4.5 8h11v8.5a3.5 3.5 0 0 1-3.5 3.5H8a3.5 3.5 0 0 1-3.5-3.5zM15.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5" stroke="#F1F5F2" strokeWidth="1.6" strokeLinejoin="round" />
          {left > 0 && <path className="steam" d="M8 5.5c0-1 1-1.2 1-2.2M11.5 5.5c0-1 1-1.2 1-2.2" stroke="#F1F5F2" strokeWidth="1.4" strokeLinecap="round" />}
        </svg>
      </span>
      {left > 0 ? `${left} sip${left === 1 ? '' : 's'} left` : 'Refilling…'}
    </span>
  )
}

// contentEditable stays uncontrolled so typing never resets the caret
function NoteText({ text, onChange }: { text: string; onChange: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.textContent = text }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={ref} className="text" contentEditable suppressContentEditableWarning spellCheck={false} aria-label="Sticky note" onInput={e => onChange(e.currentTarget.textContent ?? '')} />
}

type Props = {
  state: DesktopState
  setState: (fn: (s: DesktopState) => DesktopState) => void
  desk: { w: number; h: number }
  mobile: boolean
  sips: number
  onSip: () => void
  onOpen: (app: string) => void
}

export default function DesktopItems({ state, setState, desk, mobile, sips, onSip, onOpen }: Props) {
  const trashRef = useRef<HTMLElement | null>(null)
  const [hot, setHot] = useState(false)
  const trashEl = () => trashRef.current

  const drop = (id: string) => (p: Point) => setState(s => ({ ...s, pos: { ...s.pos, [id]: p } }))
  const trash = (id: string) => () => setState(s => ({ ...s, trashed: [...s.trashed, id] }))
  const common = { desk, disabled: mobile, trashEl, setHot }

  return (
    <div id="items">
      {ITEMS.filter(it => !state.trashed.includes(it.id)).map((it, i) => (
        <Draggable
          key={it.id}
          id={it.id}
          pos={state.pos[it.id] ?? defaultPos(it.id, desk.w, desk.h)}
          z={10}
          delay={i * 40}
          trashable={it.trashable}
          label={it.id === 'mug' ? 'Sip the coffee' : it.label}
          onDrop={drop(it.id)}
          onTrash={trash(it.id)}
          onClick={it.id === 'mug' ? onSip : () => it.app && onOpen(it.app)}
          {...common}
        >
          {it.icon ? (
            <span
              ref={it.id === 'trash' ? (n => { trashRef.current = n }) : undefined}
              className={['icon', it.doc && 'doc', it.id === 'trash' && 'trash', it.id === 'trash' && hot && 'hot'].filter(Boolean).join(' ')}
            >
              <span className="tile"><Icon name={it.icon} color={it.doc ? '#15191A' : '#F1F5F2'} /></span>
              {it.label}
            </span>
          ) : <Mug sips={sips} />}
        </Draggable>
      ))}
      {state.notes.map((n, i) => {
        const id = `note${n.id}`
        const base = defaultPos('note', desk.w, desk.h)
        return (
          <Draggable
            key={id}
            id={id}
            pos={state.pos[id] ?? { x: base.x + i * 24, y: base.y + i * 24 }}
            z={12}
            trashable={false}
            grip={<button type="button" aria-label="Delete note" onClick={() => setState(s => ({ ...s, notes: s.notes.filter(x => x.id !== n.id) }))}><CloseGlyph /></button>}
            onDrop={drop(id)}
            onTrash={() => {}}
            {...common}
          >
            <NoteText text={n.text} onChange={text => setState(s => ({ ...s, notes: s.notes.map(x => x.id === n.id ? { ...x, text } : x) }))} />
          </Draggable>
        )
      })}
    </div>
  )
}
