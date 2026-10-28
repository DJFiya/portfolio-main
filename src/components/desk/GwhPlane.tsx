import { useState, useEffect } from 'react'

// ── Good Will Hunting — paper airplane carries the message ───────────────────

type GwhPhase = 'fly-in' | 'align' | 'unfurl' | 'open' | 'refold' | 'fly-out'

const GWH_TIMINGS: Record<GwhPhase, number> = {
  'fly-in':  950,
  'align':   180,
  'unfurl':  650,
  'open':    2100,
  'refold':  650,
  'fly-out': 900,
}

export default function GwhPlane({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<GwhPhase>('fly-in')

  useEffect(() => {
    const phases: GwhPhase[] = ['fly-in', 'align', 'unfurl', 'open', 'refold', 'fly-out']
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    phases.slice(1).forEach((ph, i) => {
      elapsed += GWH_TIMINGS[phases[i]]
      timers.push(setTimeout(() => setPhase(ph), elapsed))
    })
    elapsed += GWH_TIMINGS['fly-out']
    timers.push(setTimeout(onDone, elapsed))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const showPlane = true
  const showNote  = phase === 'unfurl'  || phase === 'open'   || phase === 'refold'

  const planeAnim =
    phase === 'unfurl' ? 'fold'   :
    phase === 'open'   ? 'folded' :
    phase === 'refold' ? 'emerge' : 'steady'

  const planeMotion =
    phase === 'fly-in'  ? 'fly-in'  :
    phase === 'fly-out' ? 'fly-out' : 'center'

  const noteAnim =
    phase === 'refold'  ? 'fold'   :
    phase === 'unfurl'  ? 'unfold' : 'open'

  return (
    <div style={{
      position: 'fixed',
      top: '42vh',
      left: '50vw',
      width: 0,
      height: 0,
      overflow: 'visible',
      zIndex: 100001,
      pointerEvents: 'none',
    }}>
      {showPlane && (
        <div className={`gwh-plane-motion gwh-plane-motion--${planeMotion}`}>
          <div className={`gwh-plane-anim gwh-plane-anim--${planeAnim}`}>
            {(phase === 'fly-in' || phase === 'fly-out') && (
              <div className="gwh-plane-trail" aria-hidden="true">
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--1" />
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--2" />
                <span className="gwh-plane-trail-dot gwh-plane-trail-dot--3" />
              </div>
            )}
            <PaperPlaneIcon />
          </div>
        </div>
      )}
      {showNote && (
        <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
          <div className={`gwh-note-anim gwh-note-anim--${noteAnim}`}>
            <div className="gwh-note-paper">
              <span className="gwh-note-text">Sorry, I had to go see about a girl ❤️</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 100 62" width="100" height="62" fill="none">
      {/* main body */}
      <path d="M98 31 L2 5 L34 31 L2 57 Z" fill="#f5f0e8" stroke="#bfb49a" strokeWidth="1.4"/>
      {/* centre fold crease */}
      <line x1="98" y1="31" x2="34" y2="31" stroke="#bfb49a" strokeWidth="0.9" strokeDasharray="4 2.5" opacity="0.7"/>
      {/* wing fold lines */}
      <path d="M66 20 L34 31 L66 42" stroke="#bfb49a" strokeWidth="0.75" fill="none" opacity="0.55"/>
      {/* subtle highlight on upper wing */}
      <path d="M98 31 L2 5 L34 31 Z" fill="rgba(255,255,255,0.18)"/>
    </svg>
  )
}
