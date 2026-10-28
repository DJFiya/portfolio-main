import type { NoteParticle } from './useCassette'

export default function CassetteNotes({ notes }: { notes: NoteParticle[] }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998, overflow: 'visible' }}>
      {notes.map(n => (
        <div
          key={n.id}
          className="cassette-note"
          style={{
            left:              n.x,
            top:               n.y,
            fontSize:          n.size,
            color:             n.color,
            animationDuration: `${n.dur}s`,
            ['--note-drift' as string]: `${n.drift}px`,
            ['--note-spin'  as string]: `${n.spin}deg`,
          }}
        >
          {n.glyph}
        </div>
      ))}
    </div>
  )
}
