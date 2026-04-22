import { SiteShell } from './components/SiteShell';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import type { SectionKey } from './data/siteContent';

function getRoute() {
  const hash = window.location.hash || '#/';

  if (hash === '#/' || hash === '#') {
    return { page: 'home' as const };
  }

  if (hash === '#/about') {
    return { page: 'about' as const };
  }

  if (hash.startsWith('#/section/')) {
    const sectionKey = hash.replace('#/section/', '') as SectionKey;
    return { page: 'section' as const, sectionKey };
  }

  return { page: 'home' as const };
}

export default function App() {
  const route = getRoute();

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'section' && <SectionPage sectionKey={route.sectionKey} />}
    </SiteShell>
  );
}
