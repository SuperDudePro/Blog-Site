import { getSiteProfile } from '../siteProfiles.mjs';

const asString = (value) => typeof value === 'string' ? value.trim() : '';

export function extractField(source, field) {
  return source.match(new RegExp(`${field}:\\s*(?:\\n\\s*)?(["'])([\\s\\S]*?)\\1,`))?.[2]?.trim() ?? '';
}

export function normalizePackageManifest(raw, source = '') {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Package manifest must be a JSON object.');
  }

  const slug = asString(raw.slug) || extractField(source, 'slug');
  if (!slug) throw new Error('Package manifest is missing slug.');
  const hintedTarget = asString(raw.targetSite) || asString(raw.site);
  const hintedRepository = asString(raw.repository);
  const profile = hintedTarget || hintedRepository
    ? getSiteProfile({ targetSite: hintedTarget, repository: hintedRepository })
    : getSiteProfile({ targetSite: 'Our Old Dad' });

  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages.map((image, index) => {
    if (!image || typeof image !== 'object' || Array.isArray(image)) {
      throw new Error(`Image record ${index + 1} must be an object.`);
    }
    const file = asString(image.file) || asString(image.filename);
    if (!file) throw new Error(`Image record ${index + 1} is missing file or filename.`);
    return {
      file,
      role: asString(image.role) || 'image',
      alt: asString(image.alt),
      caption: asString(image.caption) || null,
    };
  });

  const rawPlaylist = raw.playlistLinks && typeof raw.playlistLinks === 'object' && !Array.isArray(raw.playlistLinks)
    ? raw.playlistLinks
    : null;
  const playlistLinks = rawPlaylist
    ? {
        youtube: asString(rawPlaylist.youtube),
        youtubeMusic: asString(rawPlaylist.youtubeMusic),
        playlistId: asString(rawPlaylist.playlistId),
      }
    : undefined;

  return {
    targetSite: hintedTarget || profile.targetSite,
    repository: hintedRepository || profile.repository,
    title: asString(raw.title) || extractField(source, 'title'),
    slug,
    publishedAt: asString(raw.publishedAt) || extractField(source, 'publishedAt'),
    status: asString(raw.status) || extractField(source, 'status'),
    section: asString(raw.section) || extractField(source, 'section'),
    topic: asString(raw.topic) || extractField(source, 'topic'),
    tags: Array.isArray(raw.tags) ? raw.tags.map(asString).filter(Boolean) : [],
    excerpt: asString(raw.excerpt) || extractField(source, 'excerpt'),
    canonicalUrl: asString(raw.canonicalUrl) || `${profile.canonicalPrefix}${slug}`,
    destinationPath: asString(raw.destinationPath) || asString(raw.destination) || `src/content/posts/${slug}/`,
    buildCommand: asString(raw.buildCommand) || profile.buildCommand,
    images,
    ...(playlistLinks ? { playlistLinks } : {}),
  };
}
