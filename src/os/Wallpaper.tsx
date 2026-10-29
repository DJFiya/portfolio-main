// Low-poly ridges: each peak is a lit and a shaded triangle
const FAR: [number, number, number][] = [[-80, 300, 220], [180, 230, 260], [420, 290, 230], [640, 210, 280], [900, 270, 240], [1130, 220, 270], [1380, 280, 240]]
const NEAR: [number, number, number][] = [[-40, 360, 300], [300, 320, 320], [660, 380, 280], [980, 330, 310], [1320, 370, 300]]

function Ridge({ peaks, base, cls }: { peaks: [number, number, number][]; base: number; cls: string }) {
  return (
    <g className={cls}>
      {peaks.map(([x, top, half]) => (
        <g key={x}>
          <polygon className="lit" points={`${x - half},${base} ${x},${top} ${x + half * 0.15},${base}`} />
          <polygon className="shade" points={`${x + half * 0.15},${base} ${x},${top} ${x + half},${base}`} />
        </g>
      ))}
    </g>
  )
}

// [top %, scale, seconds per crossing, start offset]
const CLOUDS: [number, number, number, number][] = [[8, 1, 140, 0.1], [18, 0.7, 180, 0.45], [5, 0.55, 220, 0.7], [26, 0.85, 160, 0.85]]

function Cloud() {
  return (
    <svg width="220" height="86" viewBox="0 -16 220 86" aria-hidden="true">
      <path d="M30 60h160a24 24 0 0 0 0-48 30 30 0 0 0-52-4 34 34 0 0 0-58 10A22 22 0 0 0 30 60z" fill="#FFF" />
    </svg>
  )
}

// Everything is drawn from --wall, so it follows the wallpaper colour
export default function Wallpaper() {
  return (
    <div id="wallpaper" aria-hidden="true">
      {CLOUDS.map(([top, scale, dur, at], i) => (
        <div key={i} className="cloud" style={{ top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${-dur * at}s`, scale: String(scale) }}>
          <Cloud />
        </div>
      ))}
      <svg className="ridges" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
        <Ridge peaks={FAR} base={520} cls="far" />
        <Ridge peaks={NEAR} base={520} cls="near" />
      </svg>
    </div>
  )
}
