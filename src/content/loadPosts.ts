import { featuredPostSlug, type SectionKey } from '../data/siteContent';
import type { BlogPost } from './postTypes';

const modules = import.meta.glob('./posts/*/index.ts', { eager: true }) as Record<
  string,
  { default: BlogPost }
>;

export const posts: BlogPost[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getFeaturedPost(): BlogPost | undefined {
  if (featuredPostSlug) {
    return posts.find((post) => post.slug === featuredPostSlug) ?? posts[0];
  }
  return posts[0];
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostsForSection(sectionKey: SectionKey): BlogPost[] {
  return sectionKey === 'everything' ? posts : posts.filter((post) => post.section === sectionKey);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const words = new Set(`${post.title} ${post.excerpt}`.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const candidateWords = `${candidate.title} ${candidate.excerpt}`.toLowerCase().match(/[a-z0-9]{4,}/g) ?? [];
      const overlap = candidateWords.filter((word) => words.has(word)).length;
      const sectionBoost = candidate.section === post.section ? 20 : 0;
      return { candidate, score: sectionBoost + overlap };
    })
    .sort((a, b) => b.score - a.score || b.candidate.publishedAt.localeCompare(a.candidate.publishedAt))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function formatPostDate(post: BlogPost): string {
  if (post.displayDate) return post.displayDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${post.publishedAt}T12:00:00`));
}
