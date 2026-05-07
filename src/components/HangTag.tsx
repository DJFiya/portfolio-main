interface HangTagProps {
  skill: string
  rotate?: number
  fillColor?: string
  strokeColor?: string
}

const CHAR_WIDTH = 7.8

export default function HangTag({
  skill,
  rotate = 0,
  fillColor = '#dbeafe',
  strokeColor = '#1e4fa0',
}: HangTagProps) {
  const tagW = Math.max(52, Math.ceil(skill.length * CHAR_WIDTH) + 18)
  const tagH = 28
  const totalH = tagH + 16
  const cx = tagW / 2 + 2

  return (
    <svg
      width={tagW + 4}
      height={totalH}
      viewBox={`0 0 ${tagW + 4} ${totalH}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${cx}px 2px`,
        display: 'block',
        flexShrink: 0,
      }}
      aria-label={skill}
    >
      {/* String */}
      <line x1={cx} y1="1" x2={cx} y2="12" stroke={strokeColor} strokeWidth="0.8" opacity="0.7" />
      {/* Hole */}
      <circle cx={cx} cy="5" r="2" fill="none" stroke={strokeColor} strokeWidth="0.8" opacity="0.7" />
      {/* Tag body */}
      <rect
        x="2"
        y="13"
        width={tagW}
        height={tagH}
        rx="2.5"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
      {/* Skill text */}
      <text
        x={cx}
        y={13 + tagH / 2 + 4}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', 'Fira Code', monospace"
        fontSize="8.5"
        fontWeight="500"
        fill="#111113"
      >
        {skill}
      </text>
    </svg>
  )
}
