const LINE_RULES = {
  backgroundImage:
    'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.045) 27px, rgba(0,0,0,0.045) 28px)',
  backgroundPositionY: '44px',
}

interface BookLeftPageProps {
  chapterNum: string
  chapterTitle: string
}

export default function BookLeftPage({ chapterNum, chapterTitle }: BookLeftPageProps) {
  return (
    <div className="relative w-full h-full flex flex-col paper-texture" style={{ background: '#f0ede8' }}>
      {/* Line rules */}
      <div className="absolute inset-0 pointer-events-none" style={LINE_RULES} />

      {/* Chapter content — vertically centered */}
      <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-4 select-none">
        <div
          style={{
            width: 40,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(30,79,160,0.35), transparent)',
          }}
        />
        <span className="font-rosaline text-ink-400 tracking-widest" style={{ fontSize: '1rem' }}>
          {chapterNum}
        </span>
        <h2
          className="font-rosaline text-ink-900 text-center leading-tight"
          style={{ fontSize: '2.4rem', fontWeight: 400 }}
        >
          {chapterTitle}
        </h2>
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 1, background: 'rgba(30,79,160,0.3)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(30,79,160,0.45)' }} />
          <div style={{ width: 22, height: 1, background: 'rgba(30,79,160,0.3)' }} />
        </div>
      </div>

      {/* Page number */}
      <div className="relative pb-2 flex justify-center">
        <span className="font-author text-ink-300" style={{ fontSize: '10px' }}>2</span>
      </div>
    </div>
  )
}
