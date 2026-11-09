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
  assert.equal(tagged.length, 3, 'expected all three currently published Junk Drawer pieces');
  assert.ok(tagged.every((post) => post.section === 'diary'), 'Junk Drawer must not reclassify existing posts');

  const sections = fs.readFileSync(new URL('../src/data/siteContent.ts', import.meta.url), 'utf8');
  const catalog = fs.readFileSync(new URL('../src/content/loadPosts.ts', import.meta.url), 'utf8');
  const generator = fs.readFileSync(new URL('../scripts/generate-post-metadata.mjs', import.meta.url), 'utf8');
  const sitemap = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.match(sections, /key: 'junk-drawer'/);
  assert.match(catalog, /post\.format === 'junk-drawer'/);
  assert.match(catalog, /getPostCategoryKey\(post\) === sectionKey/);
  assert.match(generator, /'section', 'format', 'publishedAt'/);
  assert.match(sitemap, /\/section\/junk-drawer/);
});


test('all post records have valid public categories and dates, with no stale generated index at build time', async () => {
  const { readPosts } = await import('../scripts/read-posts.mjs');
  const records = readPosts();
  const valid = new Set(['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice']);
  const known = new Set();
  for (const record of records) {
    assert.equal(record.missingIndex, undefined, record.folder + ' lacks index.ts');
    assert.ok(record.slug && record.title && record.excerpt, record.folder + ' missing required identity fields');
    assert.equal(record.slug, record.folder, record.folder + ' slug and folder differ');
    assert.ok(valid.has(record.section), record.folder + ' invalid section: ' + record.section);
    assert.ok(!record.format || record.format === 'junk-drawer', record.folder + ' unsupported format');
    assert.match(record.publishedAt, /^\\d{4}-\\d{2}-\\d{2}$/, record.folder + ' invalid date');
    assert.ok(!known.has(record.slug), record.slug + ' appears more than once');
    known.add(record.slug);
  }
  const generated = fs.readFileSync(new URL('../src/content/postMetadata.generated.ts', import.meta.url), 'utf8');
  const slugs = [...generated.matchAll(/\\bslug: "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(new Set(slugs), known, 'generated metadata must match the full post directory');
});

test('post cards and article headers use public categories instead of a permanent Recent status', () => {
  const card = fs.readFileSync(new URL('../src/components/PostCard.tsx', import.meta.url), 'utf8');
  const page = fs.readFileSync(new URL('../src/pages/PostPage.tsx', import.meta.url), 'utf8');
  const metadata = fs.readFileSync(new URL('../src/metadata.ts', import.meta.url), 'utf8');
  assert.match(card, /getPostCategoryName\\(post\\)/);
  assert.doesNotMatch(card, /post\\.status|['"]Recent['"]/);
  assert.match(page, /getPostCategoryName\\(post\\)/);
  assert.match(page, /sectionPath\\(getPostCategoryKey\\(post\\)\\)/);
  assert.match(metadata, /articleSection: getPostCategoryName\\(post\\)/);
  const pages = fs.readFileSync(new URL('../scripts/generate-route-pages.mjs', import.meta.url), 'utf8');
  assert.match(pages, /articleSection: sectionNames\\.get\\(postCategory\\(metadata\\.post\\)\\)/);
});
