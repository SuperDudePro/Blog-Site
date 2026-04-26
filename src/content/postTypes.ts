import type { SectionKey } from '../data/siteContent';

export type PublicSectionKey = Exclude<SectionKey, 'everything'>;
export type PostStatus = 'Featured' | 'Recent' | 'Starter';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  section: PublicSectionKey;
  publishedAt: string;
  displayDate?: string;
  status?: PostStatus;
  heroImage?: string;
  heroAlt?: string;
  cardImage?: string;
  cardAlt?: string;
  bodyHtml: string;
};
