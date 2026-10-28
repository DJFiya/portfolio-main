// Map desk-item type → game-mode HUD label (drives the per-item floating chip in
// the overlay). null = item gets the global glow but no chip.
export function gameLabelFor(type: string): { label: string; variant: string } | null {
  if (type === 'diamond-sword') return { label: 'LEGENDARY', variant: 'rare'   }
  if (type === 'poem')          return { label: 'QUEST',     variant: 'quest'  }
  if (type.startsWith('dice-')) return { label: 'ROLL',      variant: 'action' }
  if (type === 'mug')           return { label: '+10 HP',    variant: 'heal'   }
  if (type === 'terminal')      return { label: 'HACK',      variant: 'tech'   }
  if (type === 'laptop')        return { label: 'INTERFACE', variant: 'tech'   }
  if (type === 'controller')    return { label: 'ACTIVE',    variant: 'active' }
  if (type === 'vinyl' || type === 'cassette') return { label: 'AUDIO', variant: 'audio' }
  if (type === 'poster')        return { label: 'LORE',      variant: 'lore'   }
  return null
}
