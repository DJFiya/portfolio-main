interface HangTagProps {
  skill: string
  rotate?: number
}

const CHAR_WIDTH = 6.2

export default function HangTag({ skill, rotate = 0 }: HangTagProps) {
  const tagW = Math.max(42, Math.ceil(skill.length * CHAR_WIDTH) + 14)
  const tagH = 24
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
      <line x1={cx} y1="1" x2={cx} y2="12" stroke="#3b82f6" strokeWidth="0.8" />
      {/* Hole */}
      <circle cx={cx} cy="5" r="2" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
      {/* Tag body */}
      <rect
        x="2"
        y="13"
        width={tagW}
        height={tagH}
        rx="2.5"
        fill="#f0ede8"
        stroke="#1e4fa0"
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
