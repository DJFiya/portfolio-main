// Small pixel sprites for the HUD, drawn from character maps so they share Boss Rush's look
const PAL: Record<string, string> = {
  r: '#D9332B', R: '#FF8A80', e: '#3B1E1A', y: '#F2C94C', Y: '#FFF2A8', l: '#5FB04C', s: '#6B4428',
  k: '#2B2118', N: '#7A4422', n: '#5A2E16', w: '#A86A3E',
  o: '#F2C94C', O: '#B8862A', G: '#3EAE5E',
  D: '#9AA0A8', d: '#5E646C', b: '#B8D0DE', B: '#7F9AAC',
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

// Items on Minecraft's 16×16 grid; the golden apple is drawn at 8×8 and doubled
const double = (rows: string[]) => rows.flatMap(r => { const d = [...r].map(c => c + c).join(''); return [d, d] })
const ICONS: Record<string, string[]> = {
  steak: [
    '................', '................', '................', '....kkkkkk......', '..kkwwwwwwkkk...', '.kwNNNNNNNNNwk..',
    '.kNNnNNNNnNNNNk.', 'kNNNNNNnNNNNNNk.', 'kNnNNNNNNNNnNNNk', 'kNNNNnNNNNNNNNk.', '.kNNNNNNNnNNNk..', '..kkNNNNNNNkk...',
    '....kkkkkkk.....', '................', '................', '................',
  ],
  gapple: double(['...s....', '...sl...', '.yyyyyy.', 'yYyyyyyy', 'yYyyyyyy', 'yyyyyyyy', '.yyyyyy.', '..yyyy..']),
  totem: [
    '......kkkk......', '.....kooook.....', '.....kGooGk.....', '.....kooook.....', '......kOOk......', '.kkkkkooookkkkk.',
    'kooooooooooooook', 'kOOOOooOOooOOOOk', '.kkkkkooookkkkk.', '.....koOOok.....', '.....kooook.....', '.....kOooOk.....',
    '......koOk......', '......kkkk......', '................', '................',
  ],
  mace: [
    '.........kkkkkk.', '........kDDDDDDk', '........kDdDDdDk', '........kDDDDDDk', '........kDdDDdDk', '........kDDDDDDk',
    '.........kkbkkk.', '.........kbk....', '........kbk.....', '.......kBk......', '......kbk.......', '.....kbk........',
    '....kBk.........', '...kbk..........', '..kbk...........', '...k............',
  ],
}
export const ItemIcon = ({ item, size = 28 }: { item: string; size?: number }) => <Sprite map={ICONS[item]} size={size} />
