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

test('Junk Drawer is a format-based category without changing original post sections', async () => {
  const { readPosts } = await import('../scripts/read-posts.mjs');
  const tagged = readPosts().filter((post) => post.format === 'junk-drawer');
  assert.ok(tagged.length >= 2, 'expected existing Junk Drawer pieces');
  assert.ok(tagged.every((post) => post.section === 'diary'), 'Junk Drawer must not reclassify existing posts');

  const sections = fs.readFileSync(new URL('../src/data/siteContent.ts', import.meta.url), 'utf8');
  const catalog = fs.readFileSync(new URL('../src/content/loadPosts.ts', import.meta.url), 'utf8');
  const generator = fs.readFileSync(new URL('../scripts/generate-post-metadata.mjs', import.meta.url), 'utf8');
  const sitemap = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.match(sections, /key: 'junk-drawer'/);
  assert.match(catalog, /post\.format === 'junk-drawer'/);
  assert.match(generator, /'section', 'format', 'publishedAt'/);
  assert.match(sitemap, /\/section\/junk-drawer/);
});
