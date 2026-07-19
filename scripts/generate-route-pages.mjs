import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');

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
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'index.html'), indexHtml, 'utf8');
}

console.log(`Generated static entry pages for ${routes.size} routes.`);
