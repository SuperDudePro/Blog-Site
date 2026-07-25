import assert from 'node:assert/strict';
import test from 'node:test';
import { compareDestination } from '../lib/repository.mjs';

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
