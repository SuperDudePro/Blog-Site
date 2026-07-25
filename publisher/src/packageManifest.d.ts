export type NormalizedImage = {
  file: string;
  role: string;
  alt: string;
  caption: string | null;
};

export type NormalizedManifest = {
  targetSite: string;
  repository: string;
  title: string;
  slug: string;
  publishedAt: string;
  status: string;
  section: string;
  excerpt: string;
  canonicalUrl: string;
  destinationPath: string;
  buildCommand: string;
  images: NormalizedImage[];
  playlistLinks?: {
    youtube: string;
    youtubeMusic: string;
    playlistId: string;
  };
};

export function extractField(source: string, field: string): string;
export function normalizePackageManifest(raw: unknown, source?: string): NormalizedManifest;
