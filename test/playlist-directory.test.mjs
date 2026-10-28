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

test('every playlist-bearing music post has both YouTube and YouTube Music sources', () => {
  for (const post of music) {
    const links = youtubeLinks(post);
    if (!links.length) continue;
    assert.ok(links.some(url => url.hostname === 'music.youtube.com'), post.slug + ': no Music link');
    assert.ok(links.some(url => url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com'), post.slug + ': no YouTube link');
    for (const url of links) assert.ok(url.searchParams.get('list'), post.slug + ': missing playlist id');
  }
});

test('Within a Listen pairs two albums, not four separate playlists', () => {
  const post = music.find(p => p.slug === 'within-a-listen');
  assert.ok(post);
  const links = youtubeLinks(post);
  assert.equal(links.length, 4);
  assert.equal(links.filter(url => url.hostname === 'music.youtube.com').length, 2);
  assert.equal(links.filter(url => url.hostname !== 'music.youtube.com').length, 2);
  assert.match(post.bodyHtml, /Let Love Rule/);
  assert.match(post.bodyHtml, /Shake Your Money Maker/);
});

test('all playlist post source slugs are unique', () => {
  assert.equal(new Set(music.map(p => p.slug)).size, music.length);
});
