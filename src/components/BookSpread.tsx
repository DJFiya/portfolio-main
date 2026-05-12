import type { ReactNode } from 'react'

interface BookSpreadProps {
  chapterNum: string
  chapterTitle: string
  onPrev: () => void
  onNext: () => void
  canGoNext: boolean
  prevLabel: string
  nextLabel: string
  children: ReactNode
}

const LINE_RULES = {
  backgroundImage:
    'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.045) 27px, rgba(0,0,0,0.045) 28px)',
  backgroundPositionY: '44px',
}

export default function BookSpread({
  chapterNum,
  chapterTitle,
  onPrev,
  onNext,
  canGoNext,
  prevLabel,
  nextLabel,
  children,
}: BookSpreadProps) {
  return (
    <div
      className="relative w-full h-full flex rounded-sm overflow-hidden"
      style={{ boxShadow: '12px 12px 32px rgba(0,0,0,0.7), 3px 3px 8px rgba(0,0,0,0.4)' }}
    >
      {/* ── LEFT HARDCOVER BOARD ─────────────────────────── */}
      <div
        className="flex-shrink-0 z-10"
        style={{
          width: 20,
          background: '#111111',
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.5)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      />
      {/* ── LEFT PAGE ─────────────────────────────────────── */}
      <div
        className="relative flex flex-col w-1/2 h-full paper-texture"
        style={{ background: '#f0ede8' }}
      >
        {/* Line rules */}
        <div className="absolute inset-0 pointer-events-none" style={LINE_RULES} />

        {/* Chapter content — centered vertically */}
        <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-4 select-none">
          {/* Top ornament line */}
          <div
            style={{
              width: 40,
              height: 1,
              background: 'linear-gradient(to right, transparent, rgba(160, 140, 108, 0.32), transparent)',
            }}
          />

          {/* Roman numeral */}
          <span
            className="font-rosaline text-ink-400 tracking-widest"
            style={{ fontSize: '1rem' }}
          >
            {chapterNum}
          </span>

          {/* Chapter title */}
          <h2
            className="font-rosaline text-ink-900 text-center leading-tight"
            style={{ fontSize: '2.4rem', fontWeight: 400 }}
          >
            {chapterTitle}
          </h2>

          {/* Bottom ornament */}
          <div className="flex items-center gap-2">
            <div style={{ width: 22, height: 1, background: 'rgba(160, 140, 108, 0.3)' }} />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: 'rgba(160, 140, 108, 0.45)' }}
            />
            <div style={{ width: 22, height: 1, background: 'rgba(160, 140, 108, 0.3)' }} />
          </div>
        </div>

        {/* Prev nav */}
        <div className="relative px-5 pb-3">
          <button
            onClick={onPrev}
            className="font-author text-ink-400 hover:text-ink-700 transition-colors text-xs tracking-wide flex items-center gap-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-azure-500"
          >
            <span>←</span>
            <span>{prevLabel}</span>
          </button>
        </div>

        {/* Page number */}
        <div className="relative pb-2 flex justify-center">
          <span className="font-author text-ink-300" style={{ fontSize: '10px' }}>
            2
          </span>
        </div>
      </div>

      {/* ── SPINE SHADOW ──────────────────────────────────── */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          background:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.14) 40%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 60%, transparent 100%)',
        }}
      />

      {/* ── RIGHT PAGE ────────────────────────────────────── */}
      <div
        className="relative flex flex-col w-1/2 h-full paper-texture"
        style={{ background: '#faf8f5' }}
      >
        {/* Line rules */}
        <div className="absolute inset-0 pointer-events-none" style={LINE_RULES} />

        {/* Content */}
        <div className="relative flex flex-col flex-1 overflow-y-auto px-6 py-8">
          {children}
        </div>

        {/* Next nav */}
        <div className="relative px-5 pb-3 flex justify-end">
          {canGoNext ? (
            <button
              onClick={onNext}
              className="font-author text-ink-400 hover:text-ink-700 transition-colors text-xs tracking-wide flex items-center gap-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-azure-500"
            >
              <span>{nextLabel}</span>
              <span>→</span>
            </button>
          ) : (
            <span
              className="font-rosaline text-ink-300 italic"
              style={{ fontSize: '11px' }}
            >
              fin.
            </span>
          )}
        </div>

        {/* Page number */}
        <div className="relative pb-2 flex justify-center">
          <span className="font-author text-ink-300" style={{ fontSize: '10px' }}>
            3
          </span>
        </div>
      </div>

      {/* ── RIGHT HARDCOVER BOARD ────────────────────────── */}
      <div
        className="flex-shrink-0 z-10"
        style={{
          width: 20,
          background: '#111111',
          boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.5)',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
        }}
      />
    </div>
  )
}
