// Inline SVG desk-prop illustrations.
// All coordinates are in their own viewBox; rendered width/height ≈1.5× the original.

const FF_UI = "'Author', system-ui, sans-serif"

// ── Terminal window ───────────────────────────────────────────────────────────
export function TerminalItem({ hacking }: { hacking?: boolean }) {
  return (
    <svg width="231" height="153" viewBox="0 0 154 102" fill="none">
      <rect width="154" height="102" rx="6" fill="#0d0f14" />
      <rect width="154" height="20" rx="6" fill="#161b22" />
      <rect y="14" width="154" height="6" fill="#161b22" />
      <circle cx="13" cy="10" r="4" fill="#ff5f57" opacity="0.75" />
      <circle cx="25" cy="10" r="4" fill="#febc2e" opacity="0.75" />
      <circle cx="37" cy="10" r="4" fill="#28c840" opacity="0.75" />
      {hacking ? (
        <>
          <text x="8" y="34" fontFamily={FF_UI} fontSize="7" fill="#8a9eb0">$ sudo nmap -sV 10.0.0.0/24</text>
          <text x="8" y="46" fontFamily={FF_UI} fontSize="6.3" fill="#7a8fa0">  host 10.0.0.7  ports: 22,80,443 open</text>
          <text x="8" y="60" fontFamily={FF_UI} fontSize="7" fill="#7a9e8a">$ ssh root@10.0.0.7</text>
          <text x="8" y="72" fontFamily={FF_UI} fontSize="6.3" fill="#b0908a">  ACCESS DENIED // key mismatch</text>
          <text x="8" y="84" fontFamily={FF_UI} fontSize="6.8" fill="#8a9eb0">  brute-force blocked [trace detected]</text>
          <rect x="8" y="89" width="6" height="8" fill="#8a9eb0" opacity="0.95" />
        </>
      ) : (
        <>
          <text x="8" y="34" fontFamily={FF_UI} fontSize="7" fill="#7a9e8a">$ npm run dev</text>
          <text x="8" y="46" fontFamily={FF_UI} fontSize="7" fill="#6b7280">  ➜  localhost:5173</text>
          <text x="8" y="60" fontFamily={FF_UI} fontSize="7" fill="#7a9e8a">$ git log --oneline</text>
          <text x="8" y="72" fontFamily={FF_UI} fontSize="7" fill="#6b7280">a3f2c1b feat: page flip</text>
          <text x="8" y="84" fontFamily={FF_UI} fontSize="7" fill="#6b7280">9e1d0f2 fix: board sync</text>
          <rect x="8" y="89" width="6" height="8" fill="#708290" opacity="0.85" />
        </>
      )}
    </svg>
  )
}

// ── Blueprint — system architecture diagram ───────────────────────────────────
export function BlueprintItem() {
  // Helper for connector lines
  const conn = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a9aa8" strokeWidth="0.8" markerEnd="url(#arr)" />
  )
  const box = (x: number, y: number, w: number, h: number, label: string, sub?: string) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#1a2228" stroke="#5a6b78" strokeWidth="0.9" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -1.5 : 2.5)} textAnchor="middle"
        fontFamily={FF_UI} fontSize="5.5" fontWeight="700" fill="#9aa8b3">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 5.5} textAnchor="middle"
        fontFamily={FF_UI} fontSize="3.8" fill="#708290" opacity="0.65">{sub}</text>}
    </g>
  )

  return (
    <svg width="162" height="207" viewBox="0 0 108 138" fill="none">
      <defs>
        <marker id="arr" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <path d="M0,0 L0,4 L4,2 Z" fill="#708290" />
        </marker>
      </defs>

      {/* Background grid */}
      <rect width="108" height="138" fill="#12161a" />
      {[10,20,30,40,50,60,70,80,90,100,110,120,130].map(y =>
        <line key={`gy${y}`} x1="0" y1={y} x2="108" y2={y} stroke="#2a343c" strokeWidth="0.3" opacity="0.5" />
      )}
      {[10,20,30,40,50,60,70,80,90,100].map(x =>
        <line key={`gx${x}`} x1={x} y1="0" x2={x} y2="138" stroke="#2a343c" strokeWidth="0.3" opacity="0.5" />
      )}

      {/* Title bar */}
      <rect width="108" height="12" fill="#1a2228" />
      <text x="54" y="8.5" textAnchor="middle" fontFamily={FF_UI} fontSize="5.5"
        fontWeight="700" fill="#8a9aa8" letterSpacing="1">SYS ARCH v2</text>

      {/* Layer: Client */}
      {box(35, 18, 38, 14, 'CLIENT', 'browser')}

      {/* Arrow: client → gateway */}
      {conn(54, 32, 54, 40, 'c-gw')}

      {/* Layer: API Gateway */}
      {box(28, 40, 52, 14, 'API GATEWAY', 'REST / WS')}

      {/* Branch lines from gateway */}
      <line x1="28" y1="47" x2="18" y2="47" stroke="#8a9aa8" strokeWidth="0.8" />
      <line x1="80" y1="47" x2="90" y2="47" stroke="#8a9aa8" strokeWidth="0.8" />
      {conn(18, 47, 18, 60, 'gw-auth')}
      {conn(90, 47, 90, 60, 'gw-svc')}
      {conn(54, 54, 54, 60, 'gw-db')}

      {/* Auth service */}
      {box(4, 60, 28, 14, 'AUTH', 'JWT')}
      {/* Main service */}
      {box(76, 60, 28, 14, 'SERVICE', 'worker')}
      {/* Database */}
      {box(30, 60, 48, 14, 'DATABASE', 'postgres')}

      {/* Arrow from service → cache */}
      {conn(90, 74, 90, 84, 'svc-cache')}
      {box(75, 84, 29, 14, 'CACHE', 'redis')}

      {/* Arrow from db → queue */}
      {conn(54, 74, 54, 84, 'db-q')}
      {box(29, 84, 50, 14, 'QUEUE', 'async jobs')}

      {/* Footer stamp */}
      <rect y="126" width="108" height="12" fill="#1a2228" />
      <text x="54" y="134" textAnchor="middle" fontFamily={FF_UI} fontSize="4"
        fill="#556b78" letterSpacing="0.5" opacity="0.85">DJ · REV-A · 2025</text>
    </svg>
  )
}

// ── Laptop stickers — 5 × 4 HTML sheet with CSS corner-peel on hover ──────────
// HTML (not SVG) so ::after pseudo-elements work for the peel effect.
export function StickersItem() {
  // [fill, textColor, label]  — ordered by industry demand top→bottom, left→right
  const stickers: [string, string, string][] = [
    ['#2496ED', '#fff',    'Docker'  ],
    ['#FF9900', '#111',    'AWS'     ],
    ['#FFD43B', '#3776AB', 'Python'  ],
    ['#3178C6', '#fff',    'TS'      ],
    ['#20232a', '#7a9aa8', 'React'   ],
    ['#336791', '#fff',    'postgres'],
    ['#47A248', '#fff',    'Mongo'   ],
    ['#DC382D', '#fff',    'Redis'   ],
    ['#0C4B33', '#fff',    'Django'  ],
    ['#009688', '#fff',    'FastAPI' ],
    ['#1a1a1a', '#e5e5e5', 'Flask'   ],
    ['#2270E3', '#fff',    'Dynamo'  ],
    ['#FF6F00', '#fff',    'TF'      ],
    ['#EE4C2C', '#fff',    'PyTorch' ],
    ['#150458', '#e0d4ff', 'pandas'  ],
    ['#5C3EE8', '#fff',    'OpenCV'  ],
    ['#C21325', '#fff',    'Jest'    ],
    ['#1b1f23', '#fff',    'GitHub'  ],
    ['#111111', '#f0f0f0', 'Linux'   ],
    ['#2a3830', '#dce8de', 'Atlas'   ],
  ]

  return (
    // White sticker-sheet backing — pointer-events enabled so hover works
    <div style={{
      width: '162px',
      background: '#f6f5f3',
      border: '0.5px solid #d4d0ca',
      borderRadius: '4px',
      padding: '3px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '4px',
      pointerEvents: 'all',
    }}>
      {stickers.map(([fill, tf, text]) => (
        <div
          key={text}
          className="desk-sticker"
          style={{
            background: fill,
            color: tf,
            borderRadius: '3px',
            // White die-cut halo border
            outline: '2px solid white',
            outlineOffset: '1px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FF_UI,
            fontSize: '5.5px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          {text}
        </div>
      ))}
    </div>
  )
}

// ── Cable doodle ──────────────────────────────────────────────────────────────
export function CablesItem() {
  return (
    <svg width="315" height="135" viewBox="0 0 210 90" fill="none">
      <rect x="0" y="35" width="18" height="12" rx="2" fill="#444" />
      <rect x="3" y="38" width="12" height="6" rx="1" fill="#888" />
      <path d="M18,41 C35,41 40,28 58,28 C76,28 80,52 98,52 C116,52 120,33 138,33 C156,33 160,50 178,50"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      <path d="M18,41 C35,41 40,28 58,28 C76,28 80,52 98,52 C116,52 120,33 138,33 C156,33 160,50 178,50"
        stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <rect x="178" y="43" width="18" height="10" rx="4" fill="#555" />
      <rect x="181" y="45" width="12" height="6" rx="3" fill="#777" />
      <path d="M30,70 C55,70 60,55 80,55 C100,55 105,75 130,75 C155,75 165,60 190,62"
        stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30,70 C55,70 60,55 80,55 C100,55 105,75 130,75 C155,75 165,60 190,62"
        stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Vinyl record ──────────────────────────────────────────────────────────────
export function VinylItem() {
  return (
    <svg width="132" height="132" viewBox="0 0 88 88" fill="none">
      <circle cx="44" cy="44" r="43" fill="#111" />
      {[38, 34, 30, 26, 22].map((r) => (
        <circle key={r} cx="44" cy="44" r={r} stroke="#1a1a1a" strokeWidth="1.2" />
      ))}
      <circle cx="44" cy="44" r="16" fill="#1a1a2e" />
      <circle cx="44" cy="44" r="14" fill="none" stroke="#3d4f5c" strokeWidth="0.8" />
      <text x="44" y="41" textAnchor="middle" fontFamily={FF_UI} fontSize="4.5" fill="#8a9aa8" fontWeight="600">SIDE A</text>
      <text x="44" y="49" textAnchor="middle" fontFamily={FF_UI} fontSize="3.5" fill="#556b78" opacity="0.85">◈ 33 RPM ◈</text>
      <circle cx="44" cy="44" r="2.5" fill="#0d0f14" />
    </svg>
  )
}

// ── Cassette tape ─────────────────────────────────────────────────────────────
export function CassetteItem() {
  return (
    <svg width="135" height="87" viewBox="0 0 90 58" fill="none">
      <rect x="1" y="1" width="88" height="56" rx="5" fill="#1a1a2e" stroke="#2a2a40" strokeWidth="1" />
      <rect x="8" y="6" width="74" height="28" rx="2" fill="#f0ede8" />
      <text x="45" y="18" textAnchor="middle" fontFamily={FF_UI} fontSize="5.5" fontWeight="700" fill="#1a1a2e">SIDE A</text>
      <text x="45" y="28" textAnchor="middle" fontFamily={FF_UI} fontSize="3.8" fill="#555">lo-fi · study vibes · vol. 1</text>
      <circle cx="30" cy="45" r="10" fill="#0d0f14" stroke="#333" strokeWidth="1" />
      <circle cx="60" cy="45" r="10" fill="#0d0f14" stroke="#333" strokeWidth="1" />
      {[0, 120, 240].map((deg) => (
        <line key={`l-${deg}`}
          x1={30 + 4 * Math.cos((deg * Math.PI) / 180)} y1={45 + 4 * Math.sin((deg * Math.PI) / 180)}
          x2={30 + 9 * Math.cos((deg * Math.PI) / 180)} y2={45 + 9 * Math.sin((deg * Math.PI) / 180)}
          stroke="#333" strokeWidth="1" />
      ))}
      {[0, 120, 240].map((deg) => (
        <line key={`r-${deg}`}
          x1={60 + 4 * Math.cos((deg * Math.PI) / 180)} y1={45 + 4 * Math.sin((deg * Math.PI) / 180)}
          x2={60 + 9 * Math.cos((deg * Math.PI) / 180)} y2={45 + 9 * Math.sin((deg * Math.PI) / 180)}
          stroke="#333" strokeWidth="1" />
      ))}
      <path d="M40,45 Q45,38 50,45" fill="none" stroke="#111" strokeWidth="1.5" />
    </svg>
  )
}

// ── Game controller ───────────────────────────────────────────────────────────
export function ControllerItem() {
  return (
    <svg width="150" height="102" viewBox="0 0 100 68" fill="none">
      <path d="M22,22 C12,17 6,32 10,50 C14,64 28,66 40,57 L50,52 L60,57 C72,66 86,64 90,50 C94,32 88,17 78,22 C73,24 62,27 50,27 C38,27 27,24 22,22 Z"
        fill="#1a1a2e" stroke="#2a2a40" strokeWidth="1" />
      <rect x="20" y="37" width="5" height="14" rx="1" fill="#2a2a40" />
      <rect x="15" y="42" width="14" height="5" rx="1" fill="#2a2a40" />
      <circle cx="72" cy="36" r="4.5" fill="#3d4f5c" opacity="0.95" />
      <circle cx="80" cy="42" r="4.5" fill="#2f3d47" opacity="0.95" />
      <circle cx="72" cy="48" r="4.5" fill="#243038" opacity="0.95" />
      <circle cx="64" cy="42" r="4.5" fill="#2a343c" opacity="0.95" />
      <text x="72" y="39" textAnchor="middle" fontFamily={FF_UI} fontSize="5" fill="#9aa8b3">▲</text>
      <text x="80" y="45" textAnchor="middle" fontFamily={FF_UI} fontSize="5" fill="#9aa8b3">●</text>
      <text x="72" y="51" textAnchor="middle" fontFamily={FF_UI} fontSize="5" fill="#9aa8b3">✕</text>
      <text x="64" y="45" textAnchor="middle" fontFamily={FF_UI} fontSize="5" fill="#9aa8b3">■</text>
      <circle cx="35" cy="48" r="7" fill="#111" stroke="#333" strokeWidth="1" />
      <circle cx="58" cy="48" r="7" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="43" y="32" width="7" height="4" rx="2" fill="#222" />
      <rect x="50" y="32" width="7" height="4" rx="2" fill="#222" />
      <path d="M22,22 C18,18 16,14 22,12 C30,10 40,12 50,12" stroke="#2a2a40" strokeWidth="2" fill="none" />
      <path d="M78,22 C82,18 84,14 78,12 C70,10 60,12 50,12" stroke="#2a2a40" strokeWidth="2" fill="none" />
    </svg>
  )
}

// ── Poem paper ────────────────────────────────────────────────────────────────
export function PoemItem() {
  const lines = [58, 46, 54, 38, 52, 44, 50, 56, 42, 60, 48]
  return (
    <svg width="117" height="168" viewBox="0 0 78 112" fill="none">
      <rect x="2" y="2" width="76" height="110" rx="1" fill="rgba(0,0,0,0.18)" />
      <rect x="0" y="0" width="76" height="110" fill="#f5f1eb" />
      <line x1="8" y1="14" x2="68" y2="14" stroke="#ccc" strokeWidth="0.5" />
      {lines.map((w, i) => {
        const y = 24 + i * 8 + (i >= 4 ? 5 : 0) + (i >= 7 ? 5 : 0)
        return <line key={i} x1="8" y1={y} x2={w} y2={y} stroke="#555" strokeWidth="0.75" opacity="0.7" />
      })}
      <text x="38" y="104" textAnchor="middle" fontFamily="'Rosaline', Georgia, serif" fontSize="10" fill="#999" opacity="0.4">※</text>
    </svg>
  )
}

// ── Coffee mug — top-down view ────────────────────────────────────────────────
export function MugItem({
  fillLevel = 1,
  sipping = false,
  empty = false,
}: {
  fillLevel?: number
  sipping?: boolean
  empty?: boolean
}) {
  const clampedFill = Math.max(0, Math.min(1, fillLevel))
  const baseRadius = 26 * (0.75 + clampedFill * 0.25)
  const sipScale = sipping ? 0.95 : 1
  const coffeeRadius = baseRadius * sipScale
  const swirlOpacity = 0.13 * clampedFill
  const highlightOpacity = 0.1 * clampedFill

  return (
    <svg width="155" height="155" viewBox="0 0 110 110" fill="none">
      {/* Coffee ring stain on desk surface (circular, like a real mug ring) */}
      <circle cx="82" cy="85" r="22" fill="none" stroke="rgba(101,67,33,0.22)" strokeWidth="5" />
      <circle cx="82" cy="85" r="15" fill="none" stroke="rgba(101,67,33,0.1)" strokeWidth="2.5" />
      {/* Outer mug rim */}
      <ellipse cx="46" cy="48" rx="38" ry="38" fill="#f0ede8" stroke="#bbb" strokeWidth="1.5" />
      {/* Rim shadow / depth ring */}
      <ellipse cx="46" cy="48" rx="34" ry="34" fill="none" stroke="#d0c8be" strokeWidth="1" />
      {/* Inner basin tint so low coffee doesn't look white */}
      <circle cx="46" cy="47" r="26" fill="#3d1f08" opacity="0.22" />
      {/* Coffee surface */}
      <circle
        cx="46"
        cy="47"
        r={coffeeRadius}
        fill={empty ? '#5d4635' : '#3d1f08'}
        opacity={empty ? 0.35 : 0.88}
        style={{ transition: 'r 180ms ease' }}
      />
      {/* Cream swirl highlight */}
      <path d="M36,39 Q46,33 54,45 Q50,59 38,55 Q33,47 36,39" fill={`rgba(255,235,210,${swirlOpacity})`} />
      <ellipse cx="40" cy="42" rx="4" ry="3" fill={`rgba(255,245,230,${highlightOpacity})`} />
      {/* Handle — D-shape visible from top right */}
      <path d="M82,36 C96,36 96,60 82,60" fill="none" stroke="#ccc" strokeWidth="5" strokeLinecap="round" />
      <path d="M82,36 C94,36 94,60 82,60" fill="none" stroke="#e4ddd4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Typographic movie posters ─────────────────────────────────────────────────
interface PosterLine { text: string; size: number }
interface PosterTheme {
  bg: string
  accent: string
  lines: PosterLine[]
  sub: string
}

const POSTER_THEMES: Record<string, PosterTheme> = {
  // ATLA: warm earth tones — terracotta & smoke
  ATLA: {
    bg: '#18100a',
    accent: '#b87848',
    lines: [
      { text: 'AVATAR',     size: 7.5 },
      { text: 'THE LAST',   size: 7   },
      { text: 'AIRBENDER',  size: 5.8 },
    ],
    sub: '— animated —',
  },
  Invincible: {
    bg: '#161e2c',
    accent: '#c8a85a',
    lines: [
      { text: 'INVINCIBLE', size: 6.5 },
    ],
    sub: '★ series ★',
  },
  'Dead Poets': {
    bg: '#100c06',
    accent: '#b08840',
    lines: [
      { text: 'DEAD',    size: 11  },
      { text: 'POETS',   size: 11  },
      { text: 'SOCIETY', size: 7.5 },
    ],
    sub: '· carpe diem ·',
  },
  'Good Will Hunting': {
    bg: '#0e1620',
    accent: '#7898b0',
    lines: [
      { text: 'GOOD',    size: 11  },
      { text: 'WILL',    size: 11  },
      { text: 'HUNTING', size: 8   },
    ],
    sub: '— 1997 —',
  },
}

export function PosterItem({ label }: { label: string }) {
  const theme = POSTER_THEMES[label] ?? {
    bg: '#111', accent: '#9aa8b3',
    lines: [{ text: label, size: 9 }],
    sub: '',
  }

  // Stack lines centred vertically in the inner content area (y 18–76)
  const linesH = theme.lines.length * 16
  const blockTop = (76 - linesH) / 2 + 18

  return (
    <svg width="102" height="144" viewBox="0 0 68 96" fill="none">
      {/* Mat */}
      <rect width="68" height="96" fill="#e8e4de" />
      {/* Inner frame */}
      <rect x="4" y="4" width="60" height="88" fill={theme.bg} />
      {/* Top rule */}
      <line x1="10" y1="14" x2="58" y2="14" stroke={theme.accent} strokeWidth="0.8" opacity="0.55" />

      {/* Title lines */}
      {theme.lines.map((line, i) => (
        <text
          key={i}
          x="34"
          y={blockTop + i * 16 + line.size * 0.85}
          textAnchor="middle"
          fontFamily="'Rowan', Georgia, serif"
          fontSize={line.size}
          fontWeight="700"
          fill={theme.accent}
          letterSpacing="1.2"
        >
          {line.text}
        </text>
      ))}

      {/* Divider */}
      <line x1="18" y1={blockTop + theme.lines.length * 16 + 3} x2="50" y2={blockTop + theme.lines.length * 16 + 3}
        stroke={theme.accent} strokeWidth="0.5" opacity="0.35" />

      {/* Sub label */}
      <text
        x="34"
        y={blockTop + theme.lines.length * 16 + 12}
        textAnchor="middle"
        fontFamily="'Author', system-ui, sans-serif"
        fontSize="4.8"
        fill={theme.accent}
        opacity="0.6"
        letterSpacing="0.4"
      >
        {theme.sub}
      </text>

      {/* Bottom rule */}
      <line x1="10" y1="82" x2="58" y2="82" stroke={theme.accent} strokeWidth="0.8" opacity="0.55" />
    </svg>
  )
}

// ── Laptop — partially visible from top edge ─────────────────────────────────
export function LaptopItem() {
  // Key rows: [y from top, count, key-width, gap, startX]
  const rows: Array<{ y: number; count: number; kw: number; gap: number; startX: number }> = [
    { y: 113, count: 14, kw: 15,   gap: 1.5, startX: 15 },  // fn row
    { y: 125, count: 13, kw: 17,   gap: 1.5, startX: 11 },  // numbers
    { y: 137, count: 12, kw: 18,   gap: 1.5, startX: 14 },  // QWERTY
    { y: 149, count: 11, kw: 18.5, gap: 1.5, startX: 21 },  // ASDF
    { y: 161, count: 10, kw: 19,   gap: 1.5, startX: 28 },  // ZXCV
  ]
  const keyH = 9

  return (
    <svg width="390" height="300" viewBox="0 0 260 200" fill="none">
      {/* Screen lid */}
      <rect x="4" y="0" width="252" height="100" rx="8" fill="#1c1c1e" />
      <rect x="12" y="7" width="236" height="88" rx="4" fill="#0d1117" />

      {/* Code on screen */}
      <g clipPath="url(#laptop-screen-clip)">
        <g className="laptop-log-stack">
          <g className="laptop-log-page laptop-log-page--current">
            <text x="20" y="24" fontFamily={FF_UI} fontSize="7.5" fill="#7a9e8a">$ npm run dev</text>
            <text x="20" y="37" fontFamily={FF_UI} fontSize="7" fill="#6b7280">  VITE v5  ready in 209ms</text>
            <text x="20" y="50" fontFamily={FF_UI} fontSize="6.5" fill="#708290">  ➜  http://localhost:5173/</text>
            <text x="20" y="63" fontFamily={FF_UI} fontSize="6.5" fill="#7a9e8a">$ git log --oneline</text>
            <text x="20" y="74" fontFamily={FF_UI} fontSize="6.5" fill="#6b7280">  a3f2c1 feat: board anim</text>
            <text x="20" y="85" fontFamily={FF_UI} fontSize="6.5" fill="#6b7280">  9e1d0f fix: page flip</text>
          </g>
          <g className="laptop-log-page laptop-log-page--next">
            <text x="20" y="108" fontFamily={FF_UI} fontSize="7.5" fill="#7a9e8a">$ npm run build</text>
            <text x="20" y="121" fontFamily={FF_UI} fontSize="7" fill="#6b7280">  transforming modules...</text>
            <text x="20" y="134" fontFamily={FF_UI} fontSize="6.5" fill="#6b7280">  rendering chunks...</text>
            <text x="20" y="147" fontFamily={FF_UI} fontSize="6.5" fill="#7a9e8a">✓ built in 1.1s</text>
            <text x="20" y="158" fontFamily={FF_UI} fontSize="6.5" fill="#708290">$ git push origin main</text>
            <text x="20" y="169" fontFamily={FF_UI} fontSize="6.5" fill="#6b7280">Everything up-to-date</text>
          </g>
        </g>
      </g>

      {/* Hinge bar */}
      <rect x="0" y="100" width="260" height="8" rx="3" fill="#262628" />

      {/* Keyboard deck */}
      <rect x="0" y="107" width="260" height="93" rx="8" fill="#2c2c2e" />
      {/* Keyboard recess */}
      <rect x="7" y="113" width="246" height="80" rx="4" fill="#1c1c1e" />

      {/* Key rows */}
      {rows.map(({ y, count, kw, gap, startX }) =>
        Array.from({ length: count }, (_, i) => (
          <rect
            key={`k-${y}-${i}`}
            x={startX + i * (kw + gap)}
            y={y}
            width={kw}
            height={keyH}
            rx="1.5"
            fill="#2a2a2c"
            stroke="#3a3a3c"
            strokeWidth="0.35"
          />
        ))
      )}

      {/* Bottom modifier row */}
      <rect x="15"  y="173" width="24" height={keyH} rx="1.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.35" />
      <rect x="42"  y="173" width="24" height={keyH} rx="1.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.35" />
      <rect x="70"  y="173" width="120" height={keyH} rx="1.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.35" />
      <rect x="194" y="173" width="24" height={keyH} rx="1.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.35" />
      <rect x="221" y="173" width="24" height={keyH} rx="1.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.35" />

      {/* Click glow targets: W, A, S, D */}
      <rect className="laptop-key-glow laptop-key-glow--w" x="33.5" y="137" width="18" height={keyH} rx="1.5" fill="none" stroke="#8a9aa8" strokeWidth="1.1" />
      <rect className="laptop-key-glow laptop-key-glow--a" x="21" y="149" width="18.5" height={keyH} rx="1.5" fill="none" stroke="#8a9aa8" strokeWidth="1.1" />
      <rect className="laptop-key-glow laptop-key-glow--s" x="41" y="149" width="18.5" height={keyH} rx="1.5" fill="none" stroke="#8a9aa8" strokeWidth="1.1" />
      <rect className="laptop-key-glow laptop-key-glow--d" x="61" y="149" width="18.5" height={keyH} rx="1.5" fill="none" stroke="#8a9aa8" strokeWidth="1.1" />

      {/* Trackpad */}
      <rect x="88" y="184" width="84" height="14" rx="5" fill="#232325" stroke="#3a3a3c" strokeWidth="0.4" />

      <defs>
        <clipPath id="laptop-screen-clip">
          <rect x="12" y="7" width="236" height="88" rx="4" />
        </clipPath>
      </defs>
    </svg>
  )
}

// ── Minecraft diamond sword — accurate pixel art ──────────────────────────────
// Blade goes from upper-right (tip) to lower-left (pommel), 45° diagonal.
// Guard extends perpendicular (NW arm + SE arm) at the blade/handle junction.
export function DiamondSwordItem() {
  const P = 10 // px per pixel → 160×160 total

  // Authentic Minecraft diamond sword palette — no neon
  // Blade: muted teal spectrum | Guard/handle: warm wood browns
  const px: [number, number, string][] = [
    [13,0,'#0c2c26'],[14,0,'#0a2820'],[15,0,'#0a2820'],
    [12,1,'#082820'],[13,1,'#7ec0b6'],[14,1,'#7ec0b6'],[15,1,'#081c16'],
    [11,2,'#0c2820'],[12,2,'#7ec0b6'],[13,2,'#267a6c'],[14,2,'#7ec0b6'],[15,2,'#0a1e1c'],
    [10,3,'#0a2820'],[11,3,'#7ec0b6'],[12,3,'#267a6c'],[13,3,'#7ec0b6'],[14,3,'#061e16'],
    [9,4,'#082820'],[10,4,'#7ec0b6'],[11,4,'#267a6c'],[12,4,'#369086'],[13,4,'#001c14'],
    [8,5,'#0c2820'],[9,5,'#7ec0b6'],[10,5,'#267a6c'],[11,5,'#369086'],[12,5,'#0a1c10'],
    [2,6,'#0a2820'],[3,6,'#0a2820'],[7,6,'#082820'],[8,6,'#369086'],[9,6,'#267a6c'],[10,6,'#369086'],[11,6,'#061e16'],
    [2,7,'#0a2820'],[3,7,'#18604e'],[4,7,'#0a2820'],[6,7,'#082820'],[7,7,'#369086'],[8,7,'#267a6c'],[9,7,'#369086'],[10,7,'#021816'],
    [3,8,'#0a2820'],[4,8,'#18604e'],[5,8,'#061e16'],[6,8,'#369086'],[7,8,'#18604e'],[8,8,'#369086'],[9,8,'#0a1814'],
    [3,9,'#0a2820'],[4,9,'#18604e'],[5,9,'#18604e'],[6,9,'#154a3c'],[7,9,'#369086'],[8,9,'#0a1814'],
    [4,10,'#082820'],[5,10,'#154a3c'],[6,10,'#0e2c22'],[7,10,'#021816'],
    [3,11,'#3e2e14'],[4,11,'#5c3e18'],[5,11,'#061e16'],[6,11,'#0a2820'],[7,11,'#0a2820'],[8,11,'#081818'],
    [2,12,'#3a2c10'],[3,12,'#785618'],[4,12,'#201608'],[6,12,'#081818'],[7,12,'#081818'],[8,12,'#0a2820'],[9,12,'#081e18'],
    [0,13,'#0c2c28'],[1,13,'#0a2a26'],[2,13,'#5c3e18'],[3,13,'#201608'],[8,13,'#081e18'],[9,13,'#061e18'],
    [0,14,'#0c2a26'],[1,14,'#124c42'],[2,14,'#061e18'],
    [0,15,'#061e18'],[1,15,'#061e18'],[2,15,'#061e18'],
  ]

  return (
    <svg
      width={P * 16}
      height={P * 16}
      viewBox={`0 0 ${P * 16} ${P * 16}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {px.map(([c, r, fill], i) => (
        <rect key={i} x={c * P} y={r * P} width={P} height={P} fill={fill} />
      ))}
    </svg>
  )
}

// ── D20 — pentagon face with internal lines ───────────────────────────────────
export function D20Item({ value }: { value?: number }) {
  const cx = 32, cy = 33, R = 30
  // Pentagon with point at top (−90° start)
  const verts = Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number]
  })
  const outerPts = verts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const fs = value !== undefined && value >= 10 ? 13 : 14
  return (
    <svg width="65" height="65" viewBox="0 0 65 65" fill="none">
      <polygon points={outerPts} fill="#2f3d47" stroke="#5a6b78" strokeWidth="1.5" />
      {verts.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y}
          stroke="#8a9aa8" strokeWidth="0.8" opacity="0.45" />
      ))}
      {(() => {
        const inner = Array.from({ length: 5 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
          return `${(cx + 12 * Math.cos(a)).toFixed(1)},${(cy + 12 * Math.sin(a)).toFixed(1)}`
        }).join(' ')
        return <polygon points={inner} fill="none" stroke="#708290" strokeWidth="0.6" opacity="0.35" />
      })()}
      {value !== undefined && (
        <text x={cx} y={cy + 5.5} textAnchor="middle" fontFamily="'Rowan', Georgia, serif"
          fontSize={fs} fontWeight="700" fill="#dbe3e8" letterSpacing="-0.5">{value}</text>
      )}
    </svg>
  )
}

// ── D12 — pentagon face ───────────────────────────────────────────────────────
export function D12Item({ value }: { value?: number }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return `${(20 + 18 * Math.cos(a)).toFixed(1)},${(20 + 18 * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  const inner = Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    return `${(20 + 11 * Math.cos(a)).toFixed(1)},${(20 + 11 * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  const fs = value !== undefined && value >= 10 ? 9.5 : 11
  return (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <polygon points={pts} fill="#243038" stroke="#5a6b78" strokeWidth="1.5" />
      <polygon points={inner} fill="none" stroke="#708290" strokeWidth="0.7" opacity="0.4" />
      {value !== undefined && (
        <text x="20" y="24" textAnchor="middle" fontFamily="'Rowan', Georgia, serif"
          fontSize={fs} fontWeight="700" fill="#dbe3e8">{value}</text>
      )}
    </svg>
  )
}

// ── D6 — rounded square with dots matching the rolled value ───────────────────
const D6_DOTS: Record<number, [number, number][]> = {
  1: [[18, 18]],
  2: [[25, 11], [11, 25]],
  3: [[25, 11], [18, 18], [11, 25]],
  4: [[11, 11], [25, 11], [11, 25], [25, 25]],
  5: [[11, 11], [25, 11], [18, 18], [11, 25], [25, 25]],
  6: [[11, 11], [25, 11], [11, 18], [25, 18], [11, 25], [25, 25]],
}

export function D6Item({ value }: { value?: number }) {
  const dots = value !== undefined ? (D6_DOTS[value] ?? []) : []
  return (
    <svg width="54" height="54" viewBox="0 0 36 36" fill="none">
      <rect x="1" y="1" width="34" height="34" rx="5" fill="#2f3d47" stroke="#5a6b78" strokeWidth="1.5" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#9aa8b3" />
      ))}
    </svg>
  )
}

// ── Dispatcher ───────────────────────────────────────────────────────────────
export function DeskItemSVG({
  type,
  label,
  diceValue,
  terminalHacking,
  mugFillLevel,
  mugSipping,
  mugEmpty,
}: {
  type: string
  label: string
  diceValue?: number
  terminalHacking?: boolean
  mugFillLevel?: number
  mugSipping?: boolean
  mugEmpty?: boolean
}) {
  switch (type) {
    case 'terminal':   return <TerminalItem hacking={terminalHacking} />
    case 'blueprint':  return <BlueprintItem />
    case 'stickers':   return <StickersItem />
    case 'cables':     return <CablesItem />
    case 'vinyl':      return <VinylItem />
    case 'cassette':   return <CassetteItem />
    case 'controller': return <ControllerItem />
    case 'poem':       return <PoemItem />
    case 'mug':        return <MugItem fillLevel={mugFillLevel} sipping={mugSipping} empty={mugEmpty} />
    case 'poster':     return <PosterItem label={label} />
    case 'dice-d20':   return <D20Item value={diceValue} />
    case 'dice-d12':   return <D12Item value={diceValue} />
    case 'dice-d6':    return <D6Item value={diceValue} />
    case 'diamond-sword': return <DiamondSwordItem />
    case 'laptop':     return <LaptopItem />
    default:           return null
  }
}
