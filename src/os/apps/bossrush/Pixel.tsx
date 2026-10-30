// Small pixel sprites for the HUD, drawn from character maps so they share Boss Rush's look
const PAL: Record<string, string> = {
  r: '#D9332B', R: '#FF8A80', e: '#3B1E1A', y: '#F2C94C', Y: '#FFF2A8', l: '#5FB04C', s: '#6B4428',
  k: '#2B2118', N: '#7A4422', n: '#5A2E16', w: '#A86A3E',
  o: '#F2C94C', O: '#B8862A', G: '#3EAE5E',
}

function Sprite({ map, size, tint, pal = PAL }: { map: string[]; size: number; tint?: string; pal?: Record<string, string> }) {
  const w = map[0].length, h = map.length
  return (
    <svg width={size * w / h} height={size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {map.flatMap((row, y) => [...row].map((ch, x) => {
        const f = ch === 'c' && tint ? tint : pal[ch]
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
const CHEST_HALF = CHEST.map(r => r.slice(0, 4).padEnd(7, '.'))
// One point of Minecraft's armour bar: full, half, or an empty outline
export function Chestplate({ col, fill }: { col: string; fill: 0 | 1 | 2 }) {
  return (
    <span className="br-heart">
      <Sprite map={CHEST} size={14} tint="#2A2A2E" />
      {fill > 0 && <span className="br-heart-fill"><Sprite map={fill === 2 ? CHEST : CHEST_HALF} size={14} tint={col} /></span>}
    </span>
  )
}

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
}
// The Mace keeps Minecraft's inventory sprite shape, flattened to a few colours like the other items
const MACE = [
  '.........kk.....', '........kLLk.kk.', '.......kLSLLkSk.', '......kLSSMLLk..',
  '.....kLSSMLLSSk.', '.....kSMMMLSSSSk', '......kSMLSSSSSk', '.......kSSSSSSk.',
  '......HHkSSSSk..', '.....HHD.kSSk...', '....HHD...kk....', '...HHD..........',
  '..HHD...........', 'kkHD............', 'kSk.............', 'kkk.............',
]
const MACE_PAL: Record<string, string> = { k: '#2A2E33', L: '#AEB6C2', M: '#7C8491', S: '#565C68', H: '#7F8CC4', D: '#3A4A78' }
export const ItemIcon = ({ item, size = 28 }: { item: string; size?: number }) =>
  item === 'mace' ? <Sprite map={MACE} size={size} pal={MACE_PAL} /> : <Sprite map={ICONS[item]} size={size} />

// End crystal, and the iron cage around it on the Dragon's pillars
const CRYSTAL = ['....pp....', '...pPPp...', '..pPWPPp..', '.pPPPPPPp.', 'pPPPPPPPPp', '.pPPPPPPp.', '..pPPPPp..', '...pPPp...', '....pp....', '..bbbbbb..']
const CAGE = ['gggggggggg', 'gG.G..G.Gg', 'g.G..G.G.g', 'gG.G..G.Gg', 'g.G..G.G.g', 'gggggggggg', 'gG.G..G.Gg', 'g.G..G.G.g', 'gG.G..G.Gg', 'gggggggggg']
const CRYSTAL_PAL: Record<string, string> = { p: '#9E4A9A', P: '#E68AD8', W: '#FFFFFF', b: '#2A2430', g: '#BFC4C9', G: '#7D8288' }
export function Crystal({ caged }: { caged: boolean }) {
  return (
    <span className="br-crystal-art">
      <Sprite map={CRYSTAL} size={34} pal={CRYSTAL_PAL} />
      {caged && <span className="br-heart-fill"><Sprite map={CAGE} size={34} pal={CRYSTAL_PAL} /></span>}
    </span>
  )
}

// Crossbow seen front-on: limbs and string across the top, stock running down; and its bolt
const XBOW = [
  '................', '................', '.kkkk......kkkk.', 'kWWWWkkkkkkWWWWk', 'kwk..kWWWWk..kwk', '.s.k..kWWk..k.s.',
  '..s.k.kWWk.k.s..', '...s.kkggkk.s...', '....sskggkss....', '......kWWk......', '......kWWk......', '......kwwk......',
  '......kWWk......', '......kwwk......', '.......kk.......', '................',
]
const BOLT = ['.g.', 'ggg', '.w.', '.w.', '.w.', '.w.', '.w.', '.w.', 'fwf', 'f.f']
const XBOW_PAL: Record<string, string> = { k: '#2B2118', W: '#9C6A3C', w: '#6E4826', g: '#9AA0A8', s: '#D9D4C7', f: '#EDEAE2' }
export const Crossbow = ({ size = 30 }: { size?: number }) => <Sprite map={XBOW} size={size} pal={XBOW_PAL} />
export const Bolt = () => <Sprite map={BOLT} size={30} pal={XBOW_PAL} />
