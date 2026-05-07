import type { ReactNode } from 'react'

export default function DeskScene({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full min-h-screen bg-ink-950 overflow-hidden flex items-center justify-center desk-grain">
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />
      <div className="relative z-10 flex items-center justify-center py-12">
        {children}
      </div>
    </div>
  )
}
