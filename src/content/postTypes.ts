import type { ReactNode } from "react";

export type PostStatus = "Featured" | "Recent" | "Coming Soon";

export type LifeEducationPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  displayDate?: string;
  status?: PostStatus;
  topic?: string;
  tags?: string[];
  heroImage?: string;
  heroAlt?: string;
  cardImage?: string;
  cardAlt?: string;
  body: ReactNode;
};
