import { getPostMetadataBySlug } from './content/loadPosts';
import { getSectionName, sections, site } from './data/siteContent';
import type { Route } from './routes';

type RouteMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  type: 'article' | 'website';
  image?: string;
};

type JsonLd = Record<string, unknown>;
const authorId = `${site.url}/#author`;
const websiteId = `${site.url}/#website`;
const titleWithSite = (title: string) => title === site.title ? title : `${title} | ${site.title}`;
const getSectionDescription = (key: string) => sections.find((section) => section.key === key)?.description ?? site.description;

function getRouteMetadata(route: Route): RouteMetadata {
  if (route.page === 'home') return { title: site.title, description: site.description, canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'categories') return { title: titleWithSite('Categories'), description: 'Browse every Our Old Dad category and find the latest post in each one.', canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'archive') return { title: titleWithSite('Archive'), description: 'Search every published Our Old Dad post by words, section, or year.', canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'about') return { title: titleWithSite('About'), description: site.intro, canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'contact') return { title: titleWithSite('Contact'), description: 'Send a note to Our Old Dad without exposing a public email address.', canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'section') return { title: titleWithSite(getSectionName(route.sectionKey)), description: getSectionDescription(route.sectionKey), canonicalPath: route.canonicalPath, type: 'website' };
  if (route.page === 'post') {
    const post = getPostMetadataBySlug(route.slug);
    if (post) {
      const image = post.cardImage ?? post.heroImage;
      return { title: titleWithSite(post.title), description: post.excerpt, canonicalPath: route.canonicalPath, type: 'article', ...(image ? { image } : {}) };
    }
  }
  return { title: titleWithSite('Page not found'), description: site.description, canonicalPath: route.canonicalPath, type: 'website' };
}

const absoluteUrl = (pathname: string) => new URL(pathname, site.url).href;
function breadcrumb(items: Array<{ name: string; path: string }>): JsonLd {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

function getStructuredData(route: Route, metadata: RouteMetadata): JsonLd {
  const canonicalUrl = absoluteUrl(metadata.canonicalPath);
  const graph: JsonLd[] = [
    { '@type': 'Person', '@id': authorId, name: 'Will Gayhart', url: `${site.url}/about` },
    { '@type': 'WebSite', '@id': websiteId, url: `${site.url}/`, name: site.title, description: site.description, publisher: { '@id': authorId } },
  ];
  if (route.page === 'post') {
    const post = getPostMetadataBySlug(route.slug);
    if (post) {
      const image = post.cardImage ?? post.heroImage;
      graph.push({ '@type': 'BlogPosting', '@id': `${canonicalUrl}#article`, headline: post.title, description: post.excerpt, url: canonicalUrl, mainEntityOfPage: canonicalUrl, datePublished: post.publishedAt, ...(post.modifiedAt ? { dateModified: post.modifiedAt } : {}), author: { '@id': authorId }, publisher: { '@id': authorId }, isPartOf: { '@id': websiteId }, articleSection: getSectionName(post.section), ...(image ? { image: absoluteUrl(image) } : {}) });
      graph.push(breadcrumb([{ name: 'Home', path: '/' }, { name: getSectionName(post.section), path: `/section/${post.section}` }, { name: post.title, path: route.canonicalPath }]));
    }
  } else if (route.page === 'section') {
    graph.push(breadcrumb([{ name: 'Home', path: '/' }, { name: getSectionName(route.sectionKey), path: route.canonicalPath }]));
  } else if (route.page !== 'home' && route.page !== 'not-found') {
    graph.push(breadcrumb([{ name: 'Home', path: '/' }, { name: metadata.title.replace(` | ${site.title}`, ''), path: route.canonicalPath }]));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.appendChild(element); }
  element.content = content;
}
function removeMeta(attribute: 'name' | 'property', key: string) { document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.remove(); }
function setCanonical(pathname: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) { element = document.createElement('link'); element.rel = 'canonical'; document.head.appendChild(element); }
  element.href = absoluteUrl(pathname);
}
function setStructuredData(data: JsonLd) {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-site-jsonld]');
  if (!element) { element = document.createElement('script'); element.type = 'application/ld+json'; element.dataset.siteJsonld = 'true'; document.head.appendChild(element); }
  element.textContent = JSON.stringify(data);
}

export function applyRouteMetadata(route: Route) {
  const metadata = getRouteMetadata(route);
  const canonicalUrl = absoluteUrl(metadata.canonicalPath);
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
  setStructuredData(getStructuredData(route, metadata));
  if (metadata.image) {
    setMeta('property', 'og:image', new URL(metadata.image, window.location.origin).href);
    setMeta('name', 'twitter:image', new URL(metadata.image, window.location.origin).href);
  } else {
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');
  }
}
