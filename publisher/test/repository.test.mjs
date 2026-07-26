import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTreeEntries, compareDestination } from '../lib/repository.mjs';

test('classifies a complete replacement folder safely', () => {
  const existing = [
    { path: 'index.ts', sha: 'old-index' },
    { path: 'card-image.webp', sha: 'same-card' },
    { path: 'old-unused.webp', sha: 'old-image' },
  ];
  const uploaded = [
    { path: 'index.ts', sha: 'new-index' },
    { path: 'card-image.webp', sha: 'same-card' },
    { path: 'hero-image.webp', sha: 'new-hero' },
  ];

  assert.deepEqual(compareDestination(existing, uploaded), {
    added: ['hero-image.webp'],
    replaced: ['index.ts'],
    unchanged: ['card-image.webp'],
    deleted: ['old-unused.webp'],
  });
});

test('classifies a new post as additions only', () => {
  assert.deepEqual(compareDestination([], [
    { path: 'index.ts', sha: 'index' },
    { path: 'hero-image.webp', sha: 'hero' },
  ]), {
    added: ['hero-image.webp', 'index.ts'],
    replaced: [],
    unchanged: [],
    deleted: [],
  });
});

test('builds Git tree deletion entries with the required mode and type', () => {
  const uploaded = [
    { path: 'index.ts', sha: 'new-index' },
    { path: 'card-image.webp', sha: 'new-card' },
    { path: 'hero-image.webp', sha: 'new-hero' },
    { path: 'body-image-1.webp', sha: 'body-1' },
    { path: 'body-image-2.webp', sha: 'body-2' },
    { path: 'body-image-3.webp', sha: 'body-3' },
    { path: 'body-image-4.webp', sha: 'body-4' },
  ];

  const entries = buildTreeEntries(
    'src/content/posts/journey-40-songs-and-a-time-machine/',
    uploaded,
    ['band-inline.jpg', 'top-square.jpg'],
  );

  assert.equal(entries.length, 9);
  assert.deepEqual(entries.slice(-2), [
    {
      path: 'src/content/posts/journey-40-songs-and-a-time-machine/band-inline.jpg',
      mode: '100644',
      type: 'blob',
      sha: null,
    },
    {
      path: 'src/content/posts/journey-40-songs-and-a-time-machine/top-square.jpg',
      mode: '100644',
      type: 'blob',
      sha: null,
    },
  ]);
});
