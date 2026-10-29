import { ITEMS } from '../desktop-state'
import { useOs } from '../os-context'

export default function Trash() {
  const os = useOs()
  return (
    <>
      <div className="toolbar"><div className="crumb">Trash</div></div>
      {os.trashed.length ? (
        <ul className="trash-list">
          {os.trashed.map(id => (
            <li key={id}>
              <span>{ITEMS.find(i => i.id === id)?.label}</span>
              <button type="button" className="btn ghost" onClick={() => os.restore(id)}>Put back</button>
            </li>
          ))}
        </ul>
      ) : <p className="empty-note">Empty. Drag anything from the desktop here.</p>}
    </>
  )
}
