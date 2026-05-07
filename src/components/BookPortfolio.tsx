import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import BookCover from './BookCover'
import BookSpread from './BookSpread'
import ExperiencesSpread from './spreads/ExperiencesSpread'
import ProjectsSpread from './spreads/ProjectsSpread'
import ClubsSpread from './spreads/ClubsSpread'
import LinksSpread from './spreads/LinksSpread'

// ─── Spread registry ─────────────────────────────────────────────────────────

const SPREADS = [
  { path: '/experience', chapterNum: 'I',  chapterTitle: 'Experience', Component: ExperiencesSpread },
  { path: '/projects',   chapterNum: 'II', chapterTitle: 'Projects',   Component: ProjectsSpread   },
  { path: '/clubs',      chapterNum: 'III', chapterTitle: 'Clubs',     Component: ClubsSpread      },
  { path: '/links',      chapterNum: 'IV', chapterTitle: 'Links',      Component: LinksSpread      },
] as const

const CLOSED = { width: 300, height: 420 }
const OPEN   = { width: 760, height: 490 }

// ─── Page flip variants ───────────────────────────────────────────────────────

const flipVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 22 : -22,
    rotateY: dir > 0 ? 12 : -12,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { duration: 0.42, ease: 'easeOut' },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -22 : 22,
    rotateY: dir > 0 ? -12 : 12,
    transition: { duration: 0.28, ease: 'easeIn' },
  }),
}

const fadeVariants = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3 } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookPortfolio() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const prefersReduced = useReducedMotion()
  const [direction, setDirection] = useState(1)

  const spreadIndex = SPREADS.findIndex(s => s.path === location.pathname)
  const isOpen  = spreadIndex !== -1
  const spread  = isOpen ? SPREADS[spreadIndex] : null

  // Navigation handlers
  const open  = () => { setDirection(1);  navigate('/experience') }
  const close = () => { setDirection(-1); navigate('/') }

  const goNext = () => {
    if (spreadIndex < SPREADS.length - 1) {
      setDirection(1)
      navigate(SPREADS[spreadIndex + 1].path)
    }
  }

  const goPrev = () => {
    if (spreadIndex > 0) {
      setDirection(-1)
      navigate(SPREADS[spreadIndex - 1].path)
    } else {
      close()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && isOpen && spreadIndex < SPREADS.length - 1) {
        setDirection(1)
        navigate(SPREADS[spreadIndex + 1].path)
      }
      if (e.key === 'ArrowLeft' && isOpen) {
        setDirection(-1)
        if (spreadIndex > 0) navigate(SPREADS[spreadIndex - 1].path)
        else navigate('/')
      }
      if (e.key === 'Escape' && isOpen) navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spreadIndex, isOpen, navigate])

  const prevLabel =
    isOpen ? (spreadIndex === 0 ? 'Cover' : SPREADS[spreadIndex - 1].chapterTitle) : ''
  const nextLabel =
    isOpen && spreadIndex < SPREADS.length - 1 ? SPREADS[spreadIndex + 1].chapterTitle : ''

  const variants = prefersReduced ? fadeVariants : flipVariants

  // Spread component resolved to uppercase variable for JSX
  const SpreadComponent = spread?.Component ?? null

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={isOpen ? OPEN : CLOSED}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{ perspective: 1200 }}
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {!isOpen ? (
          /* ── COVER ─────────────────────────────────────── */
          <motion.div
            key="cover"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.38 } }}
            exit={
              prefersReduced
                ? { opacity: 0, transition: { duration: 0.2 } }
                : { opacity: 0, rotateY: -18, scale: 0.95, transition: { duration: 0.35 } }
            }
          >
            <BookCover onOpen={open} />
          </motion.div>
        ) : (
          /* ── SPREAD ─────────────────────────────────────── */
          <motion.div
            key={location.pathname}
            className="absolute inset-0"
            custom={direction}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants={variants as any}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <BookSpread
              chapterNum={spread!.chapterNum}
              chapterTitle={spread!.chapterTitle}
              onPrev={goPrev}
              onNext={goNext}
              canGoNext={spreadIndex < SPREADS.length - 1}
              prevLabel={prevLabel}
              nextLabel={nextLabel}
            >
              {SpreadComponent && <SpreadComponent />}
            </BookSpread>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
