import { useEffect, useState } from 'react';
import { getPostsForSection, loadPostBySlug } from '../content/loadPosts';
import type { BlogPost } from '../content/postTypes';
import { SiteLink } from '../components/SiteLink';
import { postPath } from '../routes';
import { site } from '../data/siteContent';
import skull from '../assets/playlist-skull-transparent.webp';
import { YouTubePlaylistPlayers, extractYouTubePlaylists } from '../components/YouTubePlaylistPlayers';
import './PlaylistDirectoryPage.css';

type Category = 'All' | 'Year' | 'Era' | 'Artist' | 'Straight Greats' | 'Misc';
type Playlist = { id: string; label?: string };
type Entry = { post: BlogPost; playlist: Playlist; relatedPosts: BlogPost[]; artists: string[]; category: Exclude<Category, 'All'> };
const musicPosts = getPostsForSection('music-playlists');
const artistNames: Record<string, string> = {
  'bad-company': 'Bad Company', 'joe-walsh': 'Joe Walsh', journey: 'Journey',
  'radiohead': 'Radiohead', 'aerosmith': 'Aerosmith', 'rem': 'R.E.M.',
  'rolling-stones': 'The Rolling Stones', 'pink-floyd': 'Pink Floyd', 'the-cult': 'The Cult',
};
const groups: Category[] = ['All', 'Year', 'Era', 'Artist', 'Straight Greats', 'Misc'];
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
// Keep article links as the content authority: no parallel playlist database.
// OOD-owned playlists use PL IDs; the OLAK album links in "Within a Listen"
// belong in that story, not in the public OOD playlist directory.
function getEntries(posts: BlogPost[]): Entry[] {
  const byPlaylistId = new Map<string, Entry>();
  for (const post of [...posts].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))) {
    for (const playlist of extractYouTubePlaylists(post)) {
      if (!playlist.id.startsWith('PL')) continue;
      const existing = byPlaylistId.get(playlist.id);
      if (existing) {
        if (existing.post.slug !== post.slug && !existing.relatedPosts.some(item => item.slug === post.slug)) {
          existing.relatedPosts.push(post);
        }
      } else {
        byPlaylistId.set(playlist.id, {
          post,
          playlist,
          relatedPosts: [],
          category: classify(post),
          artists: getArtists(post),
        });
      }
    }
  }
  return [...byPlaylistId.values()];
}
function PlaylistCard({ entry }: { entry: Entry }) {
  const { post } = entry;
  const coverSrc = post.cardImage || post.heroImage;
  return <article className="playlist-directory__card">
    {coverSrc ? <div className="playlist-directory__artwork">
      <img src={coverSrc} alt={post.cardAlt || post.heroAlt || `Artwork for ${post.title}`} loading="lazy" decoding="async" />
    </div> : null}
    <div className="playlist-directory__card-heading">
      <h3>{post.title}</h3>
      {entry.artists.length ? <p className="playlist-directory__artist">{entry.artists.join(', ')}</p> : null}
    </div>
    <YouTubePlaylistPlayers post={post} playlists={[entry.playlist]} showLinks />
    <div className="playlist-directory__story">
      <SiteLink href={postPath(post.slug)}>Read the story</SiteLink>
      {entry.relatedPosts.length > 0 ? <div className="playlist-directory__updates">
        <span>Playlist updates:</span>
        {entry.relatedPosts.map(update => <SiteLink key={update.slug} href={postPath(update.slug)}>{update.title}</SiteLink>)}
      </div> : null}
    </div>
  </article>;
}
export function PlaylistDirectoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('All');
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let mounted = true;
    void Promise.allSettled(musicPosts.map(p => loadPostBySlug(p.slug))).then(results => {
      if (!mounted) return;
      const loaded = results.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []);
      setEntries(getEntries(loaded));
      setLoadError(results.some(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)));
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const matching = entries.filter(entry => active === 'All' || (active === 'Artist' ? entry.artists.length > 0 || entry.category === 'Straight Greats' : entry.category === active));
  const sorted = [...matching].sort((a,b) => a.post.title.localeCompare(b.post.title));
  return <div className="page-wrap playlist-directory">
    <header className="playlist-directory__intro">
      <div className="playlist-directory__intro-copy">
        <span className="eyebrow">OOD Playlists</span>
        <h1>Just the playlists.</h1>
        <p className="lead">All the music in one place. Pick a category, press play, and skip the essays unless you want the stories behind the songs.</p>
        <div className="playlist-directory__channel-links">
          <SiteLink className="text-link" href="/section/music-playlists">Browse the music posts</SiteLink>
          <a className="text-link" href={site.youtubeUrl} target="_blank" rel="noopener noreferrer">Visit our YouTube channel</a>
        </div>
      </div>
      <img className="playlist-directory__skull" src={skull} alt="A bearded Our Old Dad skull wearing sunglasses and headphones while enjoying music." width="340" height="340" />
    </header>
    <nav className="playlist-directory__tabs" aria-label="Playlist categories">
      {groups.map(group => <button type="button" key={group} aria-pressed={active === group} onClick={() => setActive(group)}>{group === 'Misc' ? 'Miscellaneous' : group}{!loading ? ` (${group === 'All' ? entries.length : entries.filter(entry => group === 'Artist' ? entry.artists.length > 0 || entry.category === 'Straight Greats' : entry.category === group).length})` : ''}</button>)}
    </nav>
    <section className="playlist-directory__content" aria-live="polite">
      <h2>{active === 'All' ? 'All playlists' : active === 'Misc' ? 'Miscellaneous' : active}</h2>
      {active === 'Artist' ? <p>Artist favorites and Straight Greats are collected together here. Browse the album-run series separately under Straight Greats.</p> : null}
      {loadError ? <p role="status">Some music posts could not be loaded. This list may be incomplete; try refreshing the page.</p> : null}
      {loading ? <p>Loading playlists…</p> : sorted.length ? <div className="playlist-directory__grid">{sorted.map(entry => <PlaylistCard key={entry.post.slug} entry={entry} />)}</div> : <p>No playlists in this category yet. Browse the music posts or visit the YouTube channel to listen.</p>}
    </section>
  </div>;
}
