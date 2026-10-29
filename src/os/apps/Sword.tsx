import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './sword.css'

// [name, hp, body colour]
const BOSSES: [string, number, string][] = [['Baby Slime', 24, '#7FC46A'], ['Zombie', 28, '#4F8A4B'], ['Spider', 32, '#3A3236'], ['Skeleton', 36, '#D8D6CC'], ['Creeper', 40, '#5FB04C'], ['Husk', 44, '#B79B62'], ['Stray', 49, '#D8D6CC'], ['Drowned', 54, '#7D8A8C'], ['Pillager', 59, '#7F7F78'], ['Vindicator', 65, '#A7ACA8'], ['Witch', 72, '#9A6B4A'], ['Enderman', 79, '#1C1820']]
const UPGRADES = { dmg: ['Sharpness', '+1 damage'], auto: ['Auto-swing', '+1 damage per second'], loot: ['Looting', '+1 gold per kill'] } as const
type Upgrade = keyof typeof UPGRADES

type Run = { i: number; hp: number; dmg: number; auto: number; loot: number; gold: number; cost: Record<Upgrade, number>; msg: string; dying: boolean }
type Float = { id: number; text: string; crit: boolean; x: number; y: number }

const START: Run = { i: 0, hp: BOSSES[0][1], dmg: 1, auto: 0, loot: 1, gold: 0, cost: { dmg: 8, auto: 20, loot: 15 }, msg: 'Click the boss to strike. Crits hit twice as hard.', dying: false }

function drawBoss(cv: HTMLCanvasElement, i: number) {
  const [name, , col] = BOSSES[Math.min(i, BOSSES.length - 1)]
  const c = cv.getContext('2d')!
  c.clearRect(0, 0, 144, 144)
  const px = (x: number, y: number, a: number, b: number, f: string) => { c.fillStyle = f; c.fillRect(x * 12, y * 12, a * 12, b * 12) }
  px(2, 2, 8, 8, col); px(2, 2, 8, 1, 'rgba(255,255,255,0.18)'); px(2, 9, 8, 1, 'rgba(0,0,0,0.25)')
  const EYES: Record<string, string> = { Enderman: '#B84DE0', Spider: '#C0242A', Stray: '#8FE3F5', Drowned: '#47C4EC' }
  const illager = name === 'Pillager' || name === 'Vindicator'
  if (illager) {
    px(3, 3, 6, 1, name === 'Vindicator' ? '#111' : '#3B3B36')
    px(3, 4, 2, 1, '#F2F2EC'); px(7, 4, 2, 1, '#F2F2EC'); px(4, 4, 1, 1, '#2F5A3A'); px(7, 4, 1, 1, '#2F5A3A')
  } else {
    const eye = EYES[name] ?? (name === 'Witch' ? '#3B7A3A' : '#111')
    px(3, 4, 2, 2, eye); px(7, 4, 2, 2, eye)
  }
  // Illagers and the witch have a long nose where the mouth would be
  if (illager || name === 'Witch') { px(5, 5, 2, 3, 'rgba(0,0,0,0.22)'); px(4, 8, 4, 1, 'rgba(0,0,0,0.35)') }
  else px(5, 7, 2, 1, '#111')
  if (name === 'Creeper') { px(4, 6, 4, 2, '#111'); px(4, 8, 1, 1, '#111'); px(7, 8, 1, 1, '#111') }
  if (name === 'Spider') { px(0, 5, 2, 1, col); px(10, 5, 2, 1, col); px(0, 7, 2, 1, col); px(10, 7, 2, 1, col) }
  if (name === 'Husk') { px(2, 1, 8, 2, '#E4D58E'); px(3, 0, 6, 1, '#E4D58E'); px(2, 2, 8, 1, 'rgba(120,100,40,0.35)') }
  if (name === 'Stray') { px(1, 1, 10, 2, '#2B6468'); px(3, 0, 6, 1, '#2B6468') }
  if (name === 'Drowned') { const kelp = '#3E8E3E'; px(2, 2, 1, 5, kelp); px(3, 2, 2, 1, kelp); px(9, 2, 1, 3, kelp); px(8, 8, 1, 2, kelp); px(3, 8, 1, 1, kelp) }
  if (name === 'Witch') { px(1, 2, 10, 1, '#4A2E5E'); px(3, 0, 6, 2, '#5B3F73'); px(3, 1, 6, 1, 'rgba(0,0,0,0.18)'); px(6, 7, 1, 1, '#3E8E3E') }
}

export default function Sword() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [g, setG] = useState(START)
  const [floats, setFloats] = useState<Float[]>([])
  const cv = useRef<HTMLCanvasElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const done = g.i >= BOSSES.length
  const max = BOSSES[g.i]?.[1] ?? 1

  useEffect(() => { if (cv.current) drawBoss(cv.current, g.i) }, [g.i])

  // A killed boss plays its death, then the next one steps in
  useEffect(() => {
    if (!g.dying) return
    const t = setTimeout(() => setG(s => ({ ...s, i: s.i + 1, hp: BOSSES[s.i + 1]?.[1] ?? 0, dying: false })), reduce ? 0 : 420)
    return () => clearTimeout(t)
  }, [g.dying, reduce])

  const hit = (amount: number, crit: boolean) => {
    setG(s => {
      if (s.i >= BOSSES.length || s.dying) return s
      const hp = Math.max(0, s.hp - amount)
      if (hp > 0) return { ...s, hp }
      const reward = 4 + s.i * 2 + s.loot
      return { ...s, hp, gold: s.gold + reward, msg: `${BOSSES[s.i][0]} defeated. +${reward} gold.`, dying: true }
    })
    const w = stage.current?.clientWidth ?? 300, h = stage.current?.clientHeight ?? 300
    const f = { id: performance.now() + Math.random(), text: '-' + amount + (crit ? ' crit' : ''), crit, x: w / 2 - 20 + (Math.random() * 60 - 30), y: h / 2 - 40 }
    setFloats(fs => [...fs, f])
  }

  useEffect(() => {
    if (!g.auto) return
    const t = setInterval(() => hit(g.auto, false), 1000)
    return () => clearInterval(t)
  }, [g.auto])

  const buy = (u: Upgrade) => setG(s => {
    if (s.gold < s.cost[u]) return s
    const n = { ...s, gold: s.gold - s.cost[u], cost: { ...s.cost, [u]: Math.ceil(s.cost[u] * 1.6) } }
    if (u === 'dmg') return { ...n, dmg: s.dmg + 1, msg: `Sharpness up. ${s.dmg + 1} damage per hit.` }
    if (u === 'auto') return { ...n, auto: s.auto + 1, msg: `Auto-swing ${s.auto + 1} per second.` }
    return { ...n, loot: s.loot + 1, msg: 'Looting up.' }
  })

  return (
    <div className="sw-app">
      <div className="sw-stage" ref={stage}>
        <div className="sw-name">{done ? 'All 12 cleared' : BOSSES[g.i][0]}</div>
        <div className="sw-bar" role="img" aria-label={`Boss health ${g.hp} of ${max}`}><i style={{ transform: `scaleX(${Math.max(0, g.hp / max)})` }} /></div>
        <div className="sw-hp">{done ? 'Run complete.' : `${g.hp} / ${max} HP`}</div>
        <button type="button" className={`sw-boss${g.dying ? ' dead' : ''}`} aria-label="Strike the boss" onClick={() => { const crit = Math.random() < 0.12; hit(crit ? g.dmg * 2 : g.dmg, crit) }}>
          <canvas ref={cv} width={144} height={144} />
        </button>
        {floats.map(f => (
          <span key={f.id} className={`sw-float${f.crit ? ' crit' : ''}`} style={{ left: f.x, top: f.y }} onAnimationEnd={() => setFloats(fs => fs.filter(x => x.id !== f.id))}>{f.text}</span>
        ))}
      </div>
      <aside className="sw-side">
        <h3>Run</h3>
        <div className="sw-stat"><span>Gold</span><span>{g.gold}</span></div>
        <div className="sw-stat"><span>Bosses</span><span>{Math.min(g.i, BOSSES.length)} / {BOSSES.length}</span></div>
        {(Object.keys(UPGRADES) as Upgrade[]).map(u => (
          <button key={u} type="button" className="sw-up" disabled={g.gold < g.cost[u] || done} onClick={() => buy(u)}>
            <span>{UPGRADES[u][0]}<br /><small style={{ opacity: 0.75 }}>{UPGRADES[u][1]}</small></span>
            <span>{g.cost[u]}g</span>
          </button>
        ))}
        <p className="sw-msg" aria-live="polite">{g.msg}</p>
      </aside>
    </div>
  )
}
