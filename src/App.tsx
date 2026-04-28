import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { SectionPage } from './pages/SectionPage';
import { getPostBySlug } from './content/loadPosts';
import { sections, type SectionKey } from './data/siteContent';

type Route =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'section'; sectionKey: SectionKey; oldLinkNotice?: boolean }
  | { page: 'post'; slug: string }
  | { page: 'not-found' };

function normalizePath(pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, '');

  return cleanPath || '/';
}

function routeFromCleanPath(pathname: string): Route | null {
  const cleanPath = normalizePath(pathname);

  if (cleanPath === '/' || cleanPath === '/index.html') {
    return null;
  }

  if (cleanPath === '/about') {
    return { page: 'about' };
  }

  if (cleanPath.startsWith('/post/')) {
    const slug = decodeURIComponent(cleanPath.replace('/post/', ''));

    if (getPostBySlug(slug)) {
      return { page: 'post', slug };
    }

    return { page: 'section', sectionKey: 'everything', oldLinkNotice: true };
  }

  if (cleanPath.startsWith('/section/')) {
    const sectionKey = decodeURIComponent(cleanPath.replace('/section/', '')) as SectionKey;

    if (sections.some((section) => section.key === sectionKey)) {
      return { page: 'section', sectionKey };
    }

    return { page: 'section', sectionKey: 'everything', oldLinkNotice: true };
  }

  return { page: 'section', sectionKey: 'everything', oldLinkNotice: true };
}

function routeFromHash(hash: string): Route {
  const currentHash = hash || '#/';

  if (currentHash === '#/' || currentHash === '#') {
    return { page: 'home' };
  }

  if (currentHash === '#/about') {
    return { page: 'about' };
  }

  if (currentHash.startsWith('#/post/')) {
    return { page: 'post', slug: currentHash.replace('#/post/', '') };
  }

  if (currentHash.startsWith('#/section/')) {
    const sectionKey = currentHash.replace('#/section/', '') as SectionKey;
    return { page: 'section', sectionKey };
  }

  return { page: 'not-found' };
}

function getCurrentRoute(): Route {
  if (window.location.hash) {
    return routeFromHash(window.location.hash);
  }

  const cleanPathRoute = routeFromCleanPath(window.location.pathname);

  if (cleanPathRoute) {
    return cleanPathRoute;
  }

  return routeFromHash(window.location.hash);
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getCurrentRoute());

  useEffect(() => {
    const handleNavigationChange = () => {
      setRoute(getCurrentRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('popstate', handleNavigationChange);
    return () => {
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('popstate', handleNavigationChange);
    };
  }, []);

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'section' && (
        <SectionPage sectionKey={route.sectionKey} oldLinkNotice={route.oldLinkNotice} />
      )}
      {route.page === 'post' && <PostPage slug={route.slug} />}
      {route.page === 'not-found' && <SectionPage sectionKey="everything" oldLinkNotice />}
    </SiteShell>
  );
}
