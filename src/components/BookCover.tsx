import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'

const data = rawData as unknown as PortfolioData

interface BookCoverProps {
  onOpen: () => void
}

function CornerBracket({
  pos,
}: {
  pos: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const paths = {
    tl: 'M9 2H2V9',
    tr: 'M5 2H12V9',
    bl: 'M9 12H2V5',
    br: 'M5 12H12V5',
  }
  const positions: Record<string, string> = {
    tl: 'top-4 left-4',
    tr: 'top-4 right-4',
    bl: 'bottom-4 left-4',
    br: 'bottom-4 right-4',
  }
  return (
    <div className={`absolute ${positions[pos]}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d={paths[pos]}
          stroke="rgba(175, 155, 118, 0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export default function BookCover({ onOpen }: BookCoverProps) {
  return (
    <div
      className="w-full h-full relative cursor-pointer select-none group"
      onClick={onOpen}
      role="button"
      aria-label="Open portfolio"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
        {/* Book body */}
        <div
          className="absolute inset-0 rounded-sm overflow-hidden"
          style={{
            background: '#16141c',
            boxShadow:
              '10px 10px 30px rgba(0,0,0,0.7), 2px 2px 6px rgba(0,0,0,0.4), inset -2px 0 5px rgba(255,255,255,0.03)',
          }}
        >
          {/* Spine highlight on left — very subtle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-4"
            style={{
              background:
                'linear-gradient(to right, rgba(255,255,255,0.025), transparent)',
            }}
          />
          {/* Spine edge — just a hint of a seam */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          />

          {/* Outer border */}
          <div
            className="absolute inset-[14px] rounded-sm pointer-events-none"
            style={{ border: '1px solid rgba(175, 155, 118, 0.18)' }}
          />
          {/* Inner border */}
          <div
            className="absolute inset-[22px] rounded-sm pointer-events-none"
            style={{ border: '1px solid rgba(175, 155, 118, 0.09)' }}
          />

          {/* Corner brackets */}
          <CornerBracket pos="tl" />
          <CornerBracket pos="tr" />
          <CornerBracket pos="bl" />
          <CornerBracket pos="br" />

          {/* Central title block */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 gap-5">
            {/* Top rule */}
            <div
              className="w-3/4"
              style={{
                height: 1,
                background:
                  'linear-gradient(to right, transparent, rgba(175, 155, 118, 0.32), transparent)',
              }}
            />

            {/* Title */}
            <h1
              className="font-rowan text-center leading-snug"
              style={{
                color: '#e8e2d6',
                fontSize: '1.7rem',
                fontWeight: 400,
                letterSpacing: '0.06em',
                textShadow: '0 2px 14px rgba(0,0,0,0.9)',
              }}
            >
              {data.meta.title}
            </h1>

            {/* Subtitle */}
            <p
              className="font-author text-center tracking-[0.18em] uppercase"
              style={{ color: 'rgba(180, 162, 132, 0.65)', fontSize: '0.6rem' }}
            >
              Waterloo BME Student
            </p>

            {/* Ornament */}
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: 28,
                  height: 1,
                  background: 'rgba(160, 140, 108, 0.35)',
                }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'rgba(175, 155, 118, 0.45)' }}
              />
              <div
                style={{
                  width: 28,
                  height: 1,
                  background: 'rgba(160, 140, 108, 0.35)',
                }}
              />
            </div>

            {/* Bottom rule */}
            <div
              className="w-3/4"
              style={{
                height: 1,
                background:
                  'linear-gradient(to right, transparent, rgba(175, 155, 118, 0.32), transparent)',
              }}
            />
          </div>

          {/* Open hint — fades in on hover */}
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span
              className="font-author text-xs tracking-[0.2em] uppercase"
              style={{ color: 'rgba(195, 178, 148, 0.7)' }}
            >
              open
            </span>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path
                d="M1 1L6 6L11 1"
                stroke="rgba(195, 178, 148, 0.7)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
    </div>
  )
}
