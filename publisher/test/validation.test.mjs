import assert from 'node:assert/strict';
import test from 'node:test';
import { validateManifest, validateProductionPaths } from '../lib/validation.mjs';

const images = (prefix = '', count = 4) => [
  { file: `${prefix}card-image.webp`, role: 'card', alt: 'Card.', caption: null },
  { file: `${prefix}hero-image.webp`, role: 'hero', alt: 'Hero.', caption: null },
  ...Array.from({ length: count }, (_, index) => ({
    file: `${prefix}body-image-${index + 1}.webp`,
    role: `body-${index + 1}`,
    alt: `Body ${index + 1}.`,
    caption: null,
  })),
];

const lifeeducation = {
  targetSite: 'LifeEducation',
  repository: 'SuperDudePro/LifeEducationOrg',
  title: 'Adaptive Test',
  slug: 'adaptive-test',
  excerpt: 'Publisher profile fixture.',
  publishedAt: '2026-07-28',
  status: 'Draft',
  topic: 'Founding Notes',
  tags: ['LifeEducation', 'Education'],
  destinationPath: 'src/content/posts/adaptive-test/',
  canonicalUrl: 'https://www.lifeeducation.org/posts/adaptive-test',
  buildCommand: 'npm run check',
  images: images('images/', 6),
};

test('accepts a six-body LifeEducation manifest and exact production folder', () => {
  assert.equal(validateManifest(lifeeducation), lifeeducation);
  assert.deepEqual(validateProductionPaths(lifeeducation, [
    'meta.ts',
    'index.tsx',
    ...lifeeducation.images.map((image) => image.file),
  ]), [
    'meta.ts',
    'index.tsx',
    ...lifeeducation.images.map((image) => image.file),
  ]);
});

test('rejects unrelated files from the atomic destination replacement', () => {
  assert.throws(() => validateProductionPaths(lifeeducation, [
    'meta.ts',
    'index.tsx',
    ...lifeeducation.images.map((image) => image.file),
    'notes.md',
  ]), /Unexpected production file/);
});

test('rejects invalid LifeEducation statuses and tags', () => {
  assert.throws(() => validateManifest({ ...lifeeducation, status: 'Starter' }), /Unsupported LifeEducation status/);
  assert.throws(() => validateManifest({ ...lifeeducation, tags: [] }), /tags/);
});

test('preserves the existing Our Old Dad profile', () => {
  const manifest = {
    targetSite: 'Our Old Dad',
    repository: 'SuperDudePro/Blog-Site',
    title: 'Existing Route',
    slug: 'existing-route',
    excerpt: 'Publisher profile fixture.',
    publishedAt: '2026-07-28',
    status: 'Recent',
    section: 'diary',
    destinationPath: 'src/content/posts/existing-route/',
    canonicalUrl: 'https://ourolddad.com/post/existing-route',
    buildCommand: 'npm run build',
    images: images('', 4),
  };
  assert.equal(validateManifest(manifest), manifest);
});
