import { useEffect, useState } from 'react';
import { LongPostNav } from './components/LongPostNav';
import { SiteShell } from './components/SiteShell';
import { applyRouteMetadata } from './metadata';
import { getPostMetadataBySlug, getPostCategoryKey } from './content/loadPosts';
import { sectionPath } from './routes';
import { AboutPage } from './pages/AboutPage';
import { ArchivePage } from './pages/ArchivePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { PlaylistDirectoryPage } from './pages/PlaylistDirectoryPage';
import { SectionPage } from './pages/SectionPage';
import { getCurrentRoute, type Route } from './routes';

function replaceWithCanonicalPath(route: Route) {
  if (route.replacePath) window.history.replaceState(null, '', route.replacePath);
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

  const readerReturn = (() => {
    if (route.page === 'post') {
      const post = getPostMetadataBySlug(route.slug);
      if (post) {
        const category = getPostCategoryKey(post);
        return category === 'music-playlists'
          ? { href: '/playlists', label: 'All playlists' }
          : { href: sectionPath(category), label: 'This category' };
      }
    }
    if (route.page === 'section') return { href: '/categories', label: 'All categories' };
    if (route.page === 'playlists') return { href: sectionPath('music-playlists'), label: 'Music posts' };
    return { href: '/archive', label: 'All posts' };
  })();

  return (
    <SiteShell>
      {route.page === 'home' && <HomePage />}
      {route.page === 'categories' && <CategoriesPage />}
      {route.page === 'archive' && <ArchivePage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'contact' && <ContactPage />}
      {route.page === 'section' && <SectionPage sectionKey={route.sectionKey} oldLinkNotice={route.oldLinkNotice} />}
      {route.page === 'post' && <PostPage slug={route.slug} />}
      {route.page === 'playlists' && <PlaylistDirectoryPage />}
      {route.page === 'not-found' && <SectionPage sectionKey="everything" oldLinkNotice />}
      <LongPostNav homeHref="/" postsHref={readerReturn.href} postsLabel={readerReturn.label} />
    </SiteShell>
  );
}
