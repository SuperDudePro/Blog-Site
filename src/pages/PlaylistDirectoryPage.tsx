import { useEffect, useState } from 'react';
import { getPostsForSection, loadPostBySlug } from '../content/loadPosts';
import type { BlogPost } from '../content/postTypes';
import { SiteLink } from '../components/SiteLink';
import { postPath } from '../routes';
import skull from '../assets/playlist-skull-transparent.webp';
import './PlaylistDirectoryPage.css';

type Category = 'Year' | 'Era' | 'Artist' | 'Straight Greats' | 'Misc';
type Playlist = { key: string; label?: string; youtube?: string; music?: string };
type Entry = { post: BlogPost; playlists: Playlist[]; artists: string[]; category: Category };
const musicPosts = getPostsForSection('music-playlists');
const artistNames: Record<string, string> = {
  'bad-company': 'Bad Company', 'joe-walsh': 'Joe Walsh', journey: 'Journey',
  'radiohead': 'Radiohead', 'aerosmith': 'Aerosmith', 'rem': 'R.E.M.',
  'rolling-stones': 'The Rolling Stones', 'pink-floyd': 'Pink Floyd', 'the-cult': 'The Cult',
};
const groups: Category[] = ['Year', 'Era', 'Artist', 'Straight Greats', 'Misc'];
function isStraightGreat(post: BlogPost) {
  return /straight-greats|three-straight|3-straight|the-cult-three-great/i.test(post.slug) || /^Straight Greats No\.\s*\d+:/i.test(post.title);
}
function classify(post: BlogPost): Category {
  if (isStraightGreat(post)) return 'Straight Greats';
  if (/^(19|20)\d\d:/.test(post.title) || /the-83-hawaii/.test(post.slug)) return 'Year';
  if (/bad-company|joe-walsh|journey/.test(post.slug)) return 'Artist';
  if (/five-years-before|reconsider-the-80s/.test(post.slug)) return 'Era';
  return 'Misc';
}
function getArtists(post: BlogPost) {
  return Object.entries(artistNames).filter(([key]) => post.slug.includes(key)).map(([, name]) => name);
}
function playlistLabel(anchor: HTMLAnchorElement, post: BlogPost): string {
  if (post.slug !== 'within-a-listen') return '';
  const label = anchor.textContent || '';
  if (/Let Love Rule/i.test(label)) return 'Let Love Rule — Lenny Kravitz';
  if (/Shake Your Money Maker/i.test(label)) return 'Shake Your Money Maker — The Black Crowes';
  return '';
}
function getPlaylists(post: BlogPost): Entry {
  const html = new DOMParser().parseFromString(post.bodyHtml, 'text/html');
  const results = new Map<string, Playlist>();
  const byId = new Map<string, Playlist>();
  for (const anchor of html.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    try {
      const url = new URL(anchor.href);
      if (!['www.youtube.com', 'youtube.com', 'music.youtube.com'].includes(url.hostname)) continue;
      const id = url.searchParams.get('list');
      if (!id) continue;
      const label = playlistLabel(anchor, post);
      const key = label || id;
      let item = results.get(key) || byId.get(id);
      if (!item) {
        item = { key, ...(label ? { label } : {}) };
        results.set(key, item);
      }
      byId.set(id, item);
      if (url.hostname === 'music.youtube.com') item.music = `https://music.youtube.com/playlist?list=${encodeURIComponent(id)}`;
      else item.youtube = `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;
    } catch { /* Skip invalid links. */ }
  }
  return { post, playlists: [...results.values()], category: classify(post), artists: getArtists(post) };
}
function PlaylistCard({ entry }: { entry: Entry }) {
  const [playing, setPlaying] = useState<string[]>([]);
  const { post, playlists } = entry;
  return <article className="playlist-directory__card">
    <div className="playlist-directory__card-heading">
      <h3>{post.title}</h3>
      {entry.artists.length ? <p className="playlist-directory__artist">{entry.artists.join(', ')}</p> : null}
    </div>
    {playlists.map((playlist, index) => {
      const source = playlist.youtube || playlist.music;
      const id = source ? new URL(source).searchParams.get('list') : null;
      return <div className="playlist-directory__player" key={playlist.key}>
        {playlist.label || playlists.length > 1 ? <p className="playlist-directory__player-label">{playlist.label || `Playlist ${index + 1}`}</p> : null}
        {id ? playing.includes(playlist.key) ? <iframe loading="lazy" title={`${post.title}: ${playlist.label || 'playlist'}`} src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(id)}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button className="playlist-directory__preview" type="button" onClick={() => setPlaying(prev => [...prev, playlist.key])} aria-label={`Load player for ${playlist.label || post.title}`}><span aria-hidden="true" className="playlist-directory__play-icon">▶</span><span>Play playlist here</span></button> : null}
        <div className="playlist-directory__actions">
          {playlist.youtube ? <a href={playlist.youtube} target="_blank" rel="noreferrer">YouTube</a> : null}
          {playlist.music ? <a href={playlist.music} target="_blank" rel="noreferrer">YouTube Music</a> : null}
        </div>
      </div>;
    })}
    <div className="playlist-directory__story"><SiteLink href={postPath(post.slug)}>Read the story</SiteLink></div>
  </article>;
}
export function PlaylistDirectoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('Year');
  useEffect(() => {
    let mounted = true;
    void Promise.all(musicPosts.map(p => loadPostBySlug(p.slug))).then(posts => {
      if (mounted) setEntries(posts.filter((p): p is BlogPost => Boolean(p)).map(getPlaylists).filter(e => e.playlists.length));
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const matching = entries.filter(entry => active === 'Artist' ? entry.artists.length > 0 : entry.category === active);
  const sorted = [...matching].sort((a,b) => a.post.title.localeCompare(b.post.title));
  return <div className="page-wrap playlist-directory">
    <header className="playlist-directory__intro">
      <div className="playlist-directory__intro-copy">
        <span className="eyebrow">OOD Playlists</span>
        <h1>Just the playlists.</h1>
        <p className="lead">All the music in one place. Pick a category, press play, and skip the essays unless you want the stories behind the songs.</p>
        <SiteLink className="text-link" href="/section/music-playlists">Browse the music posts</SiteLink>
      </div>
      <img className="playlist-directory__skull" src={skull} alt="A bearded Our Old Dad skull wearing sunglasses, an OOD cap, and headphones while enjoying music." width="340" height="340" />
    </header>
    <nav className="playlist-directory__tabs" aria-label="Playlist categories">
      {groups.map(group => <button type="button" key={group} aria-pressed={active === group} onClick={() => setActive(group)}>{group === 'Misc' ? 'Miscellaneous' : group}</button>)}
    </nav>
    <section className="playlist-directory__content" aria-live="polite">
      <h2>{active === 'Misc' ? 'Miscellaneous' : active}</h2>
      {active === 'Artist' ? <p>Straight Greats also appears here under its artist. Browse the whole series in Straight Greats.</p> : null}
      {loading ? <p>Loading playlists…</p> : sorted.length ? <div className="playlist-directory__grid">{sorted.map(entry => <PlaylistCard key={entry.post.slug} entry={entry} />)}</div> : <p>No playlists in this category yet.</p>}
    </section>
  </div>;
}
