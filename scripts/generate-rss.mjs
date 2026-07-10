import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './read-posts.mjs';

const siteUrl = (process.env.SITE_URL || 'https://www.ourolddad.com').replace(/\/$/, '');
const posts = readPosts()
  .filter((post) => !post.missingIndex && post.slug && post.publishedAt)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const latestDate = posts[0]?.publishedAt
  ? new Date(`${posts[0].publishedAt}T12:00:00Z`).toUTCString()
  : new Date().toUTCString();

const items = posts
  .map((post) => {
    const url = `${siteUrl}/post/${post.slug}`;
    const published = new Date(`${post.publishedAt}T12:00:00Z`).toUTCString();

    return `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${escapeXml(url)}</link>\n      <guid isPermaLink="true">${escapeXml(url)}</guid>\n      <pubDate>${escapeXml(published)}</pubDate>\n      <category>${escapeXml(post.section)}</category>\n      <description>${escapeXml(post.excerpt)}</description>\n    </item>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Our Old Dad</title>\n    <link>${siteUrl}</link>\n    <description>Family life, slow travel, playlists, and advice from an old dad.</description>\n    <language>en-us</language>\n    <lastBuildDate>${escapeXml(latestDate)}</lastBuildDate>\n    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n${items}\n  </channel>\n</rss>\n`;

const outPath = path.join(process.cwd(), 'public', 'rss.xml');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml);
console.log(`Generated public/rss.xml with ${posts.length} posts.`);
