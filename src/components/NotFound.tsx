import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../hooks/useMediaQuery'

const LINE_RULES = {
  backgroundImage:
    'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.045) 27px, rgba(0,0,0,0.045) 28px)',
  backgroundPositionY: '44px',
}

// Ragged right edge for a strip of paper, as a clip-path polygon. A seeded
// generator keeps the tear identical on every visit: mostly small jitter,
// with the occasional deeper bite where the paper ripped unevenly.
const TEAR = (() => {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: 72 }, () => {
    const r = rand()
    return r < 0.12 ? rand() * 0.45 : 0.55 + rand() * 0.45
  })
})()
const tearPath = (minPct: number) => {
  const step = 100 / (TEAR.length - 1)
  const edge = TEAR.map((t, i) => `${(minPct + (100 - minPct) * t).toFixed(1)}% ${(i * step).toFixed(2)}%`)
  return `polygon(0 0, ${edge.join(', ')}, 0 100%)`
}

// Vercel serves index.html (200) for every path, so tell crawlers this one
// isn't a real page and title the tab accordingly.
function useNotFoundMeta() {
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Page not found · Daevik Jain'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => {
      document.title = prevTitle
      robots.remove()
    }
  }, [])
}

function TornPage({ tornEdge }: { tornEdge: boolean }) {
  return (
    <div
      className="relative h-full flex flex-col paper-texture"
      style={{
        background: '#f0ede8',
        width: 380,
        maxWidth: '100%',
        clipPath: tornEdge ? tearPath(96) : undefined,
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={LINE_RULES} />

      <div className="relative flex flex-col items-center justify-center flex-1 px-10 gap-4 text-center">
        <span className="font-rosaline text-ink-500 tracking-widest select-none" style={{ fontSize: '1rem' }}>
          404
        </span>
        <h1
          className="font-rosaline text-ink-900 leading-tight"
          style={{ fontSize: '2.4rem', fontWeight: 400 }}
        >
          Torn Out
        </h1>
        <p className="font-author text-ink-600 leading-relaxed" style={{ fontSize: '0.85rem', maxWidth: '24ch' }}>
          Whatever was on this page didn't make it into the book.
        </p>
        <Link
          to="/"
          className="font-author underline underline-offset-4 decoration-1 hover:decoration-2 focus-visible:decoration-2"
          style={{ color: 'rgb(30,79,160)', fontSize: '0.85rem' }}
        >
          Back to the cover
        </Link>
      </div>
    </div>
  )
}

export default function NotFound() {
  useNotFoundMeta()
  const isMobile = useMediaQuery('(max-width: 900px)')

  if (isMobile) {
    return (
      <main className="relative z-30 px-3" style={{ width: 'min(380px, calc(100vw - 24px))', height: 490 }}>
        <div className="h-full shadow-[0_12px_36px_rgba(0,0,0,0.52)]">
          <TornPage tornEdge />
        </div>
      </main>
    )
  }

  return (
    <main
      className="relative flex"
      style={{ height: 490, filter: 'drop-shadow(10px 10px 24px rgba(0,0,0,0.6))' }}
    >
      <TornPage tornEdge={false} />
      {/* The missing right page: the dark board shows through, with the
          ragged stub of paper still caught in the binding. */}
      <div className="relative" style={{ width: 380, background: '#111111' }}>
        {/* inline position: .paper-texture forces position: relative */}
        <div
          className="paper-texture"
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 26, background: '#faf8f5', clipPath: tearPath(25) }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 pointer-events-none"
          style={{ width: 10, background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)' }}
        />
      </div>
    </main>
  )
}
