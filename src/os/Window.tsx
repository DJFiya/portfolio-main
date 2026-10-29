import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { CloseGlyph, Icon, MaxGlyph, MinGlyph } from './icons'
import type { AppDef } from './os-context'

export type Rect = { x: number; y: number; w: number; h: number }
export type Win = {
  id: string
  z: number
  rect: Rect
  min: boolean
  max: boolean
  closing: boolean
  arg?: unknown
  argKey: number
}

type Props = {
  win: Win
  def: AppDef
  focused: boolean
  mobile: boolean
  desk: { w: number; h: number }
  onFocus: () => void
  onClose: () => void
  onMin: () => void
  onToggleMax: () => void
  onRect: (rect: Rect) => void
}

const MAXED: CSSProperties = { left: 8, top: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 96px)' }

export default function Window({ win, def, focused, mobile, desk, onFocus, onClose, onMin, onToggleMax, onRect }: Props) {
  const drag = useRef<{ x: number; y: number; rect: Rect } | null>(null)
  const size = useRef<{ x: number; y: number; rect: Rect } | null>(null)
  const family = def.family ?? 'light'
  const dark = family !== 'light' && family !== 'doc'
  const { rect } = win

  const startDrag = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, a') || mobile || win.max) return
    drag.current = { x: e.clientX, y: e.clientY, rect }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    onRect({
      ...d.rect,
      x: Math.max(-d.rect.w + 120, Math.min(desk.w - 120, d.rect.x + e.clientX - d.x)),
      y: Math.max(0, Math.min(desk.h - 60, d.rect.y + e.clientY - d.y)),
    })
  }
  const startSize = (e: PointerEvent<HTMLElement>) => {
    size.current = { x: e.clientX, y: e.clientY, rect }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.stopPropagation()
  }
  const moveSize = (e: PointerEvent) => {
    const s = size.current
    if (!s) return
    onRect({ ...s.rect, w: Math.max(320, s.rect.w + e.clientX - s.x), h: Math.max(220, s.rect.h + e.clientY - s.y) })
  }

  const style: CSSProperties = win.max ? { ...MAXED, zIndex: win.z } : { left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: win.z }
  const cls = ['win', `f-${family}`, dark && 'f-dark', win.min && 'min', win.closing && 'closing', !focused && 'unfocused'].filter(Boolean).join(' ')

  return (
    <section className={cls} role="dialog" aria-label={def.title} style={style} onPointerDownCapture={onFocus}>
      <header
        className="wtitle"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
        onDoubleClick={e => { if (!(e.target as HTMLElement).closest('button, a')) onToggleMax() }}
      >
        <h2><Icon name={def.icon} size={16} color={dark ? '#ECEDEE' : '#15191A'} stroke={1.8} />{def.title}</h2>
        <div className="wtools">{def.tools}</div>
        <div className="wctl">
          <button type="button" aria-label={`Minimize ${def.title}`} onClick={onMin}><MinGlyph /></button>
          <button type="button" aria-label={`Maximize ${def.title}`} onClick={onToggleMax}><MaxGlyph /></button>
          <button type="button" className="x" aria-label={`Close ${def.title}`} onClick={onClose}><CloseGlyph /></button>
        </div>
      </header>
      <div className="wbody">
        <def.Component arg={win.arg} argKey={win.argKey} active={focused && !win.min && !win.closing} />
      </div>
      <div
        className="wresize"
        aria-hidden="true"
        onPointerDown={startSize}
        onPointerMove={moveSize}
        onPointerUp={() => { size.current = null }}
        onPointerCancel={() => { size.current = null }}
      />
    </section>
  )
}
