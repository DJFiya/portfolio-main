import { useEffect, useState } from 'react'
import { CONTACTS, EMAIL } from '../content'
import { Report, type Line } from './Instrument'
import './instrument.css'

export default function Contact() {
  const [open, setOpen] = useState(false)
  const [copy, setCopy] = useState('Copy email')

  useEffect(() => {
    if (copy === 'Copy email') return
    const t = setTimeout(() => setCopy('Copy email'), 1600)
    return () => clearTimeout(t)
  }, [copy])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopy('Copied')
    } catch {
      setCopy(EMAIL)
    }
  }

  const lines: Line[] = open
    ? [['h', 'Daevik Jain'], ['a', 'Software Engineer, Courtyard AI'], ['', ''], ...CONTACTS.flatMap(([l, t]): Line[] => [['k', l], ['', t]])]
    : [['k', 'Channel closed.'], ['', 'Flip the Channel switch to open it, or use the keys below.']]

  return (
    <div className="ins">
      <div className="ins-screens" style={{ gridTemplateColumns: 'minmax(0, 1fr)', minHeight: 200 }}>
        <Report title={open ? 'Comms · channel open' : 'Comms'} lines={lines} links={open ? CONTACTS.slice(0, 3).map(([l, , u]) => [l, u]) : []} />
      </div>
      <div className="hw">
        <span className="plate">Comms</span>
        <button type="button" className="tog" aria-pressed={open} onClick={() => setOpen(o => !o)}>
          <span className="base"><span className="lever" /></span>
          <span className="t"><b>Channel</b><span>{open ? 'Open' : 'Closed'}</span></span>
        </button>
        <div className="lamps" aria-hidden="true"><span className={`lamp${open ? ' on' : ''}`}>Comms</span></div>
        <button type="button" className="push" style={{ marginLeft: 'auto' }} onClick={onCopy}>{copy}</button>
      </div>
      <div className="hw keys">
        {CONTACTS.map(([l, , u]) => <a key={l} className="push" href={u} {...(u.startsWith('mailto') ? {} : { target: '_blank', rel: 'noopener' })}>{l}</a>)}
      </div>
    </div>
  )
}
