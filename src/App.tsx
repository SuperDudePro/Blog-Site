import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import type { SectionKey } from './data/siteContent';

type Route =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'section'; sectionKey: SectionKey }
  | { page: 'not-found' };

function getRouteFromHash(hash: string): Route {
  const currentHash = hash || '#/';

  if (currentHash === '#/' || currentHash === '#') {
    return { page: 'home' };
  }

  if (currentHash === '#/about') {
    return { page: 'about' };
  }

  if (currentHash.startsWith('#/section/')) {
    const sectionKey = currentHash.replace('#/section/', '') as SectionKey;
    return { page: 'section', sectionKey };
  }

  return { page: 'not-found' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'section' && <SectionPage sectionKey={route.sectionKey} />}
      {route.page === 'not-found' && <HomePage />}
    </SiteShell>
  );
}
