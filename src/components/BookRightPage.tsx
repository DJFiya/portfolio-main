import type { ReactNode } from 'react'

const LINE_RULES = {
  backgroundImage:
    'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.04) 27px, rgba(0,0,0,0.04) 28px)',
  backgroundPositionY: '44px',
}

export default function BookRightPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-full flex flex-col paper-texture" style={{ background: '#faf8f5' }}>
      {/* Line rules */}
      <div className="absolute inset-0 pointer-events-none" style={LINE_RULES} />

      {/* Content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto px-6 py-8">{children}</div>

      {/* Page number */}
      <div className="relative pb-2 flex justify-center">
        <span className="font-author text-ink-300" style={{ fontSize: '10px' }}>3</span>
      </div>
    </div>
  )
}
