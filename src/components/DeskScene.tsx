import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import DeskClutter from './DeskClutter'

export default function DeskScene({ children }: { children: ReactNode }) {
  const [sceneReady, setSceneReady] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSceneReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center desk-grain transition-opacity duration-300"
      style={{ opacity: sceneReady ? 1 : 0, backgroundColor: '#1a1208' }}
    >
      {/* Keep mobile focused on the book only. */}
      {!isMobile ? <DeskClutter /> : null}

      {/* Radial vignette */}
      {!isMobile ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />
      ) : null}

      {/* Book */}
      <div className="relative z-10 flex items-center justify-center py-12">
        {children}
      </div>
    </div>
  )
}
