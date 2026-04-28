import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { SectionPage } from './pages/SectionPage';
import type { SectionKey } from './data/siteContent';

type Route =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'section'; sectionKey: SectionKey; oldLinkNotice?: boolean }
  | { page: 'post'; slug: string }
  | { page: 'not-found' };

function isOldDirectLink(): boolean {
  const pathname = window.location.pathname;

  return !window.location.hash && pathname !== '/' && pathname !== '/index.html';
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
  if (isOldDirectLink()) {
    return { page: 'section', sectionKey: 'everything', oldLinkNotice: true };
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
