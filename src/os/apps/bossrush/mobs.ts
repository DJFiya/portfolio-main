// Mobs by dimension. Each dimension opens on a gentler mob, so a player sent back after dying
// can always win a fight and earn gold before the harder ones.
// hp is health, atk is damage per hit in half-hearts, every is seconds between hits.
export type Mob = { name: string; hp: number; atk: number; every: number; col: string }

export const DIMENSIONS: { name: string; mobs: Mob[] }[] = [
  {
    name: 'Overworld',
    mobs: [
      { name: 'Slime', hp: 30, atk: 1, every: 3, col: '#7FC46A' },
      { name: 'Zombie', hp: 40, atk: 2, every: 3.2, col: '#4F8A4B' },
      { name: 'Spider', hp: 48, atk: 2, every: 2.6, col: '#3A3236' },
      { name: 'Skeleton', hp: 56, atk: 2, every: 2.8, col: '#D8D6CC' },
      { name: 'Creeper', hp: 64, atk: 6, every: 5, col: '#5FB04C' },
      { name: 'Husk', hp: 74, atk: 3, every: 3, col: '#6E8F4E' },
      { name: 'Stray', hp: 84, atk: 3, every: 2.8, col: '#D8D6CC' },
      { name: 'Drowned', hp: 96, atk: 4, every: 3, col: '#7D8A8C' },
      { name: 'Pillager', hp: 108, atk: 4, every: 2.8, col: '#7F7F78' },
      { name: 'Vindicator', hp: 122, atk: 5, every: 3, col: '#A7ACA8' },
      { name: 'Witch', hp: 138, atk: 4, every: 2.4, col: '#9A6B4A' },
    ],
  },
  {
    name: 'Nether',
    mobs: [
      { name: 'Magma Cube', hp: 140, atk: 3, every: 3, col: '#6A2A1C' },
      { name: 'Blaze', hp: 230, atk: 5, every: 2.6, col: '#E9B83A' },
      { name: 'Ghast', hp: 210, atk: 9, every: 4.5, col: '#EDEDE8' },
      { name: 'Hoglin', hp: 280, atk: 7, every: 3, col: '#A8705A' },
      { name: 'Wither Skeleton', hp: 320, atk: 8, every: 2.8, col: '#2E2E2E' },
      { name: 'Piglin Brute', hp: 380, atk: 9, every: 3, col: '#E3A08A' },
    ],
  },
  {
    name: 'End',
    mobs: [
      { name: 'Endermite', hp: 240, atk: 3, every: 2, col: '#4A3A55' },
      { name: 'Enderman', hp: 460, atk: 10, every: 3, col: '#1C1820' },
      { name: 'Shulker', hp: 540, atk: 9, every: 3.2, col: '#8E6AA0' },
    ],
  },
]

// 8×8 faces on a 12-unit grid (12px per unit on a 144px canvas), with room above for hats
export function drawMob(cv: HTMLCanvasElement, mob: Mob) {
  const { name, col } = mob
  const c = cv.getContext('2d')!
  c.clearRect(0, 0, 144, 144)
  const px = (x: number, y: number, a: number, b: number, f: string) => { c.fillStyle = f; c.fillRect(x * 12, y * 12, a * 12, b * 12) }
  const shade = 'rgba(0,0,0,0.25)', light = 'rgba(255,255,255,0.18)'

  if (name === 'Shulker') {
    px(1, 2, 10, 4, col); px(1, 6, 10, 4, '#7A5A8C'); px(1, 2, 10, 1, light)
    px(3, 5, 6, 3, '#E8D8A8'); px(4, 6, 1, 1, '#1A1D22'); px(7, 6, 1, 1, '#1A1D22')
    px(1, 5, 10, 1, '#5E4470')
    return
  }
  if (name === 'Ghast') {
    px(2, 1, 8, 8, col); px(2, 1, 8, 1, '#FFFFFF')
    px(3, 4, 2, 1, '#8A8A86'); px(7, 4, 2, 1, '#8A8A86'); px(3, 5, 1, 2, '#B23A3A'); px(8, 5, 1, 2, '#B23A3A')
    px(5, 6, 2, 1, '#5A5A58')
    for (const x of [2.5, 4.5, 6.5, 8.5]) px(x, 9, 1, 2 + (x % 2), col)
    return
  }
  if (name === 'Endermite') {
    px(2, 4, 8, 5, col); px(2, 4, 8, 1, light); px(4, 4, 1, 5, '#3A2C44'); px(7, 4, 1, 5, '#3A2C44')
    px(1, 9, 1, 1, col); px(10, 9, 1, 1, col); px(2, 6, 1, 1, '#1A1D22'); px(9, 6, 1, 1, '#1A1D22')
    return
  }

  px(2, 2, 8, 8, col); px(2, 2, 8, 1, light); px(2, 9, 8, 1, shade)
  const EYES: Record<string, string> = { Enderman: '#B84DE0', Spider: '#C0242A', Stray: '#8FE3F5', Drowned: '#47C4EC', Blaze: '#5A3A0A', 'Wither Skeleton': '#111', Hoglin: '#2A1A14', 'Piglin Brute': '#F2F2EC' }
  const illager = name === 'Pillager' || name === 'Vindicator'
  const snout = name === 'Hoglin' || name === 'Piglin Brute'

  if (illager) {
    px(3, 3, 6, 1, name === 'Vindicator' ? '#111' : '#3B3B36')
    px(3, 4, 2, 1, '#F2F2EC'); px(7, 4, 2, 1, '#F2F2EC'); px(4, 4, 1, 1, '#2F5A3A'); px(7, 4, 1, 1, '#2F5A3A')
  } else if (name === 'Magma Cube') {
    // A slime in mahogany, with orange eyes and red centres
    px(3, 4, 2, 2, '#F2B02E'); px(7, 4, 2, 2, '#F2B02E'); px(4, 4, 1, 1, '#E2401C'); px(7, 4, 1, 1, '#E2401C')
  } else {
    const eye = EYES[name] ?? (name === 'Witch' ? '#3B7A3A' : '#111')
    px(3, 4, 2, snout ? 1 : 2, eye); px(7, 4, 2, snout ? 1 : 2, eye)
    if (name === 'Piglin Brute') { px(4, 4, 1, 1, '#2A1A14'); px(7, 4, 1, 1, '#2A1A14') }
  }

  // Long noses where the mouth would be; snouts with tusks on the Nether beasts
  if (illager || name === 'Witch') { px(5, 5, 2, 3, 'rgba(0,0,0,0.22)'); px(4, 8, 4, 1, 'rgba(0,0,0,0.35)') }
  else if (snout) {
    const s = name === 'Hoglin' ? '#D9A38A' : '#D98A70'
    px(3, 6, 6, 3, s); px(4, 7, 1, 1, '#5A2E24'); px(7, 7, 1, 1, '#5A2E24')
    px(2, 6, 1, 2, '#F2EDE0'); px(9, 6, 1, 2, '#F2EDE0')
  }
  else px(5, 7, 2, 1, '#111')

  if (name === 'Creeper') { px(4, 6, 4, 2, '#111'); px(4, 8, 1, 1, '#111'); px(7, 8, 1, 1, '#111') }
  if (name === 'Spider') { px(0, 5, 2, 1, col); px(10, 5, 2, 1, col); px(0, 7, 2, 1, col); px(10, 7, 2, 1, col) }
  if (name === 'Husk') { px(2, 2, 8, 2, '#E4D58E'); px(2, 3, 8, 1, 'rgba(120,100,40,0.3)') }
  if (name === 'Stray') { px(2, 2, 8, 2, '#2B6468'); px(2, 3, 8, 1, 'rgba(0,0,0,0.2)') }
  if (name === 'Drowned') { const kelp = '#3E8E3E'; px(2, 2, 1, 5, kelp); px(3, 2, 2, 1, kelp); px(9, 2, 1, 3, kelp); px(8, 8, 1, 2, kelp); px(3, 8, 1, 1, kelp) }
  if (name === 'Witch') { px(1, 2, 10, 1, '#4A2E5E'); px(3, 0, 6, 2, '#5B3F73'); px(3, 1, 6, 1, 'rgba(0,0,0,0.18)'); px(6, 7, 1, 1, '#3E8E3E') }
  if (name === 'Blaze') { const rod = '#F28A2E'; px(0, 3, 1, 3, rod); px(11, 3, 1, 3, rod); px(1, 10, 1, 2, rod); px(10, 10, 1, 2, rod); px(5.5, 10, 1, 2, rod) }
  if (name === 'Wither Skeleton') { px(2, 2, 8, 1, '#3E3E3E'); px(4, 7, 4, 1, '#111') }
}
