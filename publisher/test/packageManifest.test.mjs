import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePackageManifest } from '../src/packageManifest.js';

test('normalizes image-studio manifests that use filename', () => {
  const manifest = normalizePackageManifest({
    site: 'Our Old Dad',
    slug: 'existing-post',
    title: 'Existing Post',
    publishedAt: '2026-07-25',
    destination: 'src/content/posts/existing-post/',
    canonicalUrl: 'https://ourolddad.com/post/existing-post',
    images: [
      { filename: 'card-image.webp', role: 'card', alt: 'Card image.' },
      { filename: 'hero-image.webp', role: 'hero', alt: 'Hero image.' },
    ],
  });

  assert.equal(manifest.repository, 'SuperDudePro/Blog-Site');
  assert.equal(manifest.destinationPath, 'src/content/posts/existing-post/');
  assert.equal(manifest.buildCommand, 'npm run build');
  assert.deepEqual(manifest.images.map((image) => image.file), ['card-image.webp', 'hero-image.webp']);
});

test('preserves publisher manifests that already use file', () => {
  const manifest = normalizePackageManifest({
    targetSite: 'Our Old Dad',
    repository: 'SuperDudePro/Blog-Site',
    slug: 'new-post',
    title: 'New Post',
    destinationPath: 'src/content/posts/new-post/',
    canonicalUrl: 'https://ourolddad.com/post/new-post',
    buildCommand: 'npm run build',
    images: [{ file: 'body-image-1.webp', role: 'body', alt: 'Body image.', caption: null }],
  });

  assert.equal(manifest.images[0].file, 'body-image-1.webp');
});

test('selects LifeEducation defaults from the target site', () => {
  const manifest = normalizePackageManifest({
    targetSite: 'LifeEducation',
    slug: 'capability-over-credit',
    title: 'Capability Over Credit',
    publishedAt: '2026-07-28',
    status: 'Draft',
    topic: 'Founding Notes',
    tags: ['LifeEducation', 'Capability'],
    images: [],
  });

  assert.equal(manifest.repository, 'SuperDudePro/LifeEducationOrg');
  assert.equal(manifest.destinationPath, 'src/content/posts/capability-over-credit/');
  assert.equal(manifest.canonicalUrl, 'https://www.lifeeducation.org/posts/capability-over-credit');
  assert.equal(manifest.buildCommand, 'npm run check');
  assert.equal(manifest.topic, 'Founding Notes');
  assert.deepEqual(manifest.tags, ['LifeEducation', 'Capability']);
});

test('rejects contradictory site and repository hints', () => {
  assert.throws(() => normalizePackageManifest({
    targetSite: 'LifeEducation',
    repository: 'SuperDudePro/Blog-Site',
    slug: 'wrong-route',
  }), /do not match/);
});
