import { getPostBySlug } from './content/loadPosts';
import { getSectionName, sections, site } from './data/siteContent';
import type { Route } from './routes';

type RouteMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  type: 'article' | 'website';
  image?: string;
};

const titleSuffix = site.title;

function titleWithSite(title: string): string {
  return title === site.title ? title : `${title} | ${titleSuffix}`;
}

function getSectionDescription(sectionKey: string): string {
  return sections.find((section) => section.key === sectionKey)?.description ?? site.description;
}

function getRouteMetadata(route: Route): RouteMetadata {
  if (route.page === 'home') {
    return {
      title: site.title,
      description: site.description,
      canonicalPath: route.canonicalPath,
      type: 'website',
    };
  }

  if (route.page === 'about') {
    return {
      title: titleWithSite('About'),
      description: site.intro,
      canonicalPath: route.canonicalPath,
      type: 'website',
    };
  }

  if (route.page === 'contact') {
    return {
      title: titleWithSite('Contact'),
      description: 'Send a note to Our Old Dad without exposing a public email address.',
      canonicalPath: route.canonicalPath,
      type: 'website',
    };
  }

  if (route.page === 'section') {
    return {
      title: titleWithSite(getSectionName(route.sectionKey)),
      description: getSectionDescription(route.sectionKey),
      canonicalPath: route.canonicalPath,
      type: 'website',
    };
  }

  if (route.page === 'post') {
    const post = getPostBySlug(route.slug);

    if (post) {
      const image = post.cardImage ?? post.heroImage;

      return {
        title: titleWithSite(post.title),
        description: post.excerpt,
        canonicalPath: route.canonicalPath,
        type: 'article',
        ...(image ? { image } : {}),
      };
    }
  }

  return {
    title: titleWithSite('Page not found'),
    description: site.description,
    canonicalPath: route.canonicalPath,
    type: 'website',
  };
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.remove();
}

function setCanonical(pathname: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  element.href = new URL(pathname, site.url).href;
}

export function applyRouteMetadata(route: Route) {
  const metadata = getRouteMetadata(route);
  const canonicalUrl = new URL(metadata.canonicalPath, site.url).href;

  document.title = metadata.title;
  setCanonical(metadata.canonicalPath);
  setMeta('name', 'description', metadata.description);
  setMeta('property', 'og:title', metadata.title);
  setMeta('property', 'og:description', metadata.description);
  setMeta('property', 'og:type', metadata.type);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:site_name', site.title);
  setMeta('name', 'twitter:card', metadata.image ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:title', metadata.title);
  setMeta('name', 'twitter:description', metadata.description);

  if (metadata.image) {
    setMeta('property', 'og:image', new URL(metadata.image, window.location.origin).href);
    setMeta('name', 'twitter:image', new URL(metadata.image, window.location.origin).href);
  } else {
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');
  }
}
