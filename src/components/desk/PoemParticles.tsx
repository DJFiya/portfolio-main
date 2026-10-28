export interface PoemBurst {
  left: number
  top: number
  width: number
  height: number
  lines: [string, string]
  tick: number
}

export default function PoemParticles({ burst }: { burst: PoemBurst }) {
  const { left, top, width, lines } = burst
  return (
    <div className="poem-burst" style={{ left: left + width / 2, top: top - 8 }}>
      <div className="poem-burst-line poem-burst-line--1">{lines[0]}</div>
      <div className="poem-burst-line poem-burst-line--2">{lines[1]}</div>
    </div>
  )
}
