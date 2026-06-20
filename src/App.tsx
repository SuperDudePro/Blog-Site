import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { applyRouteMetadata } from './metadata';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { SectionPage } from './pages/SectionPage';
import { getCurrentRoute, type Route } from './routes';

function replaceWithCanonicalPath(route: Route) {
  if (route.replacePath) {
    window.history.replaceState(null, '', route.replacePath);
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getCurrentRoute());

  useEffect(() => {
    const handleNavigationChange = () => {
      const nextRoute = getCurrentRoute();
      replaceWithCanonicalPath(nextRoute);
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    replaceWithCanonicalPath(route);
    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('popstate', handleNavigationChange);
    return () => {
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('popstate', handleNavigationChange);
    };
  }, []);

  useEffect(() => {
    replaceWithCanonicalPath(route);
    applyRouteMetadata(route);
  }, [route]);

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'contact' && <ContactPage />}
      {route.page === 'section' && (
        <SectionPage sectionKey={route.sectionKey} oldLinkNotice={route.oldLinkNotice} />
      )}
      {route.page === 'post' && <PostPage slug={route.slug} />}
      {route.page === 'not-found' && <SectionPage sectionKey="everything" oldLinkNotice />}
    </SiteShell>
  );
}
