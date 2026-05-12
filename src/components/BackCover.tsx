export default function BackCover() {
  return (
    <div
      className="relative w-full h-full"
      style={{
        background: 'linear-gradient(155deg, #181a20 0%, #12141a 55%, #1c1e22 100%)',
        boxShadow: 'inset 2px 0 8px rgba(255,255,255,0.03)',
      }}
    >
      {/* Outer border */}
      <div
        className="absolute inset-[14px] rounded-sm pointer-events-none"
        style={{ border: '1px solid rgba(30,79,160,0.25)' }}
      />
      {/* Inner border */}
      <div
        className="absolute inset-[22px] rounded-sm pointer-events-none"
        style={{ border: '1px solid rgba(30,79,160,0.12)' }}
      />

      {/* Spine edge highlight */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />

      {/* Centered ornament */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        {/* Top rule */}
        <div
          style={{
            width: 48,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.35), transparent)',
          }}
        />

        {/* "fin." */}
        <p
          className="font-rosaline text-center select-none"
          style={{
            color: 'rgba(180,195,230,0.55)',
            fontSize: '1.45rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          fin.
        </p>

        {/* Dot cluster */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(96,165,250,0.3)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(96,165,250,0.45)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(96,165,250,0.3)' }} />
        </div>

        {/* Bottom rule */}
        <div
          style={{
            width: 48,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.35), transparent)',
          }}
        />
      </div>
    </div>
  )
}
