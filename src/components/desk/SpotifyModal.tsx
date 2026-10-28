import { useEffect } from 'react'
import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'

const data = rawData as unknown as PortfolioData

// ── Spotify Modal ─────────────────────────────────────────────────────────────
const SPOTIFY_PLAYLISTS = ['Soft Angels', 'All Good', 'Nostalgia']

export default function SpotifyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="spotify-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="spotify-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Spotify profile"
      >
        {/* Header */}
        <div className="spotify-modal-header">
          <span className="spotify-modal-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
            </svg>
            Spotify
          </span>
          <button
            className="spotify-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Vinyl art */}
        <div className="spotify-modal-art">
          <div className="spotify-modal-disc">
            <svg width="72" height="72" viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="43" fill="#111" />
              {[38, 34, 30, 26, 22].map((r) => (
                <circle key={r} cx="44" cy="44" r={r} stroke="#1a1a1a" strokeWidth="1.2" />
              ))}
              <circle cx="44" cy="44" r="16" fill="#121212" />
              <circle cx="44" cy="44" r="14" fill="none" stroke="#1DB954" strokeWidth="0.8" opacity="0.6" />
              <circle cx="44" cy="44" r="2.5" fill="#0d0f14" />
            </svg>
          </div>
        </div>

        {/* Profile info */}
        <div className="spotify-modal-info">
          <p className="spotify-modal-username">Poetist</p>
          <p className="spotify-modal-meta">{SPOTIFY_PLAYLISTS.length} public playlists</p>
        </div>

        {/* Playlists preview */}
        <div className="spotify-modal-playlists">
          {SPOTIFY_PLAYLISTS.map((name) => (
            <div key={name} className="spotify-modal-playlist-chip">
              <span className="spotify-modal-playlist-icon">♪</span>
              {name}
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={data.spotify.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-modal-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
          </svg>
          Open on Spotify
        </a>
      </div>
    </div>
  )
}
