import assert from 'node:assert/strict';
import test from 'node:test';
import {
  branchFor,
  collectPackagePreflightErrors,
  validateManifest,
  validatePackagePreflight,
  validateProductionPaths,
} from '../lib/validation.mjs';

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

function lifeeducationPreflight() {
  const sourceFiles = {
    'meta.ts': `
import cardImage from "./images/card-image.webp";
import heroImage from "./images/hero-image.webp";
export const metadata = {
  title: "Adaptive Test",
  slug: "adaptive-test",
  excerpt: "Publisher profile fixture.",
  publishedAt: "2026-07-28",
  status: "Draft",
  topic: "Founding Notes",
  tags: ["LifeEducation", "Education"],
  cardImage,
  cardAlt: "Card.",
  heroImage,
  heroAlt: "Hero.",
};`,
    'index.tsx': `
import body1 from "./images/body-image-1.webp";
import body2 from "./images/body-image-2.webp";
import body3 from "./images/body-image-3.webp";
import body4 from "./images/body-image-4.webp";
const post = { body: <>
  <PostFigure src={body1} alt="Body 1." />
  <PostFigure src={body2} alt="Body 2." />
  <PostFigure src={body3} alt="Body 3." />
  <PostFigure src={body4} alt="Body 4." />
  <a href="/contact">Tell us what we missed.</a>
</> };`,
  };
  return {
    manifest: { ...lifeeducation, images: images('images/', 4) },
    productionPaths: [
      'meta.ts',
      'index.tsx',
      ...images('images/', 4).map((image) => image.file),
    ],
    sourceFiles,
    imageMetadata: images('images/', 4).map((image) => ({
      file: image.file,
      role: image.role,
      readable: true,
      width: image.role === 'card' ? 960 : image.role === 'hero' ? 1600 : 1200,
      height: image.role === 'hero' ? 900 : image.role === 'card' ? 720 : 900,
      bytes: 30,
    })),
  };
}

test('server preflight accepts a complete package before GitHub writes', () => {
  const fixture = lifeeducationPreflight();
  assert.deepEqual(collectPackagePreflightErrors(fixture), []);
  assert.equal(validatePackagePreflight(fixture), fixture);
});

test('server preflight returns all simultaneously detectable package defects', () => {
  const fixture = lifeeducationPreflight();
  fixture.manifest = {
    ...fixture.manifest,
    canonicalUrl: 'https://www.lifeeducation.org/posts/wrong',
    status: 'Starter',
    tags: [],
  };
  fixture.productionPaths = fixture.productionPaths
    .filter((path) => path !== 'images/hero-image.webp')
    .concat('notes.md');
  fixture.sourceFiles['index.tsx'] = fixture.sourceFiles['index.tsx'].replace(
    '<a href="/contact">Tell us what we missed.</a>',
    '',
  ).replace('src={body1} alt="Body 1."', 'src={body2} alt="Body 1."');
  fixture.imageMetadata = fixture.imageMetadata.map((image) => (
    image.role === 'card' ? { ...image, width: 1000, height: 750 } : image
  ));
  const errors = collectPackagePreflightErrors(fixture);
  assert.ok(errors.length >= 6, errors.join('\n'));
  assert.ok(errors.some((error) => error.includes('Canonical URL')));
  assert.ok(errors.some((error) => error.includes('Unsupported LifeEducation status')));
  assert.ok(errors.some((error) => error.includes('tags')));
  assert.ok(errors.some((error) => error.includes('Unexpected production file')));
  assert.ok(errors.some((error) => error.includes('Missing production file')));
  assert.ok(errors.some((error) => error.includes('missing a reader CTA')));
  assert.ok(errors.some((error) => error.includes('1000x750')));
  assert.ok(errors.some((error) => error.includes('imported but not rendered')));
  assert.throws(
    () => validatePackagePreflight(fixture),
    (error) => error.code === 'PACKAGE_PREFLIGHT_FAILED' && error.details.errors.length === errors.length,
  );
});

test('uses one deterministic branch for repeat uploads', () => {
  assert.equal(branchFor('adaptive-test'), 'publisher/adaptive-test');
  assert.equal(branchFor('adaptive-test'), 'publisher/adaptive-test');
});
