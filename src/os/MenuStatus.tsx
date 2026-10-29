import { useEffect, useState, useSyncExternalStore } from 'react'

// Battery Status and Network Information are Chromium-only, so neither is in lib.dom
type BatteryManager = EventTarget & { level: number; charging: boolean }
type Connection = EventTarget & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' }
type StatusNavigator = Navigator & { getBattery?: () => Promise<BatteryManager>; connection?: Connection }
const nav = navigator as StatusNavigator

function useBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null)
  useEffect(() => {
    let bm: BatteryManager | null = null
    const read = () => { if (bm) setBattery({ level: bm.level, charging: bm.charging }) }
    nav.getBattery?.().then(b => {
      bm = b
      read()
      b.addEventListener('levelchange', read)
      b.addEventListener('chargingchange', read)
    }).catch(() => { /* blocked by permissions policy: leave it hidden */ })
    return () => {
      bm?.removeEventListener('levelchange', read)
      bm?.removeEventListener('chargingchange', read)
    }
  }, [])
  return battery
}

function subscribeNetwork(onChange: () => void) {
  addEventListener('online', onChange)
  addEventListener('offline', onChange)
  nav.connection?.addEventListener('change', onChange)
  return () => {
    removeEventListener('online', onChange)
    removeEventListener('offline', onChange)
    nav.connection?.removeEventListener('change', onChange)
  }
}

// Signal bars from the browser's own speed estimate; full when it gives none
const BARS = { 'slow-2g': 1, '2g': 1, '3g': 2, '4g': 3 }
const networkBars = () => navigator.onLine ? BARS[nav.connection?.effectiveType ?? '4g'] : 0

function useClock() {
  const read = () => {
    const d = new Date()
    return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}  ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  }
  const [now, setNow] = useState(read)
  useEffect(() => {
    const t = setInterval(() => setNow(read()), 15000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function MenuStatus() {
  const battery = useBattery()
  const bars = useSyncExternalStore(subscribeNetwork, networkBars)
  const clock = useClock()
  const lang = navigator.language.split('-')[0].toUpperCase()

  return (
    <div className="status hide-sm">
      <span className="st" title="Input language" aria-label={`Input language ${navigator.language}`}>{lang}</span>
      <span className="st" title={bars ? 'Online' : 'Offline'} aria-label={bars ? 'Online' : 'Offline'}>
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M1.5 5a11 11 0 0 1 15 0" opacity={bars >= 3 ? 1 : 0.3} />
          <path d="M4.2 7.9a7 7 0 0 1 9.6 0" opacity={bars >= 2 ? 1 : 0.3} />
          <path d="M6.9 10.7a3 3 0 0 1 4.2 0" opacity={bars >= 1 ? 1 : 0.3} />
          {!bars && <path d="M3 1.5l12 11" />}
        </svg>
      </span>
      {battery && (
        <span className="st" title={`Battery ${Math.round(battery.level * 100)}%${battery.charging ? ', charging' : ''}`} aria-label={`Battery ${Math.round(battery.level * 100)} percent${battery.charging ? ', charging' : ''}`}>
          <span aria-hidden="true">{Math.round(battery.level * 100)}%</span>
          <svg width="26" height="14" viewBox="0 0 26 14" fill="none" aria-hidden="true">
            <rect x="1" y="1.5" width="21" height="11" rx="3" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
            <rect x="23" y="5" width="2" height="4" rx="1" fill="currentColor" opacity="0.55" />
            <rect x="3" y="3.5" width={Math.max(1.5, 17 * battery.level)} height="7" rx="1.5" fill={battery.level <= 0.2 && !battery.charging ? '#C8463A' : 'currentColor'} />
            {battery.charging && <path d="M12.5 2.5L9 7.5h3l-1 4 3.5-5h-3z" fill="#F4F4EF" stroke="#15191A" strokeWidth="0.6" strokeLinejoin="round" />}
          </svg>
        </span>
      )}
      <span id="clock" aria-label="Date and time">{clock}</span>
    </div>
  )
}
