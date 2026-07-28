export const SITE_PROFILES = [
  {
    id: 'our-old-dad',
    targetSite: 'Our Old Dad',
    repository: 'SuperDudePro/Blog-Site',
    canonicalPrefix: 'https://ourolddad.com/post/',
    buildCommand: 'npm run build',
    sourceFiles: ['index.ts'],
    metadataFields: ['title', 'slug', 'excerpt', 'section', 'publishedAt', 'status'],
    imageDirectory: '',
    statuses: ['Featured', 'Recent', 'Starter', 'Draft'],
    sections: ['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice'],
  },
  {
    id: 'lifeeducation',
    targetSite: 'LifeEducation',
    repository: 'SuperDudePro/LifeEducationOrg',
    canonicalPrefix: 'https://www.lifeeducation.org/posts/',
    buildCommand: 'npm run check',
    sourceFiles: ['meta.ts', 'index.tsx'],
    metadataFields: ['title', 'slug', 'excerpt', 'publishedAt', 'status', 'topic'],
    imageDirectory: 'images/',
    statuses: ['Featured', 'Recent', 'Coming Soon', 'Draft'],
    sections: [],
  },
];

const text = (value) => String(value ?? '').trim().toLowerCase();

export function getSiteProfile(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new Error('Manifest is missing.');
  const repository = text(manifest.repository);
  const targetSite = text(manifest.targetSite || manifest.site);
  const profile = SITE_PROFILES.find((candidate) => (
    (repository && text(candidate.repository) === repository)
    || (targetSite && text(candidate.targetSite) === targetSite)
  ));
  if (!profile) throw new Error(`Unsupported site profile: ${manifest.repository || manifest.targetSite || manifest.site || 'unknown'}`);
  if (repository && text(profile.repository) !== repository) throw new Error('Manifest target site and repository do not match.');
  if (targetSite && text(profile.targetSite) !== targetSite) throw new Error('Manifest target site and repository do not match.');
  return profile;
}

export function expectedImageRecords(profile, bodyCount) {
  const prefix = profile.imageDirectory;
  return [
    { file: `${prefix}card-image.webp`, role: 'card' },
    { file: `${prefix}hero-image.webp`, role: 'hero' },
    ...Array.from({ length: bodyCount }, (_, index) => ({
      file: `${prefix}body-image-${index + 1}.webp`,
      role: `body-${index + 1}`,
    })),
  ];
}

export function imageManifestErrors(profile, images) {
  if (!Array.isArray(images)) return ['Manifest images must be an array.'];
  const errors = [];
  const bodyRecords = images.filter((image) => /^body-\d+$/.test(String(image?.role || '')));
  if (bodyRecords.length < 4) errors.push('At least four body images are required.');
  const expected = expectedImageRecords(profile, bodyRecords.length);
  if (images.length !== expected.length) errors.push(`Expected card, hero, and ${bodyRecords.length} body image records.`);
  expected.forEach((record, index) => {
    const actual = images[index] || {};
    if (actual.file !== record.file) errors.push(`Image ${index + 1} must use ${record.file}.`);
    if (actual.role !== record.role) errors.push(`Image ${index + 1} must use role ${record.role}.`);
    if (!String(actual.alt || '').trim()) errors.push(`${record.file} is missing alt text.`);
    if (!Object.prototype.hasOwnProperty.call(actual, 'caption')) errors.push(`${record.file} is missing a caption field.`);
  });
  if (new Set(images.map((image) => image?.file)).size !== images.length) errors.push('Image filenames must be unique.');
  return [...new Set(errors)];
}

export function allowedProductionPaths(profile, images) {
  return new Set([
    ...profile.sourceFiles,
    ...(Array.isArray(images) ? images.map((image) => image.file) : []),
  ]);
}
