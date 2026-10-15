import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SITE_URL = 'https://ourolddad.com';
process.env.INDEXNOW_KEY = 'test-only';
process.env.INDEXNOW_TEST_MODE = '1';
const { urlsForPush } = await import('../scripts/submit-indexnow.mjs');

test('site-wide crawler change submits complete sitemap', () => {
  for (const file of ['scripts/generate-route-pages.mjs', 'scripts/generate-sitemap.mjs', 'scripts/generate-post-metadata.mjs', 'scripts/post-parser.mjs']) {
    assert.equal(urlsForPush([file]).fullSite, true, file);
  }
});

test('unrelated internal changes do not submit URLs', () => {
  const selection = urlsForPush(['test/sample.test.mjs', 'docs/notes.md']);
  assert.equal(selection.fullSite, false);
  assert.deepEqual(selection.urls, []);
});

test('page component change selects its public route', () => {
  const selection = urlsForPush(['src/pages/AboutPage.tsx']);
  assert.equal(selection.fullSite, false);
  assert.deepEqual(selection.urls, ['https://ourolddad.com/about']);
});
