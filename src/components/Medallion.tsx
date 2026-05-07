import type { AwardTier } from '../types/portfolio'

interface MedallionProps {
  tier: AwardTier
}

const CFG = {
  gold: {
    size: 46,
    outerFill: '#1e4fa0',
    innerFill: '#2563c2',
    ringStroke: '#60a5fa',
    starColor: '#fff',
    ribbon: true,
  },
  silver: {
    size: 40,
    outerFill: '#1a3a7a',
    innerFill: '#1e4fa0',
    ringStroke: '#93c5fd',
    starColor: '#fff',
    ribbon: true,
  },
  bronze: {
    size: 34,
    outerFill: 'none',
    innerFill: 'none',
    ringStroke: '#93c5fd',
    starColor: '#93c5fd',
    ribbon: false,
  },
}

export default function Medallion({ tier }: MedallionProps) {
  const { size, outerFill, innerFill, ringStroke, starColor, ribbon } = CFG[tier]
  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 1
  const innerR = outerR - 5
  const rw = 7
  const totalH = size + (ribbon ? 14 : 0)

  return (
    <svg
      width={size}
      height={totalH}
      viewBox={`0 0 ${size} ${totalH}`}
      aria-hidden="true"
    >
      {/* Ribbon strips */}
      {ribbon && (
        <>
          <rect
            x={cx - rw - 1}
            y={size - 5}
            width={rw}
            height={13}
            rx="1"
            fill={outerFill}
            transform={`rotate(-5 ${cx - rw / 2 - 1} ${size + 2})`}
          />
          <rect
            x={cx + 1}
            y={size - 5}
            width={rw}
            height={13}
            rx="1"
            fill={outerFill}
            transform={`rotate(5 ${cx + rw / 2 + 1} ${size + 2})`}
          />
        </>
      )}

      {/* Outer circle */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill={outerFill}
        stroke={tier === 'bronze' ? ringStroke : 'none'}
        strokeWidth={tier === 'bronze' ? 1.5 : 0}
      />
      {/* Inner circle */}
      {tier !== 'bronze' && (
        <circle cx={cx} cy={cy} r={innerR} fill={innerFill} />
      )}
      {/* Decorative ring */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR - (tier === 'bronze' ? 3 : 4)}
        fill="none"
        stroke={ringStroke}
        strokeWidth="0.8"
        opacity="0.6"
      />
      {/* Star */}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize={tier === 'gold' ? 14 : tier === 'silver' ? 12 : 10}
        fill={starColor}
      >
        ★
      </text>
    </svg>
  )
}
