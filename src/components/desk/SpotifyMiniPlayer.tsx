import SpotifyLogo from './SpotifyLogo'
import { StopIcon } from '../icons'

// ── Spotify mini-player (bottom-left, slides in when cassette is active) ──────
export default function SpotifyMiniPlayer({ playlistId, onStop }: { playlistId: string | null; onStop: () => void }) {
  const hasPlaylist = playlistId !== null

  return (
    <div className="cassette-player">
      <div className="cassette-player-header">
        <span className="cassette-player-now">
          <span className="cassette-player-dot" />
          Now Playing
        </span>
        <span className="cassette-player-brand">
          <SpotifyLogo size={14} />
          Spotify
        </span>
        <button className="cassette-player-stop" onClick={onStop} aria-label="Stop"><StopIcon /></button>
      </div>
      {hasPlaylist ? (
        <iframe
          className="cassette-player-frame"
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&autoplay=1&theme=0`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify player"
        />
      ) : (
        <div className="cassette-player-placeholder">
          <p>Playlist unavailable</p>
        </div>
      )}
    </div>
  )
}
