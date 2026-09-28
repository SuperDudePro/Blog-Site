import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const [origin, mode, generator] = process.argv.slice(2);
if (!origin || !['--sitemap', '--built'].includes(mode)) {
  throw new Error('Usage: node scripts/validate-discovery.mjs ORIGIN --sitemap GENERATOR | --built');
}

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const decode = (value) => value.replace(/&(?:amp|quot|apos|lt|gt);/g, (entity) => ({
  '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>',
})[entity]);
const normalize = (path) => path.replace(/\/+$/, '') || '/';
const canonical = (route) => `${origin}${route === '/' ? '/' : route}`;
const sitemapPath = resolve('public/sitemap.xml');

function sitemapRoutes(xml, label) {
  const routes = new Set();
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    try {
      const url = new URL(decode(match[1].trim()));
      const route = normalize(url.pathname);
      if (url.origin !== origin || url.search || url.hash) fail(label, `invalid canonical URL ${url.href}`);
      if (routes.has(route)) fail(label, `duplicate route ${route}`);
      routes.add(route);
    } catch { fail(label, `invalid URL ${match[1]}`); }
  }
  if (!routes.size) fail(label, 'no URLs found');
  return routes;
}

if (!existsSync(sitemapPath)) fail('public/sitemap.xml', 'file is missing');
const source = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';

if (mode === '--sitemap') {
  if (!generator) throw new Error('A sitemap generator path is required');
  // Compare route coverage, not lastmod timestamps, which can change every day.
  execFileSync(process.execPath, [generator], { stdio: 'inherit' });
  const expected = sitemapRoutes(readFileSync(sitemapPath, 'utf8'), 'generated sitemap');
  const committed = sitemapRoutes(source, 'checked-in sitemap');
  for (const route of expected) if (!committed.has(route)) fail('public/sitemap.xml', `missing generated route ${route}`);
  for (const route of committed) if (!expected.has(route)) fail('public/sitemap.xml', `obsolete route ${route}`);
} else {
  const routes = sitemapRoutes(source, 'public/sitemap.xml');
  const robotsPath = resolve('public/robots.txt');
  const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
  if (!robots.split(/\r?\n/).some((line) => line.trim() === `Sitemap: ${origin}/sitemap.xml`)) {
    fail('public/robots.txt', 'canonical sitemap declaration is missing');
  }
  const dist = resolve('dist');
  function walk(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name === 'index.html' ? [join(dir, entry.name)] : []);
  }
  const pages = new Map(walk(dist).map((file) => {
    const directory = relative(dist, file).split(sep).slice(0, -1).join('/');
    return [directory ? `/${directory}` : '/', file];
  }));
  for (const route of pages.keys()) if (!routes.has(route)) fail('dist', `generated page ${route} is absent from sitemap`);

  for (const route of routes) {
    const file = pages.get(route);
    if (!file) { fail('dist', `sitemap route ${route} has no generated page`); continue; }
    const head = readFileSync(file, 'utf8').split(/<\/head>/i)[0];
    const label = relative(process.cwd(), file);
    const tags = [...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(([tag]) => {
      const attrs = {};
      for (const [, key, , value] of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)) attrs[key.toLowerCase()] = decode(value);
      return attrs;
    });
    function one(attr, value, field) {
      const found = tags.filter((tag) => tag[attr]?.toLowerCase() === value);
      if (found.length !== 1 || !found[0][field]?.trim()) fail(label, `expected one nonempty ${value} ${field}`);
      return found[0]?.[field];
    }
    if (!/<title>\s*[^<\s][\s\S]*?<\/title>/i.test(head)) fail(label, 'missing nonempty title');
    one('name', 'description', 'content');
    const url = canonical(route);
    if (one('rel', 'canonical', 'href') !== url) fail(label, `canonical must be ${url}`);
    if (one('property', 'og:url', 'content') !== url) fail(label, `og:url must be ${url}`);
    if (tags.some((tag) => tag.name?.toLowerCase() === 'robots' && /\bnoindex\b/i.test(tag.content || ''))) {
      fail(label, 'sitemap page is marked noindex');
    }
    const scripts = [...head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (scripts.length !== 1) { fail(label, 'expected one JSON-LD script'); continue; }
    try {
      const data = JSON.parse(scripts[0][1]);
      const nodes = data['@graph'] || [data];
      const articleRoute = /^\/(?:post|posts)\//.test(route);
      const types = route === '/' ? ['WebSite'] : articleRoute ? ['Article', 'BlogPosting'] : ['WebPage'];
      if (!nodes.some((node) => types.includes(node['@type']) && node.url === url)) {
        fail(label, `JSON-LD ${types.join('/')} URL must be ${url}`);
      }
      if (articleRoute && !nodes.some((node) =>
        ['Article', 'BlogPosting'].includes(node['@type']) && node.url === url && node.mainEntityOfPage === url)) {
        fail(label, `article JSON-LD URL/mainEntityOfPage must be ${url}`);
      }
    } catch (error) { fail(label, `invalid JSON-LD: ${error.message}`); }
  }
}

if (errors.length) {
  console.error(`Discovery validation failed (${errors.length}):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Discovery validation passed: ${mode === '--sitemap' ? 'checked-in sitemap routes match generated routes' : 'sitemap routes match built pages and metadata'}.`);
}
