import { DIMENSIONS } from './mobs'

// Health is counted in half-hearts, like Minecraft: 20 is ten full hearts
export const MAX_HP = 20
// points sets the damage cut; bar is how full Minecraft's armour bar is for that tier (20 = full)
export const ARMOR = [
  { name: 'None', points: 0, bar: 0, cost: 0, col: '' },
  { name: 'Leather', points: 15, bar: 7, cost: 15, col: '#8A5A33' },
  { name: 'Chainmail', points: 30, bar: 12, cost: 30, col: '#9AA3AE' },
  { name: 'Iron', points: 50, bar: 15, cost: 60, col: '#D8D8D8' },
  { name: 'Diamond', points: 90, bar: 20, cost: 150, col: '#5FD8D0' },
  { name: 'Netherite', points: 150, bar: 20, cost: 300, col: '#4A4246' },
]
export const ITEMS = {
  steak: { name: 'Steak', cost: 6 },
  gapple: { name: 'Golden apple', cost: 25 },
  totem: { name: 'Totem of Undying', cost: 50 },
  mace: { name: 'Mace', cost: 120 },
} as const
export type Item = keyof typeof ITEMS
export const MACE_COOLDOWN = 15
// Shared by all food, so stacking steaks can't heal faster than the later mobs hit
export const FOOD_COOLDOWN = 3
const WINDUP = 0.6
const DEATH_ANIM = 0.42

export type Upgrade = 'sharp' | 'auto' | 'loot'
export type Run = {
  v: 2
  dim: number
  i: number
  hp: number
  gold: number
  sharp: number
  auto: number
  loot: number
  cost: Record<Upgrade, number>
  armor: number
  php: number
  absorb: number
  items: { steak: number; gapple: number; totem: number; mace: boolean }
  maceCd: number
  foodCd: number
  swing: number
  autoT: number
  dying: number
  dead: boolean
  done: boolean
  msg: string
}

export type GameEvent =
  | { kind: 'hit'; amount: number; crit: boolean; by: 'click' | 'auto' | 'mace' }
  | { kind: 'hurt'; amount: number }
  | { kind: 'kill' }
  | { kind: 'totem' }
  | { kind: 'died' }
  | { kind: 'dimension' }

type Step = { run: Run; events: GameEvent[] }

export const mobOf = (r: Run) => DIMENSIONS[r.dim]?.mobs[r.i]
export const damage = (r: Run) => 1 + r.sharp
export const winding = (r: Run) => { const m = mobOf(r); return !!m && !r.dying && r.swing > m.every - WINDUP }

export function fresh(): Run {
  return {
    v: 2, dim: 0, i: 0, hp: DIMENSIONS[0].mobs[0].hp, gold: 0, sharp: 0, auto: 0, loot: 0,
    cost: { sharp: 8, auto: 20, loot: 15 }, armor: 0, php: MAX_HP, absorb: 0,
    items: { steak: 0, gapple: 0, totem: 0, mace: false }, maceCd: 0, foodCd: 0, swing: 0, autoT: 0, dying: 0,
    dead: false, done: false, msg: 'Click the mob to strike. It hits back, so watch your hearts.',
  }
}

// Armour divides damage rather than subtracting a percentage, so every tier adds about the same
// number of extra hits you can take and nothing ever makes you immune
const taken = (atk: number, armor: number) => atk * 100 / (100 + ARMOR[armor].points)

function strike(r: Run, amount: number, crit: boolean, by: 'click' | 'auto' | 'mace'): Step {
  const m = mobOf(r)
  if (!m || r.dying || r.dead || r.done) return { run: r, events: [] }
  const hp = Math.max(0, r.hp - amount)
  const events: GameEvent[] = [{ kind: 'hit', amount, crit, by }]
  if (hp > 0) return { run: { ...r, hp }, events }
  const reward = (4 + r.dim * 11 + r.i + r.loot) * (1 + r.dim)
  events.push({ kind: 'kill' })
  return { run: { ...r, hp, gold: r.gold + reward, dying: DEATH_ANIM, msg: `${m.name} defeated. +${reward} gold.` }, events }
}

export function click(r: Run): Step {
  const crit = Math.random() < 0.12
  return strike(r, crit ? damage(r) * 2 : damage(r), crit, 'click')
}

function nextMob(r: Run): Step {
  const dim = DIMENSIONS[r.dim]
  // A little health back between fights
  const healed = { ...r, dying: 0, swing: 0, php: Math.min(MAX_HP, r.php + 2) }
  if (r.i + 1 < dim.mobs.length) return { run: { ...healed, i: r.i + 1, hp: dim.mobs[r.i + 1].hp }, events: [] }
  if (r.dim + 1 < DIMENSIONS.length) {
    const nd = DIMENSIONS[r.dim + 1]
    return { run: { ...healed, dim: r.dim + 1, i: 0, hp: nd.mobs[0].hp, msg: `You enter the ${nd.name}.` }, events: [{ kind: 'dimension' }] }
  }
  return { run: { ...healed, done: true, msg: 'Every dimension cleared.' }, events: [] }
}

function hurt(r: Run, atk: number): Step {
  const dmg = taken(atk, r.armor)
  const fromAbsorb = Math.min(r.absorb, dmg)
  const php = r.php - (dmg - fromAbsorb)
  const run = { ...r, absorb: r.absorb - fromAbsorb, php }
  const events: GameEvent[] = [{ kind: 'hurt', amount: dmg }]
  if (php > 0) return { run, events }
  if (r.items.totem) {
    events.push({ kind: 'totem' })
    return { run: { ...run, php: 2, absorb: 8, items: { ...r.items, totem: 0 }, msg: 'The totem saved you.' }, events }
  }
  events.push({ kind: 'died' })
  return { run: { ...run, php: 0, dead: true }, events }
}

// Advances the fight by dt seconds: mob attacks, auto-swing, the mace cooldown and the death animation
export function tick(r: Run, dt: number): Step {
  if (r.dead || r.done) return { run: r, events: [] }
  let run = { ...r, maceCd: Math.max(0, r.maceCd - dt), foodCd: Math.max(0, r.foodCd - dt) }
  const events: GameEvent[] = []
  if (run.dying) {
    run.dying = Math.max(0, run.dying - dt)
    if (!run.dying) { const n = nextMob(run); run = n.run; events.push(...n.events) }
    return { run, events }
  }
  if (run.auto) {
    run.autoT += dt
    if (run.autoT >= 1) {
      run.autoT -= 1
      const s = strike(run, run.auto, false, 'auto'); run = s.run; events.push(...s.events)
      if (run.dying) return { run, events }
    }
  }
  const m = mobOf(run)
  if (!m) return { run, events }
  run.swing += dt
  if (run.swing >= m.every) {
    run.swing -= m.every
    const h = hurt(run, m.atk); run = h.run; events.push(...h.events)
  }
  return { run, events }
}

// You died: back to the start of this dimension with your gear, half your gold dropped
export function respawn(r: Run): Run {
  const dim = DIMENSIONS[r.dim]
  return { ...r, dead: false, i: 0, hp: dim.mobs[0].hp, gold: Math.floor(r.gold / 2), php: MAX_HP, absorb: 0, swing: 0, autoT: 0, dying: 0, maceCd: 0, foodCd: 0, msg: `You dropped ${Math.ceil(r.gold / 2)} gold.` }
}

export function buyUpgrade(r: Run, u: Upgrade): Run {
  if (r.gold < r.cost[u]) return r
  const n = { ...r, gold: r.gold - r.cost[u], cost: { ...r.cost, [u]: Math.ceil(r.cost[u] * 1.6) } }
  if (u === 'sharp') return { ...n, sharp: r.sharp + 1, msg: `Sharpness ${r.sharp + 1}. ${damage(n) + 1} damage per hit.` }
  if (u === 'auto') return { ...n, auto: r.auto + 1, msg: `Auto-swing ${r.auto + 1} per second.` }
  return { ...n, loot: r.loot + 1, msg: `Looting ${r.loot + 1}.` }
}

export function buyArmor(r: Run): Run {
  const next = ARMOR[r.armor + 1]
  if (!next || r.gold < next.cost) return r
  return { ...r, gold: r.gold - next.cost, armor: r.armor + 1, msg: `${next.name} armour on.` }
}

export const canBuy = (r: Run, it: Item) => r.gold >= ITEMS[it].cost && !(it === 'totem' && r.items.totem) && !(it === 'mace' && r.items.mace)

export function buyItem(r: Run, it: Item): Run {
  if (!canBuy(r, it)) return r
  const items = { ...r.items }
  if (it === 'mace') items.mace = true
  else items[it] += 1
  return { ...r, gold: r.gold - ITEMS[it].cost, items }
}

export function consume(r: Run, it: Item): Step {
  if (r.dead || r.done) return { run: r, events: [] }
  if (it === 'mace') {
    if (!r.items.mace || r.maceCd > 0) return { run: r, events: [] }
    // A smash takes a third of the mob's health plus a heavy hit, so it matters even when you can't spam it
    const smash = Math.round((mobOf(r)?.hp ?? 0) / 3) + damage(r) * 4
    return strike({ ...r, maceCd: MACE_COOLDOWN }, smash, true, 'mace')
  }
  if (!r.items[it] || it === 'totem' || r.foodCd > 0) return { run: r, events: [] }
  const items = { ...r.items, [it]: r.items[it] - 1 }
  if (it === 'steak') return { run: { ...r, items, foodCd: FOOD_COOLDOWN, php: Math.min(MAX_HP, r.php + 6) }, events: [] }
  // Absorption refreshes to its cap rather than stacking
  return { run: { ...r, items, foodCd: FOOD_COOLDOWN, php: Math.min(MAX_HP, r.php + 4), absorb: Math.max(r.absorb, 4) }, events: [] }
}

const KEY = 'daevikos:bossrush'
export function load(): Run {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (s?.v === 2) return { ...fresh(), ...s, dying: 0 }
  } catch { /* no saved run */ }
  return fresh()
}
export function save(r: Run) {
  try { localStorage.setItem(KEY, JSON.stringify(r)) } catch { /* private mode: the run lasts this visit */ }
}
