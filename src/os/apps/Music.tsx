import { useState } from 'react'
import { NextGlyph, PrevGlyph } from '../icons'
import './media.css'

// [name, Spotify link, cassette label colour]
const PLAYLISTS: [string, string, string][] = [
  ['All Good', 'https://open.spotify.com/playlist/6pZfvyZycC0acnbzQI858P', '#C2562E'],
  ['Soft Angels', 'https://open.spotify.com/playlist/5UqZrSvzRRkjgTBMsRchp3', '#5C6FB0'],
  ['Nostalgia', 'https://open.spotify.com/playlist/50fijFYY5h0nTi6QeTFWOA', '#7A6A4A'],
]

function Reel({ cx }: { cx: number }) {
  return (
    <g className="reel">
      <circle cx={cx} cy="76" r="15" fill="#111" stroke="#888" strokeWidth="2" />
      <path d={`M${cx} 63v26M${cx - 13} 76h26`} stroke="#888" strokeWidth="2" />
    </g>
  )
}

export default function Music() {
  const [sel, setSel] = useState(0)
  const [name, url, col] = PLAYLISTS[sel]
  const step = (d: number) => setSel(s => (s + d + PLAYLISTS.length) % PLAYLISTS.length)
  return (
    <div className="media">
      <div className="media-main">
        <div className="stage">
          <div className="deck spin">
            <svg width="220" height="140" viewBox="0 0 170 110" aria-hidden="true">
              <rect x="3" y="3" width="164" height="104" rx="8" fill="#2A2C2E" stroke="#555" strokeWidth="2" />
              <rect x="22" y="16" width="126" height="36" rx="3" fill={col} />
              <text x="85" y="39" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="13" fill="#FFF">{name}</text>
              <Reel cx={55} />
              <Reel cx={115} />
            </svg>
            <h4>{name}</h4>
            <p>Public playlist by Poetist</p>
            <a className="listen" href={url} target="_blank" rel="noopener">Listen on Spotify</a>
          </div>
        </div>
        <div className="transport">
          <button type="button" className="tp sm" aria-label="Previous playlist" onClick={() => step(-1)}><PrevGlyph /></button>
          <button type="button" className="tp sm" aria-label="Next playlist" onClick={() => step(1)}><NextGlyph /></button>
          <span className="ttime" style={{ textAlign: 'left' }}>Playlist {sel + 1} of {PLAYLISTS.length}</span>
        </div>
      </div>
      <nav className="plist" aria-label="Playlists">
        <h3>Playlists</h3>
        {PLAYLISTS.map(([n, , c], i) => (
          <button key={n} type="button" aria-current={i === sel} onClick={() => setSel(i)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: 'inherit', fontWeight: 600 }}><i className="sw" style={{ background: c }} />{n}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
