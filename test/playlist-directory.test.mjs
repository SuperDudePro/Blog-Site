import test from 'node:test';
import assert from 'node:assert/strict';
import { readPosts } from '../scripts/read-posts.mjs';

const music = readPosts().filter(post => post.section === 'music-playlists');
const numbered = music.filter(post => /^Straight Greats No\.\s*\d+:/i.test(post.title));
const youtubeLinks = post => [...post.bodyHtml.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => new URL(m[1].replaceAll('&amp;', '&'))).filter(url => ['youtube.com', 'www.youtube.com', 'music.youtube.com'].includes(url.hostname) && url.searchParams.has('list'));
const group = post => /straight-greats|three-straight|3-straight|the-cult-three-great/i.test(post.slug) || /^Straight Greats No\.\s*\d+:/i.test(post.title);

test('all six numbered Straight Greats posts are recognized, not misfiled under Misc', () => {
  assert.equal(numbered.length, 6);
  assert.deepEqual(numbered.map(p => Number(p.title.match(/No\.\s*(\d+)/i)[1])).sort((a,b) => a-b), [1,2,3,4,5,6]);
  for (const post of numbered) assert.ok(group(post), post.slug);
});

test('OOD playlists use YouTube-only links', () => {
  for (const post of music) {
    if (post.slug === 'within-a-listen') continue; // Original commercial albums, not OOD playlists
    const links = youtubeLinks(post);
    if (!links.length) continue;
    assert.ok(links.every(url => url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com'), post.slug + ': unexpected source');
    for (const url of links) assert.ok(url.searchParams.get('list'), post.slug + ': missing playlist id');
  }
});

test('all playlist post source slugs are unique', () => {
  assert.equal(new Set(music.map(p => p.slug)).size, music.length);
});

const ownedInventorySnapshot = [
  'PLKqhESU25rZs', 'PLJngcclfZ4hw', 'PLGWTRVSj7pzs', 'PLKdFg3sCanAc',
  'PLaTUDkmoLmiY', 'PLeIYOcI6NDh0', 'PLG4FxJ0KHX58', 'PLKD5ZqhVcm1g',
  'PLGck6rFcDtTE', 'PLUPi6_JoWgyI', 'PLfY6ggILXuf8', 'PLMN1VkF5l6d0',
  'PLVk3UJeVFX7I', 'PLB6srd_Z0UfQ', 'PLRlr-UN4_b6I', 'PLFQOgHMDLmVs',
];
// Snapshot checked against the connected Our Old Dad YouTube public inventory 2026-11-11.
// This is a regression fixture, not a playlist registry or a production data source.
test('all 16 currently public OOD channel playlists are discoverable from existing music posts', () => {
  const linked = new Set(music.flatMap(post => youtubeLinks(post)).map(url => url.searchParams.get('list')));
  for (const id of ownedInventorySnapshot) assert.ok(linked.has(id), `Missing channel playlist: ${id}`);
});

test('the directory has one card per owned playlist and does not include commercial albums', () => {
  const owned = music.flatMap(post => youtubeLinks(post).filter(url => url.searchParams.get('list')?.startsWith('PL'))
    .map(url => ({ slug: post.slug, id: url.searchParams.get('list') })));
  const uniqueIds = new Set(owned.map(link => link.id));
  assert.equal(uniqueIds.size, 16, 'Expected 16 unique owned playlists as of November 11');
  assert.ok(owned.length > uniqueIds.size, 'Monthly 2000 or So Things update should share the original playlist');
  const shared = owned.filter(link => link.id === 'PLGWTRVSj7pzs');
  assert.deepEqual(new Set(shared.map(link => link.slug)), new Set(['2000-or-so-things', '2000-or-so-things-november-2026']));
  assert.ok(youtubeLinks(music.find(post => post.slug === 'within-a-listen')).every(url => url.searchParams.get('list')?.startsWith('OLAK')),
    'The albums in Within a Listen must not be shown as channel playlists');
});
