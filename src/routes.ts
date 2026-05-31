import { getPostBySlug } from './content/loadPosts';
import { getLegacyPostSlug } from './data/legacyRoutes';
import { sections, type SectionKey } from './data/siteContent';

export type Route =
  | { page: 'home'; canonicalPath: string; replacePath?: string }
  | { page: 'about'; canonicalPath: string; replacePath?: string }
  | {
      page: 'section';
      sectionKey: SectionKey;
      oldLinkNotice?: boolean;
      canonicalPath: string;
      replacePath?: string;
    }
  | { page: 'post'; slug: string; canonicalPath: string; replacePath?: string }
  | { page: 'not-found'; canonicalPath: string; replacePath?: string };

export const homePath = '/';
export const aboutPath = '/about';

export function normalizePath(pathname: string): string {
  const cleanPath = pathname.trim().replace(/\/+$/, '');

  return cleanPath || homePath;
}

export function postPath(slug: string): string {
  return `/post/${encodeURIComponent(slug)}`;
}

export function sectionPath(sectionKey: SectionKey): string {
  return `/section/${sectionKey}`;
}

export function isSectionKey(value: string): value is SectionKey {
  return sections.some((section) => section.key === value);
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function everythingRoute(oldLinkNotice = false): Route {
  return {
    page: 'section',
    sectionKey: 'everything',
    oldLinkNotice,
    canonicalPath: sectionPath('everything'),
  };
}

export function routeFromPath(pathname: string): Route {
  const cleanPath = normalizePath(pathname);

  if (cleanPath === homePath || cleanPath === '/index.html') {
    return { page: 'home', canonicalPath: homePath };
  }

  if (cleanPath === aboutPath) {
    return { page: 'about', canonicalPath: aboutPath };
  }

  const postMatch = cleanPath.match(/^\/post\/([^/]+)$/);
  if (postMatch?.[1]) {
    const slug = decodeSegment(postMatch[1]);

    if (getPostBySlug(slug)) {
      return { page: 'post', slug, canonicalPath: postPath(slug) };
    }

    return everythingRoute(true);
  }

  const sectionMatch = cleanPath.match(/^\/section\/([^/]+)$/);
  if (sectionMatch?.[1]) {
    const sectionKey = decodeSegment(sectionMatch[1]);

    if (isSectionKey(sectionKey)) {
      return { page: 'section', sectionKey, canonicalPath: sectionPath(sectionKey) };
    }

    return everythingRoute(true);
  }

  const legacySlug = getLegacyPostSlug(cleanPath);
  if (legacySlug) {
    const canonicalPath = postPath(legacySlug);
    return { page: 'post', slug: legacySlug, canonicalPath, replacePath: canonicalPath };
  }

  return everythingRoute(true);
}

export function routeFromHash(hash: string): Route | null {
  if (!hash || hash === '#') {
    return null;
  }

  if (!hash.startsWith('#/')) {
    return { page: 'not-found', canonicalPath: sectionPath('everything') };
  }

  const route = routeFromPath(hash.slice(1));
  return { ...route, replacePath: route.canonicalPath };
}

export function getCurrentRoute(): Route {
  const hashRoute = routeFromHash(window.location.hash);

  if (hashRoute) {
    return hashRoute;
  }

  return routeFromPath(window.location.pathname);
}
