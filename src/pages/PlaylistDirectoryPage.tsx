import { useEffect, useState } from 'react';
import { getPostsForSection, loadPostBySlug } from '../content/loadPosts';
import type { BlogPost } from '../content/postTypes';
import { SiteLink } from '../components/SiteLink';
import { postPath } from '../routes';
import './PlaylistDirectoryPage.css';

type Category = 'Year' | 'Era' | 'Artist' | 'Straight Greats' | 'Misc';
type Entry = { post: BlogPost; ids: string[]; musicUrls: string[]; artists: string[]; category: Category };
const musicPosts = getPostsForSection('music-playlists');
const artistNames: Record<string, string> = {
  'bad-company': 'Bad Company', 'joe-walsh': 'Joe Walsh', journey: 'Journey',
  'radiohead': 'Radiohead', 'aerosmith': 'Aerosmith', 'rem': 'R.E.M.',
  'rolling-stones': 'The Rolling Stones', 'pink-floyd': 'Pink Floyd', 'the-cult': 'The Cult',
};
const groups: Category[] = ['Year', 'Era', 'Artist', 'Straight Greats', 'Misc'];

function classify(post: BlogPost): Category {
  if (/^(19|20)\d\d:/.test(post.title) || /the-83-hawaii/.test(post.slug)) return 'Year';
  if (/straight-greats|three-straight/.test(post.slug)) return 'Straight Greats';
  if (/bad-company|joe-walsh|journey/.test(post.slug)) return 'Artist';
  if (/five-years-before|reconsider-the-80s/.test(post.slug)) return 'Era';
  return 'Misc';
}
function getArtists(post: BlogPost): string[] {
  return Object.entries(artistNames).filter(([key]) => post.slug.includes(key)).map(([, value]) => value);
}
function getPlaylists(post: BlogPost): Entry {
  const html = new DOMParser().parseFromString(post.bodyHtml, 'text/html');
  const anchors = [...html.querySelectorAll('a[href]')];
  const ids: string[] = [], musicUrls: string[] = [];
  for (const anchor of anchors) {
    const raw = anchor.getAttribute('href');
    if (!raw) continue;
    try {
      const url = new URL(raw.replaceAll('&amp;', '&'), 'https://ourolddad.com');
      if (!['www.youtube.com', 'youtube.com', 'music.youtube.com'].includes(url.hostname)) continue;
      const id = url.searchParams.get('list');
      if (!id) continue;
      if (!ids.includes(id)) ids.push(id);
      if (url.hostname === 'music.youtube.com' && !musicUrls.includes(url.href)) musicUrls.push(url.href);
    } catch { /* Ignore unrelated invalid links. */ }
  }
  return { post, ids, musicUrls, artists: getArtists(post), category: classify(post) };
}
function PlaylistCard({ entry }: { entry: Entry }) {
  const { post, ids } = entry;
  return <article className="playlist-directory__card">
    <div className="playlist-directory__card-heading">
      <h3>{post.title}</h3>
      {entry.artists.length ? <p className="playlist-directory__artist">{entry.artists.join(', ')}</p> : null}
    </div>
    {ids.length ? ids.map((id, index) => (
      <div className="playlist-directory__player" key={id}>
        {ids.length > 1 ? <p className="playlist-directory__player-label">Playlist {index + 1}</p> : null}
        <iframe loading="lazy" title={`${post.title} playlist ${index + 1}`} src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(id)}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    )) : <p>No playable playlist link is currently available for this post.</p>}
    <div className="playlist-directory__actions">
      <SiteLink href={postPath(post.slug)}>Read the story</SiteLink>
      {ids[0] ? <a href={`https://www.youtube.com/playlist?list=${encodeURIComponent(ids[0])}`} target="_blank" rel="noreferrer">Open on YouTube</a> : null}
    </div>
  </article>;
}
export function PlaylistDirectoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('Year');
  useEffect(() => {
    let mounted = true;
    void Promise.all(musicPosts.map(p => loadPostBySlug(p.slug))).then(posts => {
      if (mounted) setEntries(posts.filter((p): p is BlogPost => Boolean(p)).map(getPlaylists).filter(e => e.ids.length));
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const matching = entries.filter(entry => active === 'Artist' ? entry.artists.length > 0 : entry.category === active);
  const sorted = [...matching].sort((a,b) => active === 'Year' ? a.post.title.localeCompare(b.post.title) : a.post.title.localeCompare(b.post.title));
  return <div className="page-wrap playlist-directory">
    <header className="playlist-directory__intro">
      <span className="eyebrow">OOD Playlists</span>
      <h1>Just the playlists.</h1>
      <p className="lead">All the music in one place. Pick a category, press play, and skip the essays unless you want the stories behind the songs.</p>
      <SiteLink className="text-link" href="/section/music-playlists">Browse the music posts</SiteLink>
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
