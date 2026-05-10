import fs from 'node:fs';
import path from 'node:path';
import { readPosts } from './read-posts.mjs';

const root = process.cwd();
const validSections = new Set(['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice']);
const errors = [];
const warnings = [];
const posts = readPosts();

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

for (const post of posts) {
  if (post.missingIndex) {
    errors.push(`${post.folder}: missing index.ts`);
    continue;
  }

  if (!post.slug) errors.push(`${post.folder}: missing slug`);
  if (post.slug && post.slug !== post.folder) errors.push(`${post.folder}: folder name does not match slug '${post.slug}'`);
  if (!post.title) errors.push(`${post.folder}: missing title`);
  if (!post.excerpt) errors.push(`${post.folder}: missing excerpt`);
  if (!post.publishedAt || !/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) {
    errors.push(`${post.folder}: publishedAt must be YYYY-MM-DD`);
  }
  if (!validSections.has(post.section)) errors.push(`${post.folder}: invalid or missing section '${post.section}'`);
  if (!post.hasBodyHtml) errors.push(`${post.folder}: missing bodyHtml`);

  for (const image of post.importedImages) {
    if (!fileExists(`src/content/posts/${post.folder}/${image}`)) {
      errors.push(`${post.folder}: imported image not found: ${image}`);
    }
  }

  if (post.hasHeroImage && !post.hasHeroAlt) errors.push(`${post.folder}: heroImage is set but heroAlt is missing`);
  if (post.hasCardImage && !post.hasCardAlt) errors.push(`${post.folder}: cardImage is set but cardAlt is missing`);
  if (post.bodyImages > post.bodyImageAlts) errors.push(`${post.folder}: one or more body <img> tags are missing alt text`);
}

const sitemapPath = path.join(root, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  errors.push('public/sitemap.xml is missing; run npm run generate:sitemap');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const post of posts) {
    if (post.slug && !sitemap.includes(`/post/${post.slug}`)) {
      errors.push(`sitemap missing /post/${post.slug}`);
    }
  }
}

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const maxImageBytes = 1_500_000;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      const size = fs.statSync(fullPath).size;
      if (size > maxImageBytes) {
        warnings.push(`${path.relative(root, fullPath)} is ${(size / 1024 / 1024).toFixed(1)} MB; consider compressing it`);
      }
    }
  }
}
walk(path.join(root, 'src'));

if (warnings.length) {
  console.warn('Content warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error('Content validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Content validation passed for ${posts.length} posts.`);
