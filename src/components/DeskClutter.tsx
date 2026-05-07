import type React from 'react'
import { useState, useCallback } from 'react'
import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'

const data = rawData as unknown as PortfolioData

const ROLL_MS  = 820
const CRIT_MS  = 2600

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
}

type CritState = 'hit' | 'fail'

export default function DeskClutter() {
  const [rolling,  setRolling]  = useState<Set<string>>(new Set())
  const [diceValues, setDiceValues] = useState<Record<string, number>>(
    Object.fromEntries(
      data.desk.filter(i => i.type.startsWith('dice-')).map(i => [i.id, DICE_MAX[i.type]])
    )
  )
  const [criticals, setCriticals] = useState<Record<string, CritState>>({})

  const handleRoll = useCallback((id: string, type: string) => {
    if (rolling.has(id)) return
    const max    = DICE_MAX[type] ?? 6
    const result = Math.floor(Math.random() * max) + 1

    setRolling(prev => new Set(prev).add(id))

    setTimeout(() => {
      // Reveal the result only once the die settles
      setDiceValues(prev => ({ ...prev, [id]: result }))
      setRolling(prev => { const s = new Set(prev); s.delete(id); return s })

      const crit: CritState | null =
        result === max ? 'hit' : result === 1 ? 'fail' : null
      if (crit) {
        setCriticals(prev => ({ ...prev, [id]: crit }))
        setTimeout(() => {
          setCriticals(prev => { const s = { ...prev }; delete s[id]; return s })
        }, CRIT_MS)
      }
    }, ROLL_MS)
  }, [rolling])

  return (
    <>
      {data.desk.map((item) => {
        const isDice    = item.type.startsWith('dice-')
        const isRolling = rolling.has(item.id)
        const crit      = criticals[item.id]

        const innerClass = [
          isRolling            ? 'dice-rolling'   : undefined,
          crit === 'hit'       ? 'dice-crit-hit'  : undefined,
          crit === 'fail'      ? 'dice-crit-fail' : undefined,
        ].filter(Boolean).join(' ') || undefined

        return (
          <div
            key={item.id}
            className="absolute select-none desk-item"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              '--item-rotate': `${item.rotate}deg`,
              zIndex: item.zIndex,
              cursor: isDice ? 'pointer' : undefined,
            } as React.CSSProperties}
            onClick={isDice ? () => handleRoll(item.id, item.type) : undefined}
          >
            {crit && (
              <div className={`dice-crit-label dice-crit-label--${crit}`}>
                {crit === 'hit' ? 'CRITICAL HIT' : 'CRITICAL FAIL'}
              </div>
            )}
            <div className={innerClass}>
              <DeskItemSVG type={item.type} label={item.label} diceValue={isRolling ? undefined : diceValues[item.id]} />
            </div>
          </div>
        )
      })}
    </>
  )
}
