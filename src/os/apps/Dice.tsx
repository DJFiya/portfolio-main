import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './games.css'

const SIDES = [6, 12, 20] as const
type Side = typeof SIDES[number]

function Shape({ sides }: { sides: Side }) {
  if (sides === 6) return <rect x="10" y="10" width="80" height="80" rx="14" fill="#2C343A" stroke="#D5DCDF" strokeWidth="2.5" />
  if (sides === 12) {
    return (
      <>
        <path d="M50 5l27 9 17 23v26L77 86 50 95 23 86 6 63V37l17-23z" fill="#2C343A" stroke="#D5DCDF" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 22l20 14-8 24H38l-8-24z" fill="none" stroke="#7E8C93" strokeWidth="1.5" />
      </>
    )
  }
  return (
    <>
      <path d="M50 4L92 28v44L50 96 8 72V28z" fill="#2C343A" stroke="#D5DCDF" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 4L72 40H28zM28 40L8 72M72 40l20 32M28 40l22 38 22-38M50 78v18" fill="none" stroke="#7E8C93" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  )
}

export default function Dice() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [vals, setVals] = useState<Record<Side, number>>({ 6: 6, 12: 12, 20: 20 })
  const [rolling, setRolling] = useState<Side[]>([])
  const [total, setTotal] = useState('')
  // Dice start on their max face; crits only show once a die has landed
  const [landed, setLanded] = useState<Side[]>([])
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const roll = (dice: Side[], showTotal = false) => {
    const todo = dice.filter(s => !rolling.includes(s))
    if (!todo.length) return
    const next = Object.fromEntries(todo.map(s => [s, 1 + Math.floor(Math.random() * s)]))
    setRolling(r => [...r, ...todo])
    timers.current.push(window.setTimeout(() => {
      setRolling(r => r.filter(s => !todo.includes(s)))
      setVals(v => ({ ...v, ...next }))
      setLanded(l => [...new Set([...l, ...todo])])
      if (showTotal) setTotal(`Total ${SIDES.reduce((a, s) => a + (next[s] ?? vals[s]), 0)} of a possible 38`)
    }, reduce ? 0 : 620))
  }

  return (
    <div className="dice-app">
      <div className="dice-row">
        {SIDES.map(s => {
          const v = vals[s], done = !rolling.includes(s) && landed.includes(s)
          const crit = done && v === s ? 'hit' : done && v === 1 ? 'fail' : ''
          return (
            <button key={s} type="button" className={`die${rolling.includes(s) ? ' rolling' : ''}`} aria-label={`Roll the d${s}`} onClick={() => roll([s])}>
              <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
                <Shape sides={s} />
                <text x="50" y={s === 20 ? 66 : 58} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="24" fill="#EEF1F2">{v}</text>
              </svg>
              <span>d{s}</span>
              <span className={`crit${crit ? ' ' + crit : ''}`} aria-live="polite">{crit === 'hit' ? 'Critical hit' : crit === 'fail' ? 'Critical fail' : ''}</span>
            </button>
          )
        })}
      </div>
      <button type="button" className="btn ghost" onClick={() => roll([...SIDES], true)}>Roll all</button>
      <p className="dice-total" aria-live="polite">{total}</p>
    </div>
  )
}
