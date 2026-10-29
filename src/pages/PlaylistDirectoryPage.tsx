import { useEffect, useState } from 'react';
import { getPostsForSection, loadPostBySlug } from '../content/loadPosts';
import type { BlogPost } from '../content/postTypes';
import { SiteLink } from '../components/SiteLink';
import { postPath } from '../routes';
import skull from '../assets/playlist-skull-transparent.webp';
import { YouTubePlaylistPlayers, extractYouTubePlaylists } from '../components/YouTubePlaylistPlayers';
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
function getPlaylists(post: BlogPost): Entry {
  return {
    post,
    playlists: extractYouTubePlaylists(post).map(item => ({
      key: item.label || item.id,
      ...(item.label ? { label: item.label } : {}),
      youtube: `https://www.youtube.com/playlist?list=${encodeURIComponent(item.id)}`,
    })),
    category: classify(post),
    artists: getArtists(post),
  };
}
const approvedPlaylistCoverIds: Record<string, string> = {
  'the-83-hawaii-playlist': '1raryAeRqjT-Yvug-zDmM3ypmFTZ5Vh8V',
  'straight-greats-5-rolling-stones-six-straight': '1KMsyng67rHBsLCtsha3SMeoGXZ3pl8TY',
};

// Artwork is created by the YouTube playlist workflow and approved separately.
// Other playlists retain their existing post art until their cover is supplied.
function PlaylistCard({ entry }: { entry: Entry }) {
  const { post } = entry;
  const approvedCoverId = approvedPlaylistCoverIds[post.slug];
  const coverSrc = approvedCoverId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(approvedCoverId)}&sz=w640`
    : post.cardImage || post.heroImage;
  return <article className="playlist-directory__card">
    {coverSrc ? <div className="playlist-directory__artwork">
      <img src={coverSrc} alt={post.cardAlt || post.heroAlt || `Artwork for ${post.title}`} loading="lazy" decoding="async" />
    </div> : null}
    <div className="playlist-directory__card-heading">
      <h3>{post.title}</h3>
      {entry.artists.length ? <p className="playlist-directory__artist">{entry.artists.join(', ')}</p> : null}
    </div>
    <YouTubePlaylistPlayers post={post} playlists={extractYouTubePlaylists(post)} showLinks />
    <div className="playlist-directory__story"><SiteLink href={postPath(post.slug)}>Read the story</SiteLink></div>
  </article>;
}
export function PlaylistDirectoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('Year');
  useEffect(() => {
    let mounted = true;
    void Promise.allSettled(musicPosts.map(p => loadPostBySlug(p.slug))).then(results => {
      if (!mounted) return;
      const loaded = results.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []);
      setEntries(loaded.flatMap(post => {
        try {
          const entry = getPlaylists(post);
          return entry.playlists.length ? [entry] : [];
        } catch {
          return [];
        }
      }));
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
      <img className="playlist-directory__skull" src={skull} alt="A bearded Our Old Dad skull wearing sunglasses and headphones while enjoying music." width="340" height="340" />
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
