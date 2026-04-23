import type { SectionKey } from '../data/siteContent';
import type { BlogPost } from './postTypes';

const modules = import.meta.glob('./posts/*/index.ts', { eager: true }) as Record<
  string,
  { default: BlogPost }
>;

export const posts: BlogPost[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getFeaturedPost(): BlogPost | undefined {
  return posts.find((post) => post.status === 'Featured') ?? posts[0];
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostsForSection(sectionKey: SectionKey): BlogPost[] {
  if (sectionKey === 'everything') {
    return posts;
  }

  return posts.filter((post) => post.section === sectionKey);
}

export function formatPostDate(post: BlogPost): string {
  if (post.displayDate) {
    return post.displayDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${post.publishedAt}T12:00:00`));
}
