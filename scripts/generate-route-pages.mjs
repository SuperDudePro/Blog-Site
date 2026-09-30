import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePostSource } from './post-parser.mjs';
import { readPosts } from './read-posts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const manifestDir = path.join(distDir, '.vite');
const manifestPath = path.join(manifestDir, 'manifest.json');
const canonicalHost = 'https://ourolddad.com';
const staticRouteMetadata = new Map([
  ['/categories', { title: 'Categories | Our Old Dad', description: 'Browse every Our Old Dad category and find the latest post in each one.' }],
  ['/archive', { title: 'Archive | Our Old Dad', description: 'Search every published Our Old Dad post by words, section, or year.' }],
  ['/about', { title: 'About | Our Old Dad', description: 'Notes on fatherhood, music, memory, learning, and the attempt to build a bigger life while time is still on the clock.' }],
  ['/contact', { title: 'Contact | Our Old Dad', description: 'Send a note to Our Old Dad without exposing a public email address.' }],
  ['/section/everything', { title: 'Everything | Our Old Dad', description: 'All posts in one place.' }],
  ['/section/diary', { title: 'Diary of an Old Dad | Our Old Dad', description: 'Scenes, memory, family life, and the day-to-day absurdity of being an old dad.' }],
  ['/section/life-education', { title: 'Life Education | Our Old Dad', description: 'What is worth learning, how kids grow, and what makes a life feel real.' }],
  ['/section/music-playlists', { title: 'Music Playlists | Our Old Dad', description: 'Songs, seasons, road soundtracks, memory triggers, and what to put on next.' }],
  ['/section/slow-travel', { title: 'Slow Travel | Our Old Dad', description: 'Building the trip, building the life, and learning how to move more slowly on purpose.' }],
  ['/section/advice', { title: "An Old Dad's Advice | Our Old Dad", description: 'Direct pieces, sharper takes, hard-earned advice, and a little fatherly bluntness.' }],
]);
const sectionNames = new Map([
  ['diary', 'Diary of an Old Dad'],
  ['life-education', 'Life Education'],
  ['music-playlists', 'Music Playlists'],
  ['slow-travel', 'Slow Travel'],
  ['advice', "An Old Dad's Advice"],
]);
// Vite's manifest maps each imported source image to its hashed built file.
const assetManifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};

function shareImage(post) {
  const parsed = parsePostSource(post.source, post.indexPath);
  for (const [imageField, altField] of [['cardImage', 'cardAlt'], ['heroImage', 'heroAlt']]) {
    const filename = parsed.imageImports.get(parsed.identifiers.get(imageField));
    const built = filename && assetManifest[`src/content/posts/${post.folder}/${filename}`]?.file;
    if (built) return { url: `${canonicalHost}/${built}`, alt: parsed.values.get(altField) || '' };
  }
  return undefined;
}

const postMetadata = new Map(
  readPosts()
    .filter((post) => !post.missingIndex && post.slug)
    .map((post) => [`/post/${post.slug}`, {
      title: `${post.title} | Our Old Dad`,
      description: post.excerpt,
      post,
      modifiedAt: parsePostSource(post.source, post.indexPath).values.get('modifiedAt'),
      image: shareImage(post),
    }]),
);

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceMetadata(html, name, value, attribute = 'name') {
  const pattern = new RegExp(`<meta ${attribute}="${name}" content="[^"]*" \\/>`);
  return html.replace(pattern, `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`);
}

function staticPostBody(post) {
  return post.bodyHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<img\b[\s\S]*?>/gi, '')
    .replace(/\$\{[^}]+\}/g, '');
}

function staticPostMarkup(post) {
  const body = staticPostBody(post);
  return `<main data-static-post-shell><article data-static-post><header><h1>${escapeText(post.title)}</h1><p>${escapeText(post.excerpt)}</p><p><time datetime="${escapeAttribute(post.publishedAt)}">${escapeText(post.publishedAt)}</time></p></header>${body}</article></main>`;
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

  const metadata = postMetadata.get(route) ?? staticRouteMetadata.get(route);
  if (metadata) {
    routeHtml = routeHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(metadata.title)}</title>`);
    routeHtml = replaceMetadata(routeHtml, 'description', metadata.description);
    routeHtml = replaceMetadata(routeHtml, 'og:title', metadata.title, 'property');
    routeHtml = replaceMetadata(routeHtml, 'og:description', metadata.description, 'property');
    routeHtml = replaceMetadata(routeHtml, 'og:type', metadata.post ? 'article' : 'website', 'property');
    routeHtml = replaceMetadata(routeHtml, 'twitter:title', metadata.title);
    routeHtml = replaceMetadata(routeHtml, 'twitter:description', metadata.description);
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Person', '@id': `${canonicalHost}/#author`, name: 'Will Gayhart', url: `${canonicalHost}/about` },
        { '@type': 'WebSite', '@id': `${canonicalHost}/#website`, url: `${canonicalHost}/`, name: 'Our Old Dad', description: 'Family life, slow travel, playlists, and advice from an old dad.', publisher: { '@id': `${canonicalHost}/#author` } },
        metadata.post ? {
          '@type': 'BlogPosting',
          '@id': `${canonicalUrl}#article`,
          headline: metadata.post.title,
          description: metadata.post.excerpt,
          url: canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          datePublished: metadata.post.publishedAt,
          ...(metadata.modifiedAt ? { dateModified: metadata.modifiedAt } : {}),
          ...(metadata.image ? { image: metadata.image.url } : {}),
          author: { '@id': `${canonicalHost}/#author` },
          publisher: { '@id': `${canonicalHost}/#author` },
          isPartOf: { '@id': `${canonicalHost}/#website` },
          articleSection: sectionNames.get(metadata.post.section) ?? metadata.post.section,
        } : {
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: metadata.title,
          description: metadata.description,
          isPartOf: { '@id': `${canonicalHost}/#website` },
        },
      ],
    }).replaceAll('<', '\\u003c');
    routeHtml = routeHtml.replace(
      /<script type="application\/ld\+json" data-site-jsonld>[\s\S]*?<\/script>/,
      `<script type="application/ld+json" data-site-jsonld>${jsonLd}</script>`,
    );
    if (metadata.image) {
      routeHtml = replaceMetadata(routeHtml, 'twitter:card', 'summary_large_image');
      const imageTags = [
        `<meta property="og:image" content="${escapeAttribute(metadata.image.url)}" />`,
        ...(metadata.image.alt ? [`<meta property="og:image:alt" content="${escapeAttribute(metadata.image.alt)}" />`] : []),
        `<meta name="twitter:image" content="${escapeAttribute(metadata.image.url)}" />`,
        ...(metadata.image.alt ? [`<meta name="twitter:image:alt" content="${escapeAttribute(metadata.image.alt)}" />`] : []),
      ];
      routeHtml = routeHtml.replace('</head>', `    ${imageTags.join('\n    ')}\n  </head>`);
    }
    if (metadata.post) routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${staticPostMarkup(metadata.post)}</div>`);
  }

  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
}

// The manifest is only a build input; do not deploy it.
await rm(manifestDir, { recursive: true, force: true });

console.log(`Generated static entry pages for ${routes.size} routes.`);
