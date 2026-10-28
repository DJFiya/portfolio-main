export interface DpsBurst {
  left: number
  top: number
  width: number
  height: number
  tick: number
}

// ── Dead Poets Society — words drifting off the poster like embers ────────────
const DPS_PHRASES: {
  text: string
  xPct: number
  yPct: number
  drift: number
  size: number
  delay: string
  dur: string
  italic: boolean
}[] = [
  { text: 'O Captain! My Captain!',           xPct: 0.08, yPct: 0.60, drift: -16, size: 18,  delay: '0s',    dur: '2.9s', italic: true  },
  { text: 'Carpe Diem',                       xPct: 0.48, yPct: 0.30, drift:  13, size: 22,  delay: '0.22s', dur: '3.4s', italic: false },
  { text: 'Suck the marrow out of life',      xPct: 0.05, yPct: 0.78, drift: -20, size: 15,  delay: '0.52s', dur: '3.1s', italic: true  },
  { text: 'O me! O life!',                    xPct: 0.60, yPct: 0.50, drift: -9,  size: 16,  delay: '0.38s', dur: '3.6s', italic: true  },
  { text: 'Gather ye rosebuds',               xPct: 0.02, yPct: 0.40, drift:  24, size: 14,  delay: '1.05s', dur: '3.2s', italic: false },
  { text: 'To strive, to seek, to find',      xPct: 0.10, yPct: 0.70, drift: -22, size: 14,  delay: '1.40s', dur: '3.0s', italic: true  },
  { text: 'Seize the day',                    xPct: 0.55, yPct: 0.20, drift:  10, size: 16,  delay: '0.65s', dur: '3.3s', italic: false },
  { text: 'make your lives extraordinary',    xPct: 0.03, yPct: 0.92, drift:  28, size: 13,  delay: '1.75s', dur: '3.1s', italic: true  },
  { text: 'No matter what anybody says',      xPct: 0.06, yPct: 0.55, drift: -14, size: 13,  delay: '1.20s', dur: '3.4s', italic: true  },
  { text: 'words and ideas can change the world', xPct: 0.00, yPct: 0.98, drift: 30, size: 12, delay: '2.0s', dur: '3.2s', italic: true },
]

export default function DeadPoetsParticles({ burst }: { burst: DpsBurst }) {
  const { left, top, width, height } = burst

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'visible' }}>
      {DPS_PHRASES.map((p, i) => (
        <div
          key={i}
          className="dps-word"
          style={{
            left: left + width  * p.xPct,
            top:  top  + height * p.yPct,
            fontSize:          p.size,
            fontStyle:         p.italic ? 'italic' : 'normal',
            animationDelay:    p.delay,
            animationDuration: p.dur,
            ['--drift-x' as string]: `${p.drift}px`,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  )
}
