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
// Warden: a sonic boom every BOOM_EVERY seconds that ignores armour, visibly charging for BOOM_CHARGE
export const BOOM_EVERY = 9
export const BOOM_CHARGE = 1.6
const BOOM_ATK = 6
// Ender Dragon: each standing crystal heals it every second until its cage is broken and it is tapped.
// A destroyed crystal explodes, hurting the Dragon badly and you a little.
export const CRYSTALS = 8
export const CAGE_HP = 30
const DRAGON_HEAL = 6
const BLAST_DRAGON = 110
const BLAST_PLAYER = 1.5
// Crossbow: fires a bolt on its own every reload; each Quick Charge level reloads 20% faster
export const reloadTime = (level: number) => 2.4 * Math.pow(0.8, Math.max(0, level - 1))
// A bolt hits for twice your click damage, so the crossbow's share of your damage only grows with Quick Charge
export const boltDamage = (r: Run) => 2 * damage(r) * (r.perks.includes('multishot') ? 2 : 1)
// Sweeping Edge (up to III): every third click sweeps, landing one extra hit per level.
// Fire Aspect (up to II): a click sets the mob burning for a few seconds; fireproof mobs ignore it.
export const MAX_LEVEL: Partial<Record<Upgrade, number>> = { sweep: 3, fire: 2 }
const BURN_TIME = 4
export const fireDamage = (r: { dim: number; fire: number }) => 2 * r.fire * (1 + r.dim)
// After the Warden and the Wither you keep one of two perks
export type Perk = 'keen' | 'heavy' | 'fortune' | 'multishot'
export const PERKS: { id: Perk; name: string; what: string }[][] = [
  [{ id: 'keen', name: 'Keen', what: 'Crits twice as often' }, { id: 'heavy', name: 'Heavy', what: 'Crits hit three times as hard' }],
  [{ id: 'fortune', name: 'Fortune', what: 'Half again as much gold' }, { id: 'multishot', name: 'Multishot', what: 'The crossbow fires two bolts' }],
]
// Each cleared run starts the next with more gold, up to five clears
const CLEAR_GOLD = 30
export const startGold = (wins: number) => CLEAR_GOLD * Math.min(5, wins)
const DEATH_ANIM = 0.42

export type Upgrade = 'sharp' | 'xbow' | 'loot' | 'sweep' | 'fire'
export type Run = {
  v: 3
  dim: number
  i: number
  hp: number
  gold: number
  sharp: number
  // 0 = no crossbow; 1 = crossbow; each level above is a Quick Charge level
  xbow: number
  loot: number
  sweep: number
  fire: number
  // Clicks since the last sweep, and how long the mob has left to burn
  combo: number
  burn: number
  flame: number
  perks: Perk[]
  choosing: boolean
  // Runs cleared, kept across new runs
  wins: number
  cost: Record<Upgrade, number>
  armor: number
  php: number
  absorb: number
  items: { steak: number; gapple: number; totem: number; mace: boolean }
  maceCd: number
  foodCd: number
  swing: number
  reload: number
  dying: number
  // Boss timer: the Warden's boom charge, or the Dragon's heal tick
  sp: number
  // Dragon crystals: cage health while caged, 0 once exposed, -1 once destroyed
  crystals: number[]
  dead: boolean
  done: boolean
  msg: string
}

export type GameEvent =
  | { kind: 'hit'; amount: number; crit: boolean; by: Source }
  | { kind: 'hurt'; amount: number }
  | { kind: 'kill' }
  | { kind: 'totem' }
  | { kind: 'died' }
  | { kind: 'dimension' }
  | { kind: 'boss' }
  | { kind: 'boom' }
  | { kind: 'heal'; amount: number }
  | { kind: 'crystal'; k: number }
  | { kind: 'shot' }
  | { kind: 'sweep' }

type Source = 'click' | 'bolt' | 'mace' | 'blast' | 'sweep' | 'fire'

type Step = { run: Run; events: GameEvent[] }

export const mobOf = (r: Run) => { const d = DIMENSIONS[r.dim]; return d && (r.i < d.mobs.length ? d.mobs[r.i] : d.boss) }
// The Wither shrugs off bolts once it is below half health, like the real one does arrows
export const shielded = (r: Run) => { const m = mobOf(r); return m?.boss === 'wither' && r.hp <= m.hp / 2 }
export const charging = (r: Run) => mobOf(r)?.boss === 'warden' && !r.dying && r.sp > BOOM_EVERY - BOOM_CHARGE
export const damage = (r: Run) => 1 + r.sharp
export const winding = (r: Run) => { const m = mobOf(r); return !!m && !r.dying && r.swing > m.every - WINDUP }

export function fresh(wins = 0): Run {
  return {
    v: 3, dim: 0, i: 0, hp: DIMENSIONS[0].mobs[0].hp, gold: startGold(wins), sharp: 0, xbow: 0, loot: 0, sweep: 0, fire: 0,
    combo: 0, burn: 0, flame: 0, perks: [], choosing: false, wins,
    cost: { sharp: 8, xbow: 12, loot: 15, sweep: 60, fire: 80 }, armor: 0, php: MAX_HP, absorb: 0,
    items: { steak: 0, gapple: 0, totem: 0, mace: false }, maceCd: 0, foodCd: 0, swing: 0, reload: 0, dying: 0,
    sp: 0, crystals: [], dead: false, done: false, msg: 'Click the mob to strike. It hits back, so watch your hearts.',
  }
}

// Armour divides damage rather than subtracting a percentage, so every tier adds about the same
// number of extra hits you can take and nothing ever makes you immune
const taken = (atk: number, armor: number) => atk * 100 / (100 + ARMOR[armor].points)
// The sonic boom goes straight through armour

function strike(r: Run, amount: number, crit: boolean, by: Source): Step {
  const m = mobOf(r)
  if (!m || r.dying || r.dead || r.done || r.choosing) return { run: r, events: [] }
  if (by === 'bolt' && shielded(r)) return { run: r, events: [] }
  const hp = Math.max(0, r.hp - amount)
  const events: GameEvent[] = [{ kind: 'hit', amount, crit, by }]
  if (hp > 0) return { run: { ...r, hp }, events }
  const base = m.boss ? 50 * (1 + r.dim) : (4 + r.dim * 11 + r.i + r.loot) * (1 + r.dim)
  const reward = r.perks.includes('fortune') ? Math.round(base * 1.5) : base
  events.push({ kind: 'kill' })
  return { run: { ...r, hp, gold: r.gold + reward, dying: DEATH_ANIM, msg: `${m.name} defeated. +${reward} gold.` }, events }
}

export function click(r: Run): Step {
  const m = mobOf(r)
  if (!m || r.dying || r.dead || r.done || r.choosing) return { run: r, events: [] }
  const crit = Math.random() < (r.perks.includes('keen') ? 0.24 : 0.12)
  const combo = r.sweep ? (r.combo + 1) % 3 : 0
  const burn = r.fire && !m.fireproof ? BURN_TIME : r.burn
  const s = strike({ ...r, combo, burn }, crit ? damage(r) * (r.perks.includes('heavy') ? 3 : 2) : damage(r), crit, 'click')
  if (!r.sweep || combo || s.run.dying) return s
  const w = strike(s.run, damage(r) * r.sweep, false, 'sweep')
  return { run: w.run, events: [...s.events, { kind: 'sweep' }, ...w.events] }
}

function nextMob(r: Run): Step {
  const dim = DIMENSIONS[r.dim]
  // A little health back between fights
  const healed = { ...r, dying: 0, swing: 0, burn: 0, flame: 0, combo: 0, php: Math.min(MAX_HP, r.php + 2) }
  if (r.i + 1 < dim.mobs.length) return { run: { ...healed, i: r.i + 1, hp: dim.mobs[r.i + 1].hp }, events: [] }
  if (r.i + 1 === dim.mobs.length) {
    const b = dim.boss
    return { run: { ...healed, i: r.i + 1, hp: b.hp, sp: 0, crystals: b.boss === 'dragon' ? Array(CRYSTALS).fill(CAGE_HP) : [], msg: `The ${b.name} appears.` }, events: [{ kind: 'boss' }] }
  }
  if (r.dim + 1 < DIMENSIONS.length) {
    const nd = DIMENSIONS[r.dim + 1]
    // The dimension banner waits until a perk is chosen
    return { run: { ...healed, dim: r.dim + 1, i: 0, hp: nd.mobs[0].hp, choosing: true, msg: `You enter the ${nd.name}.` }, events: [] }
  }
  return { run: { ...healed, done: true, wins: r.wins + 1, msg: 'Every dimension cleared.' }, events: [] }
}

function hurt(r: Run, atk: number, pierce = false): Step {
  const dmg = pierce ? atk : taken(atk, r.armor)
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

// Advances the fight by dt seconds: mob attacks, crossbow bolts, cooldowns and the death animation
export function tick(r: Run, dt: number): Step {
  if (r.dead || r.done || r.choosing) return { run: r, events: [] }
  let run = { ...r, maceCd: Math.max(0, r.maceCd - dt), foodCd: Math.max(0, r.foodCd - dt) }
  const events: GameEvent[] = []
  if (run.dying) {
    run.dying = Math.max(0, run.dying - dt)
    if (!run.dying) { const n = nextMob(run); run = n.run; events.push(...n.events) }
    return { run, events }
  }
  if (run.xbow) {
    run.reload += dt
    if (run.reload >= reloadTime(run.xbow)) {
      run.reload = 0
      events.push({ kind: 'shot' })
      const s = strike(run, boltDamage(run), false, 'bolt'); run = s.run; events.push(...s.events)
      if (run.dying) return { run, events }
    }
  }
  if (run.burn) {
    run.burn = Math.max(0, run.burn - dt)
    run.flame = run.burn ? run.flame + dt : 0
    if (run.flame >= 1) {
      run.flame -= 1
      const s = strike(run, fireDamage(run), false, 'fire'); run = s.run; events.push(...s.events)
      if (run.dying) return { run, events }
    }
  }
  const m = mobOf(run)
  if (!m) return { run, events }
  run.swing += dt
  if (run.swing >= m.every) {
    run.swing -= m.every
    const h = hurt(run, m.atk); run = h.run; events.push(...h.events)
    if (run.dead) return { run, events }
  }
  if (m.boss === 'warden') {
    run.sp += dt
    if (run.sp >= BOOM_EVERY) {
      run.sp = 0
      events.push({ kind: 'boom' })
      const h = hurt(run, BOOM_ATK, true); run = h.run; events.push(...h.events)
    }
  }
  if (m.boss === 'dragon') {
    const standing = run.crystals.filter(c => c >= 0).length
    if (standing) {
      run.hp = Math.min(m.hp, run.hp + DRAGON_HEAL * standing * dt)
      run.sp += dt
      if (run.sp >= 1) { run.sp -= 1; events.push({ kind: 'heal', amount: DRAGON_HEAL * standing }) }
    }
  }
  return { run, events }
}

// Clicking a crystal hacks at its cage; once the cage breaks, one tap destroys the crystal
export function hitCrystal(r: Run, k: number): Step {
  if (mobOf(r)?.boss !== 'dragon' || r.dying || r.dead) return { run: r, events: [] }
  const c = r.crystals[k]
  if (c === undefined || c < 0) return { run: r, events: [] }
  const crystals = [...r.crystals]
  if (c > 0) { crystals[k] = Math.max(0, c - damage(r)); return { run: { ...r, crystals }, events: [] } }
  crystals[k] = -1
  const blast = strike({ ...r, crystals }, BLAST_DRAGON, false, 'blast')
  const h = hurt(blast.run, BLAST_PLAYER)
  return { run: h.run, events: [{ kind: 'crystal', k }, ...blast.events, ...h.events] }
}

// You died: back to the start of this dimension with your gear, half your gold dropped
export function respawn(r: Run): Run {
  const dim = DIMENSIONS[r.dim]
  return { ...r, dead: false, i: 0, hp: dim.mobs[0].hp, gold: Math.floor(r.gold / 2), php: MAX_HP, absorb: 0, swing: 0, reload: 0, dying: 0, maceCd: 0, foodCd: 0, sp: 0, crystals: [], burn: 0, flame: 0, combo: 0, msg: `You dropped ${Math.ceil(r.gold / 2)} gold.` }
}

export function buyUpgrade(r: Run, u: Upgrade): Run {
  if (r.gold < r.cost[u] || r[u] >= (MAX_LEVEL[u] ?? Infinity)) return r
  const n = { ...r, gold: r.gold - r.cost[u], cost: { ...r.cost, [u]: Math.ceil(r.cost[u] * (u === 'xbow' ? 1.3 : 1.6)) } }
  if (u === 'sharp') return { ...n, sharp: r.sharp + 1, msg: `Sharpness ${r.sharp + 1}. ${damage(n) + 1} damage per hit.` }
  if (u === 'xbow') return { ...n, xbow: r.xbow + 1, msg: r.xbow ? `Quick Charge ${r.xbow}. The crossbow reloads faster.` : 'Crossbow loaded. It fires on its own.' }
  if (u === 'sweep') return { ...n, sweep: r.sweep + 1, msg: `Sweeping Edge ${r.sweep + 1}.` }
  if (u === 'fire') return { ...n, fire: r.fire + 1, msg: `Fire Aspect ${r.fire + 1}.` }
  return { ...n, loot: r.loot + 1, msg: `Looting ${r.loot + 1}.` }
}

// Multishot hands you a crossbow if you don't have one yet
export function choosePerk(r: Run, p: Perk): Step {
  if (!r.choosing) return { run: r, events: [] }
  const run = { ...r, choosing: false, perks: [...r.perks, p] }
  if (p === 'multishot' && !r.xbow) { run.xbow = 1; run.cost = { ...r.cost, xbow: Math.ceil(r.cost.xbow * 1.3) } }
  return { run, events: [{ kind: 'dimension' }] }
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
  if (r.dead || r.done || r.choosing) return { run: r, events: [] }
  if (it === 'mace') {
    if (!r.items.mace || r.maceCd > 0) return { run: r, events: [] }
    // A smash takes a third of a mob's health (a tenth of a boss's) plus a heavy hit, so it matters even when you can't spam it
    const m = mobOf(r)
    const smash = Math.round((m?.hp ?? 0) * (m?.boss ? 0.1 : 1 / 3)) + damage(r) * 4
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
    // Saves from before a price was added keep their prices and gain the new ones
    if (s?.v === 3) { const f = fresh(); return { ...f, ...s, cost: { ...f.cost, ...s.cost }, dying: 0 } }
  } catch { /* no saved run */ }
  return fresh()
}
export function save(r: Run) {
  try { localStorage.setItem(KEY, JSON.stringify(r)) } catch { /* private mode: the run lasts this visit */ }
}
