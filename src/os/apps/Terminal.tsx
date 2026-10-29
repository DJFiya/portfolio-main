import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { CONTACTS, EMAIL, PROJECTS, ROLES, WALLS } from '../content'
import { useOs } from '../os-context'
import type { LaunchArg } from './Projects'
import './terminal.css'

type Out = [string, string]

export default function Terminal() {
  const os = useOs()
  const [lines, setLines] = useState<Out[]>([['ok', 'DaevikOS terminal. Type help.']])
  const [value, setValue] = useState('')
  const hist = useRef<string[]>([])
  const hi = useRef(0)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { input.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => {
    const body = box.current?.parentElement
    if (body) body.scrollTop = body.scrollHeight
  }, [lines])

  const run = (raw: string) => {
    const out: Out[] = [['dim', 'daevik ~ % ' + raw]]
    const say = (t: string, c = '') => out.push([c, t])
    const cmd = raw.trim(), lc = cmd.toLowerCase()
    const [verb, ...rest] = lc.split(/\s+/), arg = rest.join(' ')
    if (!cmd) { /* blank line, just echo the prompt */ }
    else if (verb === 'clear') { setLines([]); return }
    else if (verb === 'help') say('about · ls · open <app> · projects · career · contact · launch <project> · sip · wallpaper <name> · clear\napps: ' + os.appIds.join(', '))
    else if (verb === 'about') say('Daevik Jain\nrole       Software Engineer, Courtyard AI\nschool     University of Waterloo, BME with the SE option\nstanding   3.9 GPA\nfocus      AI agents, evals, infrastructure')
    else if (verb === 'ls') say('Projects/  Career/  Sword/  resume.pdf')
    else if (verb === 'open') {
      if (os.appIds.includes(arg)) { os.open(arg); say('opened ' + arg, 'ok') }
      else say(`open: no app called "${arg}". Type help.`, 'warn')
    }
    else if (verb === 'projects') say(PROJECTS.map(p => `${p.name.padEnd(9)} ${p.award}`).join('\n'))
    else if (verb === 'career') say(ROLES.slice(1).reverse().map(r => `${r.when.padEnd(20)} ${r.role}, ${r.org.split(' · ')[0]}`).join('\n'))
    else if (verb === 'contact') say(CONTACTS.map(([l, t]) => `${l.padEnd(9)} ${t}`).join('\n'))
    else if (verb === 'launch') {
      const p = PROJECTS.find(x => x.id === arg || x.name.toLowerCase() === arg)
      if (p) { os.open('projects', { id: p.id, launch: true } satisfies LaunchArg); say('launching ' + p.name, 'ok') }
      else say('launch: pick one of ' + PROJECTS.map(x => x.id).join(', '), 'warn')
    }
    else if (verb === 'sip') {
      const left = os.sip()
      if (left === null) say('The mug is in the Trash.', 'warn')
      else say(left === 0 ? 'Mug empty. Blink and it refills.' : `${left} sips left.`, 'ok')
    }
    else if (verb === 'wallpaper') {
      const i = WALLS.findIndex(x => x[0].toLowerCase() === arg)
      if (i >= 0) { os.setWall(i); say('wallpaper set to ' + WALLS[i][0], 'ok') }
      else say('wallpapers: ' + WALLS.map(x => x[0].toLowerCase()).join(', '), 'warn')
    }
    else if (lc === 'sudo hire daevik') say('Granted. This terminal cannot send email, so here is the address: ' + EMAIL, 'ok')
    else if (verb === 'sudo') say('sudo: nice try.', 'warn')
    else say(verb + ': command not found. Type help.', 'warn')
    setLines(ls => [...ls, ...out].slice(-120))
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = hist.current
    if (e.key === 'Enter') {
      if (value.trim()) { h.push(value); hi.current = h.length }
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp' && h.length) {
      hi.current = Math.max(0, hi.current - 1); setValue(h[hi.current]); e.preventDefault()
    } else if (e.key === 'ArrowDown' && h.length) {
      hi.current = Math.min(h.length, hi.current + 1); setValue(h[hi.current] ?? ''); e.preventDefault()
    }
  }

  return (
    <div ref={box} onPointerUp={e => { if (!(e.target as HTMLElement).closest('a, button')) input.current?.focus({ preventScroll: true }) }} style={{ minHeight: '100%' }}>
      <div className="term" aria-live="polite">
        {lines.map(([c, t], i) => <div key={i} className={c}>{t}</div>)}
      </div>
      <div className="term-in">
        <label htmlFor="term-cmd">daevik ~ %</label>
        <input id="term-cmd" ref={input} autoComplete="off" spellCheck={false} value={value} onChange={e => setValue(e.target.value)} onKeyDown={onKey} />
      </div>
    </div>
  )
}
