import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { APPS, DOCK } from './apps'
import { WALLS } from './content'
import { MUG_SIPS, useDesktopState } from './desktop-state'
import DesktopItems from './DesktopItems'
import { Icon } from './icons'
import MenuStatus from './MenuStatus'
import { OsContext, type OsApi } from './os-context'
import Wallpaper from './Wallpaper'
import Window, { type Rect, type Win } from './Window'
import './os.css'

export default function Os() {
  const [state, setState] = useDesktopState()
  const [wins, setWins] = useState<Win[]>([])
  const [desk, setDesk] = useState({ w: 0, h: 0 })
  const [sips, setSips] = useState(0)
  const [blink, setBlink] = useState(0)
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null)
  const deskRef = useRef<HTMLElement>(null)
  const zTop = useRef(100)
  const mobile = useMediaQuery('(max-width: 820px)')
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')

  useLayoutEffect(() => {
    const el = deskRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDesk({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const wallColor = WALLS[state.wall]?.[1] ?? WALLS[0][1]
  useEffect(() => { document.body.style.backgroundColor = wallColor }, [wallColor])

  const open = useCallback((id: string, arg?: unknown) => {
    const app = APPS[id]
    if (!app) return
    const z = ++zTop.current
    setWins(ws => {
      const live = ws.find(w => w.id === id && !w.closing)
      if (live) {
        return ws.map(w => w !== live ? w : { ...w, z, min: false, arg: arg ?? w.arg, argKey: arg === undefined ? w.argKey : w.argKey + 1 })
      }
      const el = deskRef.current
      const W = el?.clientWidth ?? 1200, H = el?.clientHeight ?? 800, n = ws.length
      const w = Math.min(app.w, W - 40), h = Math.min(app.h, H - 110)
      const rect = { x: Math.max(16, Math.round((W - w) / 2 - 110 + n * 28)), y: Math.max(12, Math.round((H - h) / 2 - 46 + n * 24)), w, h }
      return [...ws.filter(x => x.id !== id), { id, z, rect, min: false, max: false, closing: false, arg, argKey: 0 }]
    })
  }, [])

  const patch = (id: string, fn: (w: Win) => Partial<Win>) => setWins(ws => ws.map(w => w.id === id ? { ...w, ...fn(w) } : w))
  const close = (id: string) => {
    patch(id, () => ({ closing: true }))
    setTimeout(() => setWins(ws => ws.filter(w => !(w.id === id && w.closing))), reduce ? 0 : 140)
  }
  const focus = (id: string) => {
    const top = wins.reduce((m, w) => Math.max(m, w.z), 0)
    const w = wins.find(x => x.id === id)
    if (w && w.z !== top) patch(id, () => ({ z: ++zTop.current }))
  }

  const visible = wins.filter(w => !w.min && !w.closing)
  const top = visible.reduce<Win | null>((m, w) => (!m || w.z > m.z ? w : m), null)

  const sip = useCallback(() => {
    if (state.trashed.includes('mug')) return null
    const next = Math.min(MUG_SIPS, sips + 1)
    setSips(next)
    if (next === MUG_SIPS) {
      setBlink(b => b + 1)
      setTimeout(() => setSips(0), 480)
    }
    return MUG_SIPS - next
  }, [sips, state.trashed])

  const api: OsApi = useMemo(() => ({
    open,
    sip,
    appIds: Object.keys(APPS).filter(k => !APPS[k].hidden),
    wall: state.wall,
    trashed: state.trashed,
    setWall: i => setState(s => ({ ...s, wall: i })),
    newNote: () => setState(s => ({ ...s, notes: [...s.notes, { id: Date.now(), text: 'New note. Click to type.' }] })),
    resetDesk: () => setState(s => ({ ...s, pos: {}, trashed: [] })),
    restore: id => setState(s => {
      const pos = { ...s.pos }
      delete pos[id]
      return { ...s, pos, trashed: s.trashed.filter(x => x !== id) }
    }),
  }), [open, sip, state.wall, state.trashed, setState])

  useEffect(() => {
    if (!ctx) return
    const off = (e: Event) => { if (!(e.target as HTMLElement).closest('#ctx')) setCtx(null) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setCtx(null) }
    document.addEventListener('pointerdown', off)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc) }
  }, [ctx])

  const onContext = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.win, .item, #dock')) return
    e.preventDefault()
    const r = deskRef.current!.getBoundingClientRect()
    setCtx({ x: Math.min(e.clientX - r.left, r.width - 230), y: Math.min(e.clientY - r.top, r.height - 200) })
  }

  // Pinned apps, then anything open that has no pinned slot (games, Trash) so it can always be brought back
  const pinned = DOCK.map(g => g.filter(id => APPS[id] && !APPS[id].hidden))
  const extra = wins.filter(w => !w.closing && !pinned.flat().includes(w.id)).map(w => w.id)
  const dockGroups = extra.length ? [...pinned, extra] : pinned

  const onDock = (id: string) => {
    const w = wins.find(x => x.id === id && !x.closing)
    if (w && !w.min && w === top) patch(id, () => ({ min: true }))
    else open(id)
  }

  return (
    <OsContext.Provider value={api}>
      <div id="os" style={{ '--wall': wallColor } as CSSProperties}>
        <header id="menubar">
          <div className="left">
            <button className="mb brand" type="button" onClick={() => open('settings')}>DaevikOS</button>
            <span id="active-app">{top ? APPS[top.id].title : 'Desktop'}</span>
          </div>
          <nav className="right" aria-label="Quick links">
            <button className="mb cta" type="button" onClick={() => open('resume')}>Résumé</button>
            <a className="mb hide-sm" href="https://github.com/DJFiya" target="_blank" rel="noopener">GitHub</a>
            <a className="mb hide-sm" href="https://linkedin.com/in/daevik-jain" target="_blank" rel="noopener">LinkedIn</a>
            <MenuStatus />
          </nav>
        </header>
        <main id="desk" ref={deskRef} aria-label="Desktop" onContextMenu={onContext}>
          <Wallpaper />
          <div id="wallname">
            <h1>Daevik Jain</h1>
            <p>BME / SE @ University of Waterloo | 3x Hackathon Winner / Finalist</p>
          </div>
          {desk.w > 0 && (
            <DesktopItems state={state} setState={setState} desk={desk} mobile={mobile} sips={sips} onSip={sip} onOpen={open} />
          )}
          <div id="wins">
            {wins.map(w => (
              <Window
                key={w.id}
                win={w}
                def={APPS[w.id]}
                focused={w === top}
                mobile={mobile}
                desk={desk}
                onFocus={() => focus(w.id)}
                onClose={() => close(w.id)}
                onMin={() => patch(w.id, () => ({ min: true }))}
                onToggleMax={() => { if (!mobile) patch(w.id, x => ({ max: !x.max })) }}
                onRect={(rect: Rect) => patch(w.id, () => ({ rect }))}
              />
            ))}
          </div>
          <nav id="dock" aria-label="Apps">
            {dockGroups.map((group, gi) => [
              gi > 0 && <span key={`sep${gi}`} className="dk-sep" aria-hidden="true" />,
              ...group.map(id => {
                const running = wins.some(w => w.id === id && !w.closing), active = top?.id === id
                return (
                  <button key={id} type="button" className={['dk', running && 'running', active && 'active'].filter(Boolean).join(' ')} aria-label={APPS[id].title} aria-current={active || undefined} onClick={() => onDock(id)}>
                    <Icon name={APPS[id].icon} size={26} />
                    <span className="tip" aria-hidden="true">{APPS[id].title}</span>
                  </button>
                )
              }),
            ])}
          </nav>
          {ctx && (
            <div id="ctx" className="on" role="menu" aria-label="Desktop menu" style={{ left: ctx.x, top: ctx.y }}>
              <button type="button" role="menuitem" autoFocus onClick={() => { api.newNote(); setCtx(null) }}>New sticky note</button>
              <button type="button" role="menuitem" onClick={() => { open('terminal'); setCtx(null) }}>Open Terminal</button>
              <button type="button" role="menuitem" onClick={() => { api.resetDesk(); setCtx(null) }}>Clean up desktop</button>
              <p className="lbl">Wallpaper</p>
              <div className="swatches">
                {WALLS.map(([n, c], i) => (
                  <button key={n} type="button" className="sw" role="menuitem" aria-label={`${n} wallpaper`} style={{ background: c }} onClick={() => { api.setWall(i); setCtx(null) }} />
                ))}
              </div>
            </div>
          )}
          {blink > 0 && <div id="blink" key={blink} className="on" aria-hidden="true" onAnimationEnd={() => setBlink(0)}><i className="t" /><i className="b" /></div>}
        </main>
      </div>
    </OsContext.Provider>
  )
}
