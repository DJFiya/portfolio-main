import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import type { AppProps } from '../../os-context'
import {
  ARMOR, BOOM_CHARGE, CAGE_HP, MAX_LEVEL, PERKS, boltDamage, choosePerk, startGold, reloadTime, FOOD_COOLDOWN, ITEMS, MACE_COOLDOWN, MAX_HP, buyArmor, buyItem, buyUpgrade, canBuy, charging, click,
  consume, fresh, hitCrystal, load, mobOf, respawn, save, shielded, tick, winding, type GameEvent, type Item, type Run, type Upgrade,
} from './game'
import { DIMENSIONS, drawMob } from './mobs'
import { Bolt, Chestplate, Crossbow, Crystal, Flame, Heart, ItemIcon, Sweep } from './Pixel'
import './boss-rush.css'

type Float = { id: number; text: string; cls: string; x: number }
type Step = { run: Run; events: GameEvent[] }

const UPGRADES: [Upgrade, string, string][] = [
  ['sharp', 'Sharpness', '+1 damage per click'], ['sweep', 'Sweeping Edge', 'every third click sweeps'],
  ['fire', 'Fire Aspect', 'sets mobs on fire'], ['loot', 'Looting', 'more gold per kill'],
]
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const HOTBAR: Item[] = ['steak', 'gapple', 'totem', 'mace']
// Where the Dragon's crystals stand, as percentages of the fight area
const PILLARS = [[8, 12], [8, 34], [8, 56], [22, 60], [78, 60], [92, 56], [92, 34], [92, 12]]

export default function BossRush({ active }: AppProps) {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [run, setRun] = useState(load)
  const latest = useRef(run)
  const [floats, setFloats] = useState<Float[]>([])
  const [hurtKey, setHurtKey] = useState(0)
  const [totemKey, setTotemKey] = useState(0)
  const [crackKey, setCrackKey] = useState(0)
  const [bolts, setBolts] = useState<{ id: number; bounce: boolean; x: number }[]>([])
  const [sweepKey, setSweepKey] = useState(0)
  const [blasts, setBlasts] = useState<{ id: number; k: number }[]>([])
  const [banner, setBanner] = useState<{ key: number; text: string } | null>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const app = useRef<HTMLDivElement>(null)
  const mob = mobOf(run)

  const addFloat = (text: string, cls: string) => {
    const w = stage.current?.clientWidth ?? 400
    setFloats(fs => [...fs.slice(-12), { id: performance.now() + Math.random(), text, cls, x: w / 2 - 20 + (Math.random() * 80 - 40) }])
  }

  const onEvent = (e: GameEvent, r: Run) => {
    if (e.kind === 'hit') addFloat(`-${e.amount}${e.crit && e.by === 'click' ? '!' : ''}`, e.by === 'click' && e.crit ? 'crit' : e.by)
    if (e.kind === 'shot') {
      const xs = r.perks.includes('multishot') ? [-14, 14] : [0]
      setBolts(bs => [...bs.slice(-6), ...xs.map(x => ({ id: performance.now() + Math.random(), bounce: shielded(r), x }))])
    }
    if (e.kind === 'sweep') setSweepKey(k => k + 1)
    if (e.kind === 'crystal') setBlasts(bs => [...bs.slice(-4), { id: performance.now() + Math.random(), k: e.k }])
    if (e.kind === 'heal') addFloat(`+${e.amount}`, 'heal')
    if (e.kind === 'boom') setCrackKey(k => k + 1)
    if (e.kind === 'boss') setBanner(b => ({ key: (b?.key ?? 0) + 1, text: DIMENSIONS[r.dim].boss.name }))
    if (e.kind === 'hurt') setHurtKey(k => k + 1)
    if (e.kind === 'totem') setTotemKey(k => k + 1)
    if (e.kind === 'dimension') setBanner(b => ({ key: (b?.key ?? 0) + 1, text: DIMENSIONS[r.dim].name }))
  }

  // Every change goes through here so the timer, clicks and keys never act on a stale run
  const apply = (fn: (r: Run) => Step | Run) => {
    const out = fn(latest.current)
    const step = 'events' in out ? out : { run: out, events: [] }
    latest.current = step.run
    setRun(step.run)
    step.events.forEach(e => onEvent(e, step.run))
  }

  useEffect(() => { save(run) }, [run])
  const armored = shielded(run)
  useEffect(() => {
    const canvas = cv.current
    if (!canvas || !mob) return
    if (!armored) { drawMob(canvas, mob); return }
    let phase = 0
    drawMob(canvas, mob, phase)
    const t = setInterval(() => drawMob(canvas, mob, ++phase), 160)
    return () => clearInterval(t)
  }, [mob, armored])
  useEffect(() => { if (active) app.current?.focus({ preventScroll: true }) }, [active])

  // The fight only runs while this window is in front
  const running = active && !run.dead && !run.done && !run.choosing
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const t = setInterval(() => {
      const now = performance.now(), dt = Math.min(0.25, (now - last) / 1000)
      last = now
      apply(r => tick(r, dt))
    }, 100)
    return () => clearInterval(t)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e: KeyboardEvent) => {
    const n = Number(e.key)
    // Slot 1 is the crossbow, which fires on its own; the items follow from slot 2
    if (n >= 2 && n <= HOTBAR.length + 1) { apply(r => consume(r, HOTBAR[n - 2])); e.preventDefault() }
  }

  const dim = run.dim, max = mob?.hp ?? 1
  const full = Math.ceil(run.php), gold = Math.ceil(run.absorb)
  const charge = mob ? Math.min(1, run.swing / mob.every) : 0

  return (
    <div ref={app} className="br-app" tabIndex={-1} onKeyDown={onKey}>
      <div ref={stage} className={`br-stage dim-${dim}${mob?.boss ? ` boss-${mob.boss}` : ''}`}>
        {mob?.boss === 'warden' && <div className="br-darkness" aria-hidden="true" />}
        {mob?.boss === 'dragon' && (
          <>
            <svg className="br-beams" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {run.crystals.map((c, k) => c >= 0 && <line key={k} x1={PILLARS[k][0]} y1={PILLARS[k][1] + 6} x2="50" y2="40" />)}
            </svg>
            {run.crystals.map((c, k) => c >= 0 && (
              <button key={k} type="button" className="br-crystal" style={{ left: `${PILLARS[k][0]}%`, top: `${PILLARS[k][1]}%` }} aria-label={c > 0 ? 'Break the cage' : 'Destroy the crystal'} onClick={() => apply(r => hitCrystal(r, k))} disabled={!running}>
                <Crystal caged={c > 0} />
                {c > 0 && <span className="br-cage-bar"><i style={{ transform: `scaleX(${c / CAGE_HP})` }} /></span>}
              </button>
            ))}
            {blasts.map(b => <span key={b.id} className="br-blast" style={{ left: `${PILLARS[b.k][0]}%`, top: `${PILLARS[b.k][1]}%` }} onAnimationEnd={() => setBlasts(bs => bs.filter(x => x.id !== b.id))} aria-hidden="true" />)}
          </>
        )}
        <div className="br-top">
          <div className={`br-name${mob?.boss ? ' boss' : ''}`}>{run.done ? 'Every dimension cleared' : mob?.name}</div>
          <div className="br-bar" role="img" aria-label={`Mob health ${run.hp} of ${max}`}><i style={{ transform: `scaleX(${Math.max(0, run.hp / max)})` }} /></div>
          <div className="br-hp">{run.done ? 'Run complete.' : `${Math.ceil(run.hp)} / ${max}`}</div>
        </div>

        <button type="button" className={['br-mob', mob?.boss && 'boss', run.dying && 'dead', winding(run) && 'winding'].filter(Boolean).join(' ')} aria-label={`Strike the ${mob?.name ?? 'mob'}`} onClick={() => apply(click)} disabled={!running}>
          <canvas ref={cv} width={144} height={144} />
          {run.burn > 0 && !run.dying && <span className="br-flames" aria-hidden="true"><Flame frame={0} /><Flame frame={1} /><Flame frame={0} /></span>}
          {sweepKey > 0 && <span key={sweepKey} className="br-sweep" aria-hidden="true"><Sweep /></span>}
          {bolts.map(b => <span key={b.id} className={`br-bolt${b.bounce ? ' bounce' : ''}`} style={{ translate: `${b.x}px 0` }} onAnimationEnd={() => setBolts(bs => bs.filter(x => x.id !== b.id))}><Bolt /></span>)}
          {charging(run) && <span className="br-ring" style={{ animationDuration: `${BOOM_CHARGE}s` }} aria-hidden="true" />}
          <span className="br-charge" aria-hidden="true"><i style={{ transform: `scaleX(${run.dying ? 0 : charge})` }} /></span>
        </button>
        {floats.map(f => <span key={f.id} className={`br-float ${f.cls}`} style={{ left: f.x }} onAnimationEnd={() => setFloats(fs => fs.filter(x => x.id !== f.id))}>{f.text}</span>)}

        <div className="br-hud">
          <div className="br-status">
            {run.armor > 0 && (
              <span key={crackKey} className={`br-armor${crackKey ? ' cracked' : ''}`} aria-label={`${ARMOR[run.armor].name} armour`}>
                {Array.from({ length: 10 }, (_, k) => { const b = ARMOR[run.armor].bar; return <Chestplate key={k} col={ARMOR[run.armor].col} fill={b >= k * 2 + 2 ? 2 : b === k * 2 + 1 ? 1 : 0} /> })}
              </span>
            )}
            <span className="br-hearts" aria-label={`${(run.php / 2).toFixed(1)} of 10 hearts${gold ? `, ${gold / 2} extra` : ''}`}>
              {Array.from({ length: MAX_HP / 2 }, (_, k) => <Heart key={k} fill={full >= k * 2 + 2 ? 2 : full === k * 2 + 1 ? 1 : 0} />)}
              {Array.from({ length: Math.ceil(gold / 2) }, (_, k) => <Heart key={`g${k}`} gold fill={gold >= k * 2 + 2 ? 2 : 1} />)}
            </span>
          </div>
          <div className="br-hotbar">
            <span className={`br-slot${run.xbow ? ' passive' : ' empty'}`} title={run.xbow ? `Crossbow: ${boltDamage(run)} damage every ${reloadTime(run.xbow).toFixed(1)}s` : 'Crossbow'}>
              <Crossbow size={34} />
              {run.xbow > 0 && <span className="br-reload"><i style={{ transform: `scaleX(${Math.min(1, run.reload / reloadTime(run.xbow))})` }} /></span>}
            </span>
            {HOTBAR.map((it, k) => {
              const have = it === 'mace' ? run.items.mace : run.items[it] > 0
              const cd = it === 'mace' ? run.maceCd / MACE_COOLDOWN : it === 'steak' || it === 'gapple' ? run.foodCd / FOOD_COOLDOWN : 0
              return (
                <button key={it} type="button" className={`br-slot${have ? '' : ' empty'}${it === 'totem' && have ? ' passive' : ''}`} aria-label={`${ITEMS[it].name}${it === 'mace' || it === 'totem' ? '' : `, ${run.items[it]} left`} (key ${k + 2})`} onClick={() => apply(r => consume(r, it))} disabled={!have || !running}>
                  <ItemIcon item={it} size={34} />
                  {it !== 'mace' && it !== 'totem' && run.items[it] > 0 && <b>{run.items[it]}</b>}
                  {cd > 0 && <span className="br-cd" style={{ '--cd': cd } as CSSProperties} />}
                </button>
              )
            })}
          </div>
        </div>

        {hurtKey > 0 && <div key={`h${hurtKey}`} className={`br-hurt${reduce ? '' : ' shake'}`} aria-hidden="true" />}
        {totemKey > 0 && <div key={`t${totemKey}`} className="br-totem" aria-hidden="true"><ItemIcon item="totem" size={120} /></div>}
        {banner && <div key={banner.key} className="br-banner" onAnimationEnd={() => setBanner(null)}>{banner.text}</div>}
        {!active && !run.dead && <div className="br-paused">Paused</div>}
        {run.choosing && (
          <div className="br-dead br-choose">
            <b>Choose a reward</b>
            {PERKS[run.dim - 1].map(p => (
              <button key={p.id} type="button" onClick={() => apply(r => choosePerk(r, p.id))}>{p.name}<small>{p.what}</small></button>
            ))}
          </div>
        )}
        {run.done && (
          <div className="br-dead br-won">
            <b>The End</b>
            <span>Time {clock(run.time)}{run.time <= run.best ? ', a new best' : ''}</span>
            <span>Best {clock(run.best)} · Runs cleared: {run.wins}</span>
            <button type="button" onClick={() => apply(r => fresh(r.wins, r.best))}>Play again</button>
            <span>Starting gold: {startGold(run.wins)}</span>
          </div>
        )}
        {run.dead && (
          <div className="br-dead">
            <b>You died!</b>
            <span>Gold: {run.gold}</span>
            <button type="button" onClick={() => apply(respawn)}>Respawn</button>
          </div>
        )}
      </div>

      <aside className="br-shop">
        <div className="br-gold"><span>Gold</span><b>{run.gold}</b></div>
        <h3>Sword</h3>
        {UPGRADES.map(([u, name, what]) => {
          const maxed = run[u] >= (MAX_LEVEL[u] ?? Infinity)
          return (
            <button key={u} type="button" className="br-buy" disabled={run.gold < run.cost[u] || run.done || maxed} onClick={() => apply(r => buyUpgrade(r, u))}>
              <span>{name} {run[u] > 0 && <em>{run[u]}</em>}<small>{what}</small></span><span>{maxed ? 'Max' : `${run.cost[u]}g`}</span>
            </button>
          )
        })}
        <h3>Armour</h3>
        {ARMOR[run.armor + 1] ? (
          <button type="button" className="br-buy" disabled={run.gold < ARMOR[run.armor + 1].cost} onClick={() => apply(buyArmor)}>
            <span className="br-buy-icon"><Chestplate col={ARMOR[run.armor + 1].col} fill={2} />{ARMOR[run.armor + 1].name}</span><span>{ARMOR[run.armor + 1].cost}g</span>
          </button>
        ) : (
          <button type="button" className="br-buy worn" disabled>
            <span className="br-buy-icon"><Chestplate col={ARMOR[run.armor].col} fill={2} />{ARMOR[run.armor].name}</span><span>Worn</span>
          </button>
        )}
        <h3>Items</h3>
        {/* The crossbow is bought once; after that its row sells Quick Charge levels */}
        <button type="button" className="br-buy" disabled={run.gold < run.cost.xbow || run.done} onClick={() => apply(r => buyUpgrade(r, 'xbow'))}>
          <span className="br-buy-icon"><Crossbow size={18} /><span>{run.xbow ? <>Quick Charge {run.xbow > 1 && <em>{run.xbow - 1}</em>}<small>reloads faster</small></> : 'Crossbow'}</span></span><span>{run.cost.xbow}g</span>
        </button>
        {HOTBAR.map(it => (
          <button key={it} type="button" className="br-buy" disabled={!canBuy(run, it)} onClick={() => apply(r => buyItem(r, it))}>
            <span className="br-buy-icon"><ItemIcon item={it} size={18} />{ITEMS[it].name}</span><span>{it === 'mace' && run.items.mace ? 'Owned' : `${ITEMS[it].cost}g`}</span>
          </button>
        ))}
        <p className="br-msg" aria-live="polite">{run.msg}</p>
        <div className="br-foot">
          <button type="button" className="br-new" onClick={() => apply(r => fresh(r.wins, r.best))}>New run</button>
          {run.best > 0 && <span>Best {clock(run.best)}</span>}
        </div>
      </aside>
    </div>
  )
}
