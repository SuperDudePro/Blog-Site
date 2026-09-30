import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './read-posts.mjs';

// Generates public/llms.txt (https://llmstxt.org) from the post catalog so AI tools get a plain index of the site.
const siteUrl = (process.env.SITE_URL || 'https://ourolddad.com').replace(/\/$/, '');
const sections = [
  ['diary', 'Diary of an Old Dad', 'Scenes, memory, family life, and the day-to-day absurdity of being an old dad.'],
  ['life-education', 'Life Education', 'What is worth learning, how kids grow, and what makes a life feel real.'],
  ['music-playlists', 'Music Playlists', 'Songs, seasons, road soundtracks, memory triggers, and what to put on next.'],
  ['slow-travel', 'Slow Travel', 'Building the trip, building the life, and learning how to move more slowly on purpose.'],
  ['advice', "An Old Dad's Advice", 'Direct pieces, sharper takes, hard-earned advice, and a little fatherly bluntness.'],
];
const posts = readPosts()
  .filter((post) => !post.missingIndex && post.slug && post.publishedAt)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const clean = (value) => String(value).replace(/\s+/g, ' ').trim();
const link = (title, url, description) => `- [${clean(title).replace(/[[\]]/g, '')}](${url})${description ? `: ${clean(description)}` : ''}`;

const lines = [
  '# Our Old Dad',
  '',
  '> Our Old Dad is a personal blog by Will Gayhart: notes on fatherhood, music, memory, learning, and the attempt to build a bigger life while time is still on the clock.',
  '',
  'Posts are first-person essays. Each post page has a canonical URL under /post/. The full post list is also available as RSS and in the XML sitemap.',
  '',
  '## Site',
  '',
  link('About', `${siteUrl}/about`, 'Who writes the site and why.'),
  link('Archive', `${siteUrl}/archive`, 'Every published post.'),
  link('RSS feed', `${siteUrl}/rss.xml`),
  link('Sitemap', `${siteUrl}/sitemap.xml`),
];

for (const [key, name, description] of sections) {
  const sectionPosts = posts.filter((post) => post.section === key);
  if (!sectionPosts.length) continue;
  lines.push('', `## ${name}`, '', `${description} Section page: ${siteUrl}/section/${key}`, '');
  for (const post of sectionPosts) lines.push(link(post.title, `${siteUrl}/post/${post.slug}`, post.excerpt));
}

const outPath = path.join(process.cwd(), 'public', 'llms.txt');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
console.log(`Generated public/llms.txt with ${posts.length} posts.`);
