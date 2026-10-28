import type { SteamParticle } from './useCoffeeMug'

export function CoffeeSteam({ steam }: { steam: SteamParticle[] }) {
  return (
    <div className="coffee-steam-layer">
      {steam.map(s => (
        <span
          key={s.id}
          className="coffee-steam-particle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size * 1.6,
            animationDuration: `${s.dur}s`,
            ['--steam-drift' as string]: `${s.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export function CoffeeBlink() {
  return (
    <div className="coffee-blink-overlay">
      <div className="coffee-eyelid coffee-eyelid--top" />
      <div className="coffee-eyelid coffee-eyelid--bottom" />
    </div>
  )
}
