import type { LifeEducationPost } from "./postTypes";

const modules = import.meta.glob("../posts/*/index.tsx", { eager: true }) as Record<
  string,
  { default: LifeEducationPost }
>;

export const posts: LifeEducationPost[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getPostBySlug(slug: string): LifeEducationPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getRecentPosts(limit?: number): LifeEducationPost[] {
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}

export function formatPostDate(post: LifeEducationPost): string {
  if (post.displayDate) return post.displayDate;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${post.publishedAt}T12:00:00`));
}
