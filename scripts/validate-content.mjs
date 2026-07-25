import fs from 'node:fs';
import path from 'node:path';
import { inspectImage } from './image-metadata.mjs';
import { validateBodyHtml } from './html-validator.mjs';
import { parsePostSource } from './post-parser.mjs';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');
const validSections = new Set(['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice']);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const expectedFormats = new Map([['.png', 'png'], ['.jpg', 'jpeg'], ['.jpeg', 'jpeg'], ['.webp', 'webp']]);
const maxImageBytes = 1_500_000;
const errors = [];
const warnings = [];
const posts = [];
const seenSlugs = new Map();
const seenTitles = new Map();

function fail(folder, message) {
  errors.push(folder ? `${folder}: ${message}` : message);
}

function warn(folder, message) {
  warnings.push(folder ? `${folder}: ${message}` : message);
}

function isRealIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isExternalImage(value) {
  if (typeof value !== 'string' || !value.startsWith('https://')) return false;
  try {
    const url = new URL(value);
    return /\.(?:png|jpe?g|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function inspectAsset(folder, fileName, fullPath) {
  try {
    const metadata = inspectImage(fullPath);
    const extension = path.extname(fileName).toLowerCase();
    if (metadata.format !== expectedFormats.get(extension)) {
      fail(folder, `${fileName} contains ${metadata.format.toUpperCase()} data but uses a ${extension} extension`);
    }
    if (metadata.width < 300 || metadata.height < 200) {
      fail(folder, `${fileName} is only ${metadata.width}x${metadata.height}; image appears incomplete or too small`);
    }
    if (metadata.bytes > maxImageBytes) {
      warn(folder, `${fileName} is ${(metadata.bytes / 1024 / 1024).toFixed(1)} MB; consider compressing it`);
    }
    return metadata;
  } catch (error) {
    fail(folder, `${fileName} is not a valid image: ${error.message}`);
    return null;
  }
}

if (!fs.existsSync(postsDir)) {
  fail('', `Missing posts directory: ${postsDir}`);
} else {
  for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      fail('', `Unexpected file in posts directory: ${entry.name}`);
      continue;
    }

    const folder = entry.name;
    const folderPath = path.join(postsDir, folder);
    const indexPath = path.join(folderPath, 'index.ts');
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const assets = new Map();

    for (const child of entries) {
      if (child.isDirectory()) {
        fail(folder, `unexpected nested directory '${child.name}'`);
        continue;
      }
      if (child.name === 'index.ts') continue;
      const extension = path.extname(child.name).toLowerCase();
      if (!imageExtensions.has(extension)) {
        fail(folder, `unexpected file '${child.name}'; post folders may contain only index.ts and PNG/JPEG/WebP images`);
        continue;
      }
      assets.set(child.name, inspectAsset(folder, child.name, path.join(folderPath, child.name)));
    }

    if (!fs.existsSync(indexPath)) {
      fail(folder, 'missing index.ts');
      continue;
    }

    const source = fs.readFileSync(indexPath, 'utf8');
    const parsed = parsePostSource(source, indexPath);
    parsed.errors.forEach((message) => fail(folder, message));
    const value = (field) => parsed.values.get(field);
    const slug = value('slug');
    const title = value('title');
    const bodyHtml = parsed.bodyHtml;

    if (!slug) fail(folder, 'missing slug');
    else {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(folder, 'slug must be lowercase kebab-case');
      if (slug !== folder) fail(folder, `folder name does not match slug '${slug}'`);
      if (seenSlugs.has(slug)) fail(folder, `duplicate slug '${slug}' also used by ${seenSlugs.get(slug)}`);
      seenSlugs.set(slug, folder);
    }
    if (!title) fail(folder, 'missing title');
    else {
      if (seenTitles.has(title)) warn(folder, `duplicate title '${title}' also used by ${seenTitles.get(title)}`);
      seenTitles.set(title, folder);
    }
    if (!value('excerpt')) fail(folder, 'missing excerpt');
    if (!isRealIsoDate(value('publishedAt'))) fail(folder, 'publishedAt must be a real YYYY-MM-DD date');
    if (!validSections.has(value('section'))) fail(folder, `invalid or missing section '${value('section') || ''}'`);
    if (!parsed.fields.has('bodyHtml') || !bodyHtml.trim()) fail(folder, 'missing bodyHtml');

    const htmlResult = validateBodyHtml(bodyHtml);
    htmlResult.errors.forEach((message) => fail(folder, message));
    htmlResult.warnings.forEach((message) => warn(folder, message));

    const usedIdentifiers = new Set();
    for (const field of ['heroImage', 'cardImage']) {
      if (!parsed.fields.has(field)) continue;
      const identifier = parsed.identifiers.get(field);
      const fieldValue = value(field);
      if (identifier && parsed.imageImports.has(identifier)) {
        usedIdentifiers.add(identifier);
      } else if (!isExternalImage(fieldValue)) {
        fail(folder, `${field} must reference an imported local image or an HTTPS image URL`);
      }
      const altField = field === 'heroImage' ? 'heroAlt' : 'cardAlt';
      if (!value(altField)?.trim()) fail(folder, `${field} is set but ${altField} is missing`);
    }

    for (const identifier of parsed.imageImports.keys()) {
      if (bodyHtml.includes(`\${${identifier}}`)) usedIdentifiers.add(identifier);
    }

    for (const [identifier, fileName] of parsed.imageImports) {
      if (!assets.has(fileName)) fail(folder, `imported image not found: ${fileName}`);
      if (!usedIdentifiers.has(identifier)) fail(folder, `image import '${identifier}' (${fileName}) is not used`);
    }
    const importedFiles = new Set(parsed.imageImports.values());
    for (const fileName of assets.keys()) {
      if (!importedFiles.has(fileName)) fail(folder, `orphan image is not imported by index.ts: ${fileName}`);
    }

    for (const tag of htmlResult.tags.filter((item) => item.tag === 'img')) {
      const src = tag.attributes.get('src') || '';
      const match = src.match(/^\$\{([A-Za-z_$][\w$]*)\}$/);
      if (match) {
        if (!parsed.imageImports.has(match[1])) fail(folder, `body image references unknown import '${match[1]}'`);
      } else if (!isExternalImage(src)) {
        fail(folder, `body image src must reference an imported image or an HTTPS image URL, found '${src}'`);
      }
    }

    posts.push({ folder, slug });
  }
}

const sitemapPath = path.join(root, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  fail('', 'public/sitemap.xml is missing; run npm run generate:sitemap');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const post of posts) {
    if (post.slug && !sitemap.includes(`/post/${post.slug}`)) fail('', `sitemap missing /post/${post.slug}`);
  }
}

if (warnings.length) {
  console.warn('Content warnings:');
  warnings.forEach((message) => console.warn(`- ${message}`));
}
if (errors.length) {
  console.error('Content validation failed:');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}
console.log(`Content validation passed for ${posts.length} posts.`);
