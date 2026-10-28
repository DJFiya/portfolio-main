import { useEffect } from 'react'
import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'
import SpotifyLogo from './SpotifyLogo'
import { CloseIcon, NoteIcon } from '../icons'

const data = rawData as unknown as PortfolioData

// ── Spotify Modal ─────────────────────────────────────────────────────────────
const SPOTIFY_PLAYLISTS = data.spotify.playlists.map(p => p.name)

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
            <SpotifyLogo size={22} />
            Spotify
          </span>
          <button
            className="spotify-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
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
              <NoteIcon className="spotify-modal-playlist-icon" />
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
          <SpotifyLogo size={16} fill="currentColor" />
          Open on Spotify
        </a>
      </div>
    </div>
  )
}
