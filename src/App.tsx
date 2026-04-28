import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { SectionPage } from './pages/SectionPage';
import type { SectionKey } from './data/siteContent';
import { getLegacyPostSlug, getPostHash } from './data/legacyRoutes';

type Route =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'section'; sectionKey: SectionKey }
  | { page: 'post'; slug: string }
  | { page: 'not-found' };

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
  const legacySlug = getLegacyPostSlug(window.location.pathname);

  if (legacySlug && !window.location.hash) {
    window.history.replaceState(null, '', `${window.location.origin}${window.location.pathname}${window.location.search}${getPostHash(legacySlug)}`);
    return { page: 'post', slug: legacySlug };
  }

  return routeFromHash(window.location.hash);
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getCurrentRoute());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'section' && <SectionPage sectionKey={route.sectionKey} />}
      {route.page === 'post' && <PostPage slug={route.slug} />}
      {route.page === 'not-found' && <HomePage />}
    </SiteShell>
  );
}
