import type { AwardTier } from '../types/portfolio'

// Generate an n-pointed starburst path
function starburst(cx: number, cy: number, r1: number, r2: number, n: number) {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2
    const r = i % 2 === 0 ? r1 : r2
    pts.push(
      `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    )
  }
  return pts.join(' ') + 'Z'
}

const CFG: Record<
  AwardTier,
  {
    size: number
    points: number
    spikeR: number
    valleyR: number
    diskR: number
    ringR: number
    burstFill: string
    diskFill: string
    ringColor: string
    textColor: string
    label: string
    labelSize: number
    ribbon: boolean
    ribbonFill: string
    ribbonH: number
  }
> = {
  gold: {
    size: 52,
    points: 12,
    spikeR: 25,
    valleyR: 20,
    diskR: 15,
    ringR: 12.5,
    burstFill: '#1e3a8a',
    diskFill: '#1e4fa0',
    ringColor: '#93c5fd',
    textColor: '#dbeafe',
    label: 'W',
    labelSize: 13,
    ribbon: true,
    ribbonFill: '#1e3a8a',
    ribbonH: 16,
  },
  silver: {
    size: 42,
    points: 10,
    spikeR: 20,
    valleyR: 16,
    diskR: 12,
    ringR: 10,
    burstFill: '#172554',
    diskFill: '#1a3a7a',
    ringColor: '#60a5fa',
    textColor: '#bfdbfe',
    label: 'W',
    labelSize: 11,
    ribbon: true,
    ribbonFill: '#172554',
    ribbonH: 13,
  },
  bronze: {
    size: 34,
    points: 8,
    spikeR: 16,
    valleyR: 13,
    diskR: 9.5,
    ringR: 8,
    burstFill: '#0f172a',
    diskFill: '#0f172a',
    ringColor: '#3b82f6',
    textColor: '#93c5fd',
    label: 'SF',
    labelSize: 8.5,
    ribbon: false,
    ribbonFill: 'none',
    ribbonH: 0,
  },
}

export default function Medallion({ tier }: { tier: AwardTier }) {
  const c = CFG[tier]
  const cx = c.size / 2
  const cy = c.size / 2
  const totalH = c.size + c.ribbonH

  return (
    <svg
      width={c.size}
      height={totalH}
      viewBox={`0 0 ${c.size} ${totalH}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Ribbon tails */}
      {c.ribbon && (
        <>
          <rect
            x={cx - 8}
            y={c.size - 5}
            width={6.5}
            height={c.ribbonH}
            rx="1.5"
            fill={c.ribbonFill}
            transform={`rotate(-7 ${cx - 4.75} ${c.size + c.ribbonH / 2})`}
          />
          <rect
            x={cx + 1.5}
            y={c.size - 5}
            width={6.5}
            height={c.ribbonH}
            rx="1.5"
            fill={c.ribbonFill}
            transform={`rotate(7 ${cx + 4.75} ${c.size + c.ribbonH / 2})`}
          />
          {/* Notch V at ribbon bottom */}
          <polygon
            points={`${cx - 8},${totalH - 0.5} ${cx - 4.75},${totalH - 5} ${cx - 1.5},${totalH - 0.5}`}
            fill="#0f172a"
          />
          <polygon
            points={`${cx + 1.5},${totalH - 0.5} ${cx + 4.75},${totalH - 5} ${cx + 8},${totalH - 0.5}`}
            fill="#0f172a"
          />
        </>
      )}

      {/* Starburst body */}
      <path d={starburst(cx, cy, c.spikeR, c.valleyR, c.points)} fill={c.burstFill} />

      {/* Inner disk */}
      <circle cx={cx} cy={cy} r={c.diskR} fill={c.diskFill} />

      {/* Decorative ring */}
      <circle
        cx={cx} cy={cy} r={c.ringR}
        fill="none"
        stroke={c.ringColor}
        strokeWidth="0.8"
        opacity="0.65"
      />

      {/* Rank label ("1st" / "2nd" / "SF") */}
      <text
        x={cx}
        y={cy + c.labelSize * 0.36}
        textAnchor="middle"
        fontSize={c.labelSize}
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fill={c.textColor}
        letterSpacing="-0.3"
      >
        {c.label}
      </text>

    </svg>
  )
}
