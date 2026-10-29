import { WALLS } from '../content'
import { useOs } from '../os-context'

export default function Settings() {
  const os = useOs()
  return (
    <div className="set">
      <section>
        <h3>Wallpaper</h3>
        <div className="row">
          {WALLS.map(([n, c], i) => (
            <button key={n} type="button" className="sw" style={{ background: c }} aria-label={n} aria-pressed={os.wall === i} onClick={() => os.setWall(i)} />
          ))}
        </div>
      </section>
      <section>
        <h3>Desktop</h3>
        <div className="row">
          <button type="button" className="btn ghost" onClick={os.newNote}>New sticky note</button>
          <button type="button" className="btn ghost" onClick={os.resetDesk}>Clean up desktop</button>
        </div>
      </section>
      <section>
        <h3>About DaevikOS</h3>
        <p>Built by Daevik Jain in React and TypeScript. Windows drag by their title bars and resize from the corner. Desktop items drag anywhere; drop one on the Trash to throw it out. Right-click the desktop for more.</p>
      </section>
    </div>
  )
}
