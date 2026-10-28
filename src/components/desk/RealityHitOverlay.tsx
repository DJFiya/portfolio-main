export interface RealityShard {
  id: number
  x: number
  y: number
  size: number
  driftX: number
  driftY: number
  spin: number
  delay: number
}

export interface RealityHitBurst {
  left: number
  top: number
  width: number
  height: number
  shards: RealityShard[]
  tick: number
}

export default function RealityHitOverlay({
  burst,
}: {
  burst: RealityHitBurst | null
}) {
  return (
    <div className="reality-hit-overlay" aria-hidden="true">
      {burst && (
        <>
          {burst.shards.map((s) => (
            <span
              key={`${burst.tick}-${s.id}`}
              className="reality-hit-shard"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                ['--shard-dx' as string]: `${s.driftX}px`,
                ['--shard-dy' as string]: `${s.driftY}px`,
                ['--shard-spin' as string]: `${s.spin}deg`,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
