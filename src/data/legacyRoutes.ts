import { posts } from '../content/loadPosts';

const legacyPathRedirects: Record<string, string> = {
  // Add exact legacy paths here when you find them.
  // Examples:
  // '/2024/04/old-post-title/': 'new-post-slug',
  // '/old-post-title/': 'new-post-slug',
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const clean = pathname
    .trim()
    .replace(/\/+$/, '')
    .replace(/^\/?/, '/')
    .toLowerCase();

  return clean === '' ? '/' : clean;
}

function slugify(value: string): string {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/\.html?$/, '')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const currentSlugs = new Set(posts.map((post) => post.slug));

export function getLegacyPostSlug(pathname: string): string | null {
  const normalized = normalizePath(pathname);

  if (normalized === '/') {
    return null;
  }

  const exactRedirect = legacyPathRedirects[normalized];
  if (exactRedirect && currentSlugs.has(exactRedirect)) {
    return exactRedirect;
  }

  const pathParts = normalized.split('/').filter(Boolean);

  if (pathParts.length === 0) {
    return null;
  }

  const lastPart = pathParts[pathParts.length - 1];
  if (!lastPart) {
    return null;
  }

  const candidate = slugify(lastPart);

  if (candidate && currentSlugs.has(candidate)) {
    return candidate;
  }

  return null;
}
