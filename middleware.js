import { next, rewrite } from '@vercel/functions';

const STATIC_PATHS = new Set([
  '/',
  '/categories',
  '/about',
  '/contact',
  '/section/everything',
  '/section/diary',
  '/section/life-education',
  '/section/music-playlists',
  '/section/slow-travel',
  '/section/advice',
]);

let cachedPostPaths = null;
let cacheExpiresAt = 0;

export const config = {
  matcher: '/((?!api/|assets/|favicon\\.svg$|robots\\.txt$|sitemap\\.xml$|rss\\.xml$|index\\.html$|404\\.html$|.*\\.[a-zA-Z0-9]+$).*)',
};

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  const clean = pathname.trim().replace(/\/+$/, '').toLowerCase();
  return clean || '/';
}

async function getPostPaths(origin) {
  const now = Date.now();
  if (cachedPostPaths && now < cacheExpiresAt) return cachedPostPaths;

  const response = await fetch(`${origin}/sitemap.xml`, {
    headers: { accept: 'application/xml,text/xml' },
  });

  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);

  const xml = await response.text();
  const paths = new Set();
  const pattern = /<loc>https?:\/\/[^/]+(\/post\/[^<]+)<\/loc>/gi;
  let match;

  while ((match = pattern.exec(xml)) !== null) {
    paths.add(normalizePath(match[1]));
  }

  cachedPostPaths = paths;
  cacheExpiresAt = now + 5 * 60 * 1000;
  return paths;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (STATIC_PATHS.has(pathname)) return next();

  if (pathname.startsWith('/post/')) {
    try {
      const postPaths = await getPostPaths(url.origin);
      if (postPaths.has(pathname)) return next();
    } catch {
      return next();
    }
  }

  return rewrite(new URL('/404.html', request.url), { status: 404 });
}
