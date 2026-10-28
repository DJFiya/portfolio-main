export type AtlaEffect = 'fire' | 'earth' | 'water' | 'air'

export interface AtlaBurst {
  effect: AtlaEffect
  // poster's viewport position/size at click time
  left: number
  top: number
  width: number
  height: number
  tick: number
}

const ATLA_LABELS: Record<AtlaEffect, string> = {
  fire:  'FIRE',
  earth: 'EARTH',
  water: 'WATER',
  air:   'AIR',
}

// ── Particle overlay rendered via portal (position:fixed, no parent clips) ────
export default function AtlaParticles({ burst }: { burst: AtlaBurst }) {
  const { effect, left, top, width, height } = burst
  const cx = left + width  / 2
  const cy = top  + height / 2

  const label = ATLA_LABELS[effect]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'visible',
      }}
    >
      {/* ── label ── */}
      <div className={`atla-label-popup atla-label-popup--${effect}`}
        style={{ left: cx, top: top - 14 }}>
        {label}
      </div>

      {effect === 'fire' && <FireParticles left={left} top={top} width={width} height={height} />}
      {effect === 'earth' && <EarthParticles cx={cx} cy={cy} />}
      {effect === 'water' && <WaterParticles cx={cx} cy={cy} />}
      {effect === 'air' && <AirParticles left={left} top={top} width={width} height={height} />}
    </div>
  )
}

function FireParticles({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  const sparks = [
    { x: left + width * 0.15, delay: '0s',    size: 9  },
    { x: left + width * 0.30, delay: '0.06s', size: 7  },
    { x: left + width * 0.47, delay: '0.02s', size: 12 },
    { x: left + width * 0.62, delay: '0.08s', size: 8  },
    { x: left + width * 0.75, delay: '0.04s', size: 7  },
    { x: left + width * 0.88, delay: '0.10s', size: 10 },
  ]
  const baseY = top + height - 10
  return <>
    {sparks.map((s, i) => (
      <div key={i} className="atla-particle atla-particle--fire" style={{
        left: s.x, top: baseY,
        width: s.size, height: s.size,
        animationDelay: s.delay,
      }} />
    ))}
  </>
}

function EarthParticles({ cx, cy }: { cx: number; cy: number }) {
  const rocks = [
    { dx: -38, dy: -26, delay: '0s',    w: 11, h: 9  },
    { dx: -20, dy: -42, delay: '0.03s', w: 8,  h: 8  },
    { dx:   0, dy: -48, delay: '0.01s', w: 14, h: 10 },
    { dx:  20, dy: -42, delay: '0.05s', w: 10, h: 8  },
    { dx:  38, dy: -26, delay: '0.02s', w: 8,  h: 7  },
    { dx:   0, dy:  28, delay: '0.04s', w: 9,  h: 9  },
  ]
  return <>
    {rocks.map((r, i) => (
      <div key={i} className={`atla-particle atla-particle--earth-${i + 1}`} style={{
        left: cx - r.w / 2, top: cy - r.h / 2,
        width: r.w, height: r.h,
        animationDelay: r.delay,
        ['--dx' as string]: `${r.dx}px`,
        ['--dy' as string]: `${r.dy}px`,
      }} />
    ))}
  </>
}

function WaterParticles({ cx, cy }: { cx: number; cy: number }) {
  const rings = [
    { size: 40,  delay: '0s',    color: '#5a7284', bw: '2.5px' },
    { size: 70,  delay: '0.1s',  color: '#7a8fa0', bw: '2px'   },
    { size: 100, delay: '0.2s',  color: '#a8b8c4', bw: '1.5px' },
    { size: 130, delay: '0.3s',  color: '#d4dce2', bw: '1px'   },
  ]
  return <>
    {rings.map((r, i) => (
      <div key={i} className="atla-particle atla-particle--water" style={{
        left: cx - r.size / 2, top: cy - r.size / 2,
        width: r.size, height: r.size,
        borderColor: r.color,
        borderWidth: r.bw,
        animationDelay: r.delay,
      }} />
    ))}
  </>
}

function AirParticles({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  const lines = [
    { y: top + height * 0.20, delay: '0s',    h: 2.5 },
    { y: top + height * 0.35, delay: '0.07s', h: 2   },
    { y: top + height * 0.50, delay: '0.03s', h: 2.5 },
    { y: top + height * 0.65, delay: '0.10s', h: 2   },
    { y: top + height * 0.80, delay: '0.05s', h: 1.5 },
  ]
  return <>
    {lines.map((l, i) => (
      <div key={i} className="atla-particle atla-particle--air" style={{
        left: left + width * 0.04,
        top: l.y,
        width: width * 0.92,
        height: l.h,
        animationDelay: l.delay,
      }} />
    ))}
  </>
}
