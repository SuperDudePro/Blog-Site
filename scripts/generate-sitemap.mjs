import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './read-posts.mjs';

const siteUrl = (process.env.SITE_URL || 'https://www.ourolddad.com').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);
const posts = readPosts()
  .filter((post) => !post.missingIndex && post.slug)
  .sort((a, b) => new Date(b.publishedAt || '1900-01-01') - new Date(a.publishedAt || '1900-01-01'));

const sections = ['everything', 'diary', 'life-education', 'music-playlists', 'slow-travel', 'advice'];
const urls = [
  { loc: `${siteUrl}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
  ...sections.map((section) => ({
    loc: `${siteUrl}/section/${section}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: section === 'everything' ? '0.9' : '0.8',
  })),
  { loc: `${siteUrl}/about`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
  ...posts.map((post) => ({
    loc: `${siteUrl}/post/${post.slug}`,
    lastmod: post.publishedAt || today,
    changefreq: 'monthly',
    priority: '0.8',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>\n`;

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml);
console.log(`Generated public/sitemap.xml with ${urls.length} URLs.`);
