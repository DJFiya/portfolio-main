import { useState, useCallback } from 'react'
import type { DeskProp } from '../../types/portfolio'

const ROLL_MS = 820
const CRIT_MS = 2600

const DICE_MAX: Record<string, number> = {
  'dice-d6': 6, 'dice-d12': 12, 'dice-d20': 20,
}

export type CritState = 'hit' | 'fail'

// Dice start showing their max face; a roll lands on max (crit hit) or 1
// (crit fail) and shows a label for CRIT_MS.
export function useDiceRolls(items: DeskProp[]) {
  const [rolling,    setRolling]    = useState<Set<string>>(new Set())
  const [diceValues, setDiceValues] = useState<Record<string, number>>(
    Object.fromEntries(
      items.filter(i => i.type.startsWith('dice-')).map(i => [i.id, DICE_MAX[i.type]])
    )
  )
  const [criticals,  setCriticals]  = useState<Record<string, CritState>>({})

  const roll = useCallback((id: string, type: string) => {
    if (rolling.has(id)) return
    const max    = DICE_MAX[type] ?? 6
    const result = Math.floor(Math.random() * max) + 1
    setRolling(prev => new Set(prev).add(id))
    setTimeout(() => {
      setDiceValues(prev => ({ ...prev, [id]: result }))
      setRolling(prev => { const s = new Set(prev); s.delete(id); return s })
      const crit: CritState | null = result === max ? 'hit' : result === 1 ? 'fail' : null
      if (crit) {
        setCriticals(prev => ({ ...prev, [id]: crit }))
        setTimeout(() => {
          setCriticals(prev => { const s = { ...prev }; delete s[id]; return s })
        }, CRIT_MS)
      }
    }, ROLL_MS)
  }, [rolling])

  return { rolling, diceValues, criticals, roll }
}
