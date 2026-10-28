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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.506 17.306a.748.748 0 01-1.03.25c-2.819-1.723-6.365-2.112-10.542-1.157a.748.748 0 01-.354-1.453c4.573-1.047 8.492-.595 11.676 1.33a.748.748 0 01.25 1.03zm1.47-3.27a.936.936 0 01-1.288.308c-3.226-1.982-8.143-2.556-11.963-1.398a.937.937 0 01-.543-1.79c4.358-1.322 9.776-.682 13.487 1.593a.936.936 0 01.308 1.288zm.126-3.405C15.495 8.322 9.56 8.12 6.174 9.15a1.122 1.122 0 11-.65-2.148c3.9-1.18 10.387-.952 14.482 1.564a1.122 1.122 0 11-1.154 1.935l-.75-.68z" />
          </svg>
          Spotify
        </span>
        <button className="cassette-player-stop" onClick={onStop} aria-label="Stop">■</button>
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
          <p>Add playlist IDs to<br /><code>CASSETTE_PLAYLIST_IDS</code></p>
        </div>
      )}
    </div>
  )
}
