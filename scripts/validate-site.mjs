import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const ORIGIN = 'https://ourolddad.com';
const ROOT = process.cwd();
const PUBLIC = resolve('public');
const DIST = resolve('dist');
const errors = [];
const assetExts = new Set(['.avif', '.css', '.gif', '.html', '.ico', '.jpeg', '.jpg', '.json', '.pdf', '.png', '.svg', '.txt', '.webp', '.xml', '.zip']);
const sourceExts = new Set(['.css', '.html', '.js', '.jsx', '.md', '.mjs', '.ts', '.tsx']);

const rel = (path) => relative(ROOT, path).split(sep).join('/');
const fail = (source, target, reason) => errors.push(`${source}: ${target} — ${reason}`);
const normalizeRoute = (value) => {
  let path = decodeURI(value || '/').replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  if (!path.startsWith('/')) path = `/${path}`;
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
};

function walk(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    ['node_modules', 'dist', '.git'].includes(entry.name) ? [] : walk(join(path, entry.name)),
  );
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const sitemapPath = resolve('public/sitemap.xml');
if (!existsSync(sitemapPath)) fail('public/sitemap.xml', '(missing)', 'sitemap was not generated');
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1].trim());
const routes = new Set();
for (const loc of locs) {
  try {
    const url = new URL(loc);
    if (url.origin !== ORIGIN) fail('public/sitemap.xml', loc, `wrong origin; expected ${ORIGIN}`);
    if (url.search || url.hash) fail('public/sitemap.xml', loc, 'sitemap URL contains a query or fragment');
    const route = normalizeRoute(url.pathname);
    if (routes.has(route)) fail('public/sitemap.xml', loc, 'duplicate normalized route');
    routes.add(route);
  } catch {
    fail('public/sitemap.xml', loc, 'invalid URL');
  }
}
if (!routes.size) fail('public/sitemap.xml', '<loc>', 'sitemap has no routes');

for (const route of routes) {
  const html = route === '/' ? join(DIST, 'index.html') : join(DIST, ...route.slice(1).split('/'), 'index.html');
  if (!existsSync(html)) {
    fail(rel(html), route, 'sitemap route has no generated entry page');
    continue;
  }
  const routeHtml = readFileSync(html, 'utf8');
  const canonical = `${ORIGIN}${route === '/' ? '/' : route}`;
  if (!routeHtml.includes(`<link rel="canonical" href="${canonical}" />`)) {
    fail(rel(html), 'canonical', `expected ${canonical}`);
  }
  if (route.startsWith('/post/')) {
    if (!/<title>.+ \| Our Old Dad<\/title>/.test(routeHtml)) {
      fail(rel(html), 'title', 'post route is missing its static post title');
    }
    const article = routeHtml.match(/<article\s+data-static-post>[\s\S]*?<\/article>/i)?.[0] || '';
    if (!article) {
      fail(rel(html), 'article', 'post route is missing crawlable static article markup');
    } else {
      if (!/<h1>[\s\S]+?<\/h1>/i.test(article)) {
        fail(rel(html), 'article', 'static article is missing its h1 title');
      }
      const articleText = visibleText(article);
      if (articleText.length < 300) {
        fail(rel(html), 'article', `static article text is too short (${articleText.length} characters)`);
      }
      if (/\$\{[^}]+\}/.test(article)) {
        fail(rel(html), 'article', 'static article contains unresolved template interpolation');
      }
    }
  }
}

function validateTarget(source, raw) {
  const target = raw.trim();
  if (!target || target.startsWith('{') || target.includes('${') || target.startsWith('#') || /^(mailto|tel|data|blob):/i.test(target)) return;
  if (target.startsWith('//')) return fail(source, target, 'protocol-relative URL is not allowed');
  let path = target;
  if (/^https?:\/\//i.test(target)) {
    try {
      const url = new URL(target);
      if (url.origin !== ORIGIN) return;
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fail(source, target, 'malformed absolute URL');
    }
  }
  if (!path.startsWith('/')) return;
  const clean = path.split(/[?#]/)[0];
  if (clean.startsWith('/src/')) return;
  let decoded;
  try { decoded = decodeURI(clean); } catch { return fail(source, target, 'malformed percent encoding'); }
  const ext = extname(decoded).toLowerCase();
  if (ext && assetExts.has(ext)) {
    const asset = join(PUBLIC, ...normalizeRoute(decoded).slice(1).split('/'));
    if (!existsSync(asset)) fail(source, target, `missing public asset (${rel(asset)})`);
    return;
  }
  const route = normalizeRoute(decoded);
  if (!routes.has(route)) fail(source, target, 'internal route is absent from the sitemap');
}

const files = ['src', 'index.html'].flatMap((entry) => walk(resolve(entry))).filter((file) => sourceExts.has(extname(file).toLowerCase()));
const patterns = [
  /\b(?:href|src|poster|action|to)\s*=\s*["'`]([^"'`]+)["'`]/g,
  /\b(?:href|src|poster|action|to|png|pdf|image|cardImage|heroImage|url)\s*:\s*["'`]([^"'`]+)["'`]/g,
  /\b(?:href|src|poster|action|to)\s*=\s*\{\s*["'`]([^"'`]+)["'`]\s*\}/g,
];
for (const file of files) {
  const source = rel(file);
  const text = readFileSync(file, 'utf8');
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) validateTarget(source, match[1]);
  for (const match of text.matchAll(/\bsrcSet\s*=\s*(?:\{\s*)?["'`]([^"'`]+)["'`]/g)) {
    for (const part of match[1].split(',')) validateTarget(source, part.trim().split(/\s+/)[0]);
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Site validation passed: ${routes.size} sitemap routes checked.`);
