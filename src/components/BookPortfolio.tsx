import HTMLFlipBook from 'react-pageflip'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BookPage from './BookPage'
import BookCover from './BookCover'
import BookLeftPage from './BookLeftPage'
import BookRightPage from './BookRightPage'
import BackCover from './BackCover'
import ExperiencesSpread from './spreads/ExperiencesSpread'
import ProjectsSpread from './spreads/ProjectsSpread'
import ClubsSpread from './spreads/ClubsSpread'
import LinksSpread from './spreads/LinksSpread'

// ─── Page map ────────────────────────────────────────────────────────────────
//  0  front cover
//  1  experience left    2  experience right
//  3  projects left      4  projects right
//  5  clubs left         6  clubs right
//  7  links left         8  links right
//  9  back cover

const SPREADS = [
  { chapterNum: 'I',   chapterTitle: 'Experience', Component: ExperiencesSpread },
  { chapterNum: 'II',  chapterTitle: 'Projects',   Component: ProjectsSpread   },
  { chapterNum: 'III', chapterTitle: 'Clubs',      Component: ClubsSpread      },
  { chapterNum: 'IV',  chapterTitle: 'Links',      Component: LinksSpread      },
]

const ROUTE_TO_PAGE: Record<string, number> = {
  '/': 0,
  '/experience': 1,
  '/projects': 3,
  '/clubs': 5,
  '/links': 7,
  '/back': 9,
}

function pageToRoute(page: number): string {
  if (page <= 0) return '/'
  if (page <= 2) return '/experience'
  if (page <= 4) return '/projects'
  if (page <= 6) return '/clubs'
  if (page <= 8) return '/links'
  return '/back'
}

function nextPage(cur: number) {
  if (cur === 0) return 1
  if (cur <= 2) return 3
  if (cur <= 4) return 5
  if (cur <= 6) return 7
  return 9
}
function prevPage(cur: number) {
  if (cur >= 9) return 8
  if (cur >= 7) return 6
  if (cur >= 5) return 4
  if (cur >= 3) return 2
  return 0
}

function slideForPage(page: number) {
  if (page === 0) return -190
  if (page === 9) return 190
  return 0
}

const LOGICAL_PAGES = [0, 1, 3, 5, 7, 9]

function normalizeLogicalPage(page: number) {
  if (page <= 0) return 0
  if (page <= 2) return 1
  if (page <= 4) return 3
  if (page <= 6) return 5
  if (page <= 8) return 7
  return 9
}

function nextLogicalPage(cur: number) {
  const normalized = normalizeLogicalPage(cur)
  const idx = LOGICAL_PAGES.findIndex((p) => p === normalized)
  const safeIdx = idx === -1 ? 0 : idx
  return LOGICAL_PAGES[Math.min(safeIdx + 1, LOGICAL_PAGES.length - 1)]
}

function prevLogicalPage(cur: number) {
  const normalized = normalizeLogicalPage(cur)
  const idx = LOGICAL_PAGES.findIndex((p) => p === normalized)
  const safeIdx = idx === -1 ? 0 : idx
  return LOGICAL_PAGES[Math.max(safeIdx - 1, 0)]
}

function boardStyle(side: 'left' | 'right') {
  return {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: 22,
    [side]: -22,
    background: '#111111',
    boxShadow:
      side === 'left'
        ? 'inset -3px 0 6px rgba(0,0,0,0.45)'
        : 'inset 3px 0 6px rgba(0,0,0,0.45)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookPortfolio() {
  const location = useLocation()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null)

  const initPage = ROUTE_TO_PAGE[location.pathname] ?? 0

  const [currentPage, setCurrentPage] = useState(initPage)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900)
  const [mobileFrameWidth, setMobileFrameWidth] = useState(() =>
    Math.min(380, Math.max(280, window.innerWidth - 24)),
  )

  // slidePage drives the centering slide — set pre-flip so it animates
  // concurrently with the page turn.
  const [slidePage, setSlidePage] = useState(initPage)
  const slideX = slideForPage(slidePage)

  const isProgrammatic = useRef(false)
  const currentPageRef = useRef(initPage)
  const TOTAL = 10

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const updateMobileFrame = () => {
      const nextWidth = Math.min(380, Math.max(280, window.innerWidth - 24))
      setMobileFrameWidth(nextWidth)
    }
    updateMobileFrame()
    window.addEventListener('resize', updateMobileFrame)
    return () => window.removeEventListener('resize', updateMobileFrame)
  }, [])

  const setPageAndRoute = (page: number) => {
    const resolvedPage = isMobile ? normalizeLogicalPage(page) : page
    currentPageRef.current = resolvedPage
    setCurrentPage(resolvedPage)
    setSlidePage(resolvedPage)
    const route = pageToRoute(resolvedPage)
    if (location.pathname !== route) navigate(route, { replace: true })
  }

  // ── Pre-flip setup ────────────────────────────────────────────────────────

  const prepareFlip = (target: number) => {
    setSlidePage(target)
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const flipNext = () => {
    if (isMobile) {
      setPageAndRoute(nextLogicalPage(currentPageRef.current))
      return
    }
    prepareFlip(nextPage(currentPageRef.current))
    book.current?.pageFlip().flipNext()
  }

  const flipPrev = () => {
    if (isMobile) {
      setPageAndRoute(prevLogicalPage(currentPageRef.current))
      return
    }
    prepareFlip(prevPage(currentPageRef.current))
    book.current?.pageFlip().flipPrev()
  }

  const flipTo = (target: number) => {
    if (isMobile) {
      setPageAndRoute(target)
      return
    }
    prepareFlip(target)
    isProgrammatic.current = true
    book.current?.pageFlip().flip(target)
  }

  // ── Flip completion ───────────────────────────────────────────────────────

  const handleFlip = (e: { data: number }) => {
    const page = e.data as number
    currentPageRef.current = page
    setCurrentPage(page)
    setSlidePage(page) // reconcile with actual landing page

    if (isProgrammatic.current) {
      isProgrammatic.current = false
      return
    }
    const route = pageToRoute(page)
    if (location.pathname !== route) navigate(route, { replace: true })
  }

  // ── URL sync (browser back/forward) ──────────────────────────────────────

  useEffect(() => {
    const target = ROUTE_TO_PAGE[location.pathname] ?? 0
    if (isMobile) {
      if (target !== currentPageRef.current) setPageAndRoute(target)
      return
    }
    if (book.current && target !== currentPageRef.current) {
      prepareFlip(target)
      isProgrammatic.current = true
      book.current.pageFlip().flip(target)
    }
  }, [location.pathname, isMobile]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const flipNextRef = useRef(flipNext)
  const flipPrevRef = useRef(flipPrev)
  useEffect(() => {
    flipNextRef.current = flipNext
    flipPrevRef.current = flipPrev
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') flipNextRef.current()
      if (e.key === 'ArrowLeft') flipPrevRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Dot indicator ─────────────────────────────────────────────────────────

  const dotActive = (p: number) =>
    (p === 0 && currentPage === 0) ||
    (p === 1 && currentPage >= 1 && currentPage <= 2) ||
    (p === 3 && currentPage >= 3 && currentPage <= 4) ||
    (p === 5 && currentPage >= 5 && currentPage <= 6) ||
    (p === 7 && currentPage >= 7 && currentPage <= 8) ||
    (p === 9 && currentPage === 9)

  const logicalCurrentPage = normalizeLogicalPage(currentPage)
  const activeSpread = SPREADS.find((_, idx) => logicalCurrentPage === idx * 2 + 1)
  const ActiveSpreadComponent = activeSpread?.Component
  const mobileFrameHeight = Math.round((mobileFrameWidth * 490) / 380)

  return (
    <div className="flex flex-col items-center gap-4">
      {isMobile ? (
        <div className="relative z-30 w-full max-w-[430px] px-3 pointer-events-auto">
          <div
            className="mx-auto rounded-md overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.52)]"
            style={{ width: mobileFrameWidth, height: mobileFrameHeight }}
          >
            {currentPage === 0 ? (
              <BookCover onOpen={flipNext} />
            ) : currentPage === 9 ? (
              <BackCover />
            ) : (
              <BookRightPage>
                <div className="mb-6 pb-4 border-b border-ink-200/40">
                  <p className="font-rosaline text-ink-400 tracking-widest text-base">
                    {activeSpread?.chapterNum}
                  </p>
                  <h2 className="font-rosaline text-ink-900 text-[2rem] leading-tight">
                    {activeSpread?.chapterTitle}
                  </h2>
                </div>
                {ActiveSpreadComponent ? <ActiveSpreadComponent /> : null}
              </BookRightPage>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          animate={{ x: slideX }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          {(() => {
            const bv = slidePage > 0 && slidePage < 9 && currentPage > 0 && currentPage < 9
            return (
              <div style={{ ...boardStyle('left'), opacity: bv ? 1 : 0, transition: bv ? 'opacity 0.2s ease' : 'none' }} />
            )
          })()}

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <HTMLFlipBook
            ref={book}
            width={380}
            height={490}
            size="fixed"
            minWidth={300}
            maxWidth={480}
            minHeight={400}
            maxHeight={600}
            showCover
            drawShadow
            flippingTime={680}
            startPage={initPage}
            useMouseEvents
            onFlip={handleFlip}
            className=""
            style={{}}
            startZIndex={10}
            autoSize
            maxShadowOpacity={0.5}
            mobileScrollSupport={false}
            clickEventForward={false}
            usePortrait={false}
            swipeDistance={0}
            showPageCorners={false}
            disableFlipByClick
          >
            {/* Page 0 — Front cover */}
            <BookPage key="cover">
              <BookCover onOpen={flipNext} />
            </BookPage>

            {/* Pages 1–8 — Four spreads */}
            {SPREADS.map((spread, i) => {
              const SpreadComponent = spread.Component
              return [
                <BookPage key={`left-${i}`}>
                  <BookLeftPage
                    chapterNum={spread.chapterNum}
                    chapterTitle={spread.chapterTitle}
                  />
                </BookPage>,
                <BookPage key={`right-${i}`}>
                  <BookRightPage>
                    <SpreadComponent />
                  </BookRightPage>
                </BookPage>,
              ]
            }).flat()}

            {/* Page 9 — Back cover */}
            <BookPage key="back">
              <BackCover />
            </BookPage>
          </HTMLFlipBook>

          {(() => {
            const bv = slidePage > 0 && slidePage < 9 && currentPage > 0 && currentPage < 9
            return (
              <div style={{ ...boardStyle('right'), opacity: bv ? 1 : 0, transition: bv ? 'opacity 0.2s ease' : 'none' }} />
            )
          })()}
        </motion.div>
      )}

      {/* Navigation row */}
      <div className="relative z-40 isolate flex items-center gap-6 pointer-events-auto touch-manipulation">
        <button
          type="button"
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="font-author text-ink-400 hover:text-ink-200 disabled:opacity-20 disabled:cursor-default transition-colors text-sm tracking-wide"
        >
          ← Prev
        </button>

        <div className="flex items-center gap-2">
          {LOGICAL_PAGES.map((p, idx) => (
            <button
              type="button"
              key={p}
              onClick={() => flipTo(p)}
              className="rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-azure-400"
              style={{
                width: idx === 0 || idx === 5 ? 5 : 6,
                height: idx === 0 || idx === 5 ? 5 : 6,
                background: dotActive(p)
                  ? 'rgba(96,165,250,0.9)'
                  : 'rgba(255,255,255,0.2)',
              }}
              aria-label={['Cover', 'Experience', 'Projects', 'Clubs', 'Links', 'Back'][idx]}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={flipNext}
          disabled={currentPage >= TOTAL - 1}
          className="font-author text-ink-400 hover:text-ink-200 disabled:opacity-20 disabled:cursor-default transition-colors text-sm tracking-wide"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
