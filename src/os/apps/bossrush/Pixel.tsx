// Small pixel sprites for the HUD, drawn from character maps so they share Boss Rush's look
const PAL: Record<string, string> = {
  r: '#D9332B', R: '#FF8A80', e: '#3B1E1A', y: '#F2C94C', Y: '#FFF2A8', o: '#E8C14A', G: '#3E8E3E', l: '#5FB04C',
  n: '#6B3A22', N: '#A0582E', w: '#E8C9A8', d: '#5A5E66', D: '#8E959B', b: '#8A6A44', s: '#6B4428',
}

function Sprite({ map, size, tint }: { map: string[]; size: number; tint?: string }) {
  const w = map[0].length, h = map.length
  return (
    <svg width={size * w / h} height={size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {map.flatMap((row, y) => [...row].map((ch, x) => {
        const f = ch === 'c' ? tint : PAL[ch]
        return f ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={f} /> : null
      }))}
    </svg>
  )
}

const HEART = ['.cc.cc.', 'cRcccc.', 'ccccccc', '.ccccc.', '..ccc..', '...c...'].map(r => r.padEnd(7, '.'))
const HALF = HEART.map(r => r.slice(0, 4).padEnd(7, '.'))

// A heart is full, half or empty; yellow hearts are absorption from golden apples and totems
export function Heart({ fill, gold }: { fill: 0 | 1 | 2; gold?: boolean }) {
  const col = gold ? '#F2C94C' : '#D9332B'
  return (
    <span className="br-heart">
      <Sprite map={HEART.map(r => r.replace(/R/g, 'c'))} size={14} tint={gold ? '#6B5418' : '#3B1E1A'} />
      {fill > 0 && <span className="br-heart-fill"><Sprite map={fill === 2 ? HEART : HALF} size={14} tint={col} /></span>}
    </span>
  )
}

const CHEST = ['cc...cc', 'ccc.ccc', 'ccccccc', '.ccccc.', '.ccccc.', '.ccccc.']
export const Chestplate = ({ col }: { col: string }) => <Sprite map={CHEST} size={16} tint={col} />

const ICONS: Record<string, string[]> = {
  steak: ['..nnnn..', '.nNNNNn.', 'nNNNNNNn', 'nNNwwNNn', 'nNNNNNNn', '.nNNNNn.', '..nnnn..', '........'],
  gapple: ['...s....', '...sl...', '.yyyyyy.', 'yYyyyyyy', 'yYyyyyyy', 'yyyyyyyy', '.yyyyyy.', '..yyyy..'],
  totem: ['..oooo..', '..oGGo..', '..oooo..', 'oooooooo', '..oooo..', '..oooo..', '..o..o..', '..o..o..'],
  mace: ['....ddd.', '...dDDDd', '...dDDDd', '....ddd.', '...b....', '..b.....', '.b......', 'b.......'],
}
export const ItemIcon = ({ item, size = 28 }: { item: string; size?: number }) => <Sprite map={ICONS[item]} size={size} />
