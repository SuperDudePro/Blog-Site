import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPosts } from './read-posts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const canonicalHost = 'https://ourolddad.com';
const postMetadata = new Map(
  readPosts()
    .filter((post) => !post.missingIndex && post.slug)
    .map((post) => [`/post/${post.slug}`, {
      title: `${post.title} | Our Old Dad`,
      description: post.excerpt,
      post,
    }]),
);

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceMetadata(html, name, value, attribute = 'name') {
  const pattern = new RegExp(`<meta ${attribute}="${name}" content="[^"]*" \\/>`);
  return html.replace(pattern, `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`);
}

const [sitemap, indexHtml] = await Promise.all([
  readFile(sitemapPath, 'utf8'),
  readFile(indexPath, 'utf8'),
]);

const routes = new Set();
const locationPattern = /<loc>https?:\/\/[^/]+([^<]*)<\/loc>/gi;
let match;

while ((match = locationPattern.exec(sitemap)) !== null) {
  const pathname = decodeURIComponent(match[1] || '/').replace(/\/+$/, '') || '/';
  if (pathname !== '/') routes.add(pathname);
}

for (const route of routes) {
  const relativePath = route.replace(/^\/+/, '');
  const routeDir = path.join(distDir, relativePath);
  const canonicalUrl = `${canonicalHost}${route}`;
  let routeHtml = indexHtml
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  routeHtml = replaceMetadata(routeHtml, 'og:url', canonicalUrl, 'property');

  const metadata = postMetadata.get(route);
  if (metadata) {
    routeHtml = routeHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(metadata.title)}</title>`);
    routeHtml = replaceMetadata(routeHtml, 'description', metadata.description);
    routeHtml = replaceMetadata(routeHtml, 'og:title', metadata.title, 'property');
    routeHtml = replaceMetadata(routeHtml, 'og:description', metadata.description, 'property');
    routeHtml = replaceMetadata(routeHtml, 'og:type', 'article', 'property');
    routeHtml = replaceMetadata(routeHtml, 'twitter:title', metadata.title);
    routeHtml = replaceMetadata(routeHtml, 'twitter:description', metadata.description);
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Person', '@id': `${canonicalHost}/#author`, name: 'Will Gayhart', url: `${canonicalHost}/about` },
        { '@type': 'WebSite', '@id': `${canonicalHost}/#website`, url: `${canonicalHost}/`, name: 'Our Old Dad', publisher: { '@id': `${canonicalHost}/#author` } },
        {
          '@type': 'BlogPosting',
          '@id': `${canonicalUrl}#article`,
          headline: metadata.post.title,
          description: metadata.post.excerpt,
          url: canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          datePublished: metadata.post.publishedAt,
          author: { '@id': `${canonicalHost}/#author` },
          publisher: { '@id': `${canonicalHost}/#author` },
          isPartOf: { '@id': `${canonicalHost}/#website` },
          articleSection: metadata.post.section,
        },
      ],
    }).replaceAll('<', '\\u003c');
    routeHtml = routeHtml.replace(
      /<script type="application\/ld\+json" data-site-jsonld>[\s\S]*?<\/script>/,
      `<script type="application/ld+json" data-site-jsonld>${jsonLd}</script>`,
    );
  }

  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
}

console.log(`Generated static entry pages for ${routes.size} routes.`);
