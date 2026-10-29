import { useState } from 'react';
import type { BlogPost } from '../content/postTypes';
import './YouTubePlaylistPlayers.css';

export type YouTubePlaylist = { id: string; label?: string };

export function extractYouTubePlaylists(post: BlogPost): YouTubePlaylist[] {
  const document = new DOMParser().parseFromString(post.bodyHtml, 'text/html');
  const found = new Map<string, YouTubePlaylist>();
  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    try {
      const url = new URL(anchor.href);
      if (!['youtube.com', 'www.youtube.com', 'music.youtube.com'].includes(url.hostname)) continue;
      const id = url.searchParams.get('list');
      if (!id) continue;
      const anchorLabel = anchor.textContent || '';
      let label: string | undefined;
      if (post.slug === 'within-a-listen') {
        if (/Let Love Rule/i.test(anchorLabel)) label = 'Let Love Rule — Lenny Kravitz';
        else if (/Shake Your Money Maker/i.test(anchorLabel)) label = 'Shake Your Money Maker — The Black Crowes';
      }
      // Prefer the regular YouTube album URL when both Music and YouTube are present.
      const key = label || id;
      if (!found.has(key) || url.hostname !== 'music.youtube.com') found.set(key, { id, ...(label ? { label } : {}) });
    } catch { /* Ignore malformed links. */ }
  }
  return [...found.values()];
}

export function YouTubePlaylistPlayers({ post, playlists, showLinks = false }: {
  post: BlogPost;
  playlists: YouTubePlaylist[];
  showLinks?: boolean;
}) {
  const [playing, setPlaying] = useState<string[]>([]);
  if (!playlists.length) return null;
  return <div className="ood-playlist-players">
    {playlists.map((playlist, index) => {
      const title = playlist.label || (playlists.length > 1 ? `Playlist ${index + 1}` : post.title);
      const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlist.id)}`;
      return <div className="ood-playlist-player" key={playlist.id}>
        {playlist.label || playlists.length > 1 ? <p className="ood-playlist-player__label">{title}</p> : null}
        {playing.includes(playlist.id) ?
          <iframe loading="lazy" title={`${title}: YouTube playlist`}
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlist.id)}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> :
          <button className="ood-playlist-player__preview" type="button"
            onClick={() => setPlaying(previous => [...previous, playlist.id])}
            aria-label={`Load player for ${title}`}>
            <span aria-hidden="true" className="ood-playlist-player__play-icon">▶</span>
            <span>Play playlist here</span>
          </button>}
        {showLinks ? <div className="ood-playlist-player__actions"><a href={url} target="_blank" rel="noreferrer">YouTube</a></div> : null}
      </div>;
    })}
  </div>;
}
