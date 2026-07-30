import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loader = fs.readFileSync(new URL('../src/content/loadPosts.ts', import.meta.url), 'utf8');

test('post bodies use lazy module loaders', () => {
  assert.match(loader, /import\.meta\.glob\('\.\/posts\/\*\/index\.ts'\)/);
  assert.doesNotMatch(loader, /eager:\s*true/);
  assert.match(loader, /await loader\(\)/);
});

test('listing data comes from the lightweight metadata index', () => {
  assert.match(loader, /postMetadata\.generated/);
  assert.match(loader, /export const posts: PostMetadata\[\]/);
});
