const POSTER_TITLES: Record<string, string> = {
  'ATLA': 'Avatar: The Last Airbender',
  'Dead Poets': 'Dead Poets Society',
  'Good Will Hunting': 'Good Will Hunting',
  'Invincible': 'Invincible',
}

// Accessible name for each clickable desk item, phrased as what clicking does;
// undefined for purely decorative items.
export function actionLabelFor(type: string, label?: string): string | undefined {
  if (type.startsWith('dice-')) return `Roll the ${type.slice('dice-'.length)}`
  if (type === 'poster') return label && POSTER_TITLES[label] ? `${POSTER_TITLES[label]} poster` : undefined
  if (type === 'vinyl') return 'Open my Spotify profile'
  if (type === 'cassette') return 'Play one of my playlists'
  if (type === 'laptop') return 'Type on the laptop'
  if (type === 'terminal') return 'Run the terminal'
  if (type === 'poem') return 'Read a verse'
  if (type === 'mug') return 'Sip the coffee'
  if (type === 'controller') return 'Game mode'
  if (type === 'diamond-sword') return 'Open the sword boss fight'
  return undefined
}
