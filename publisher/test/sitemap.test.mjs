import test from 'node:test';
import assert from 'node:assert/strict';
import { includeOurOldDadPostInSitemap } from '../lib/sitemap.mjs';

const manifest = {
  slug: 'whose-garden-is-it-anyway',
  publishedAt: '2026-10-10',
  canonicalUrl: 'https://ourolddad.com/post/whose-garden-is-it-anyway',
};
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ourolddad.com/</loc></url>
  <url><loc>https://ourolddad.com/post/older-story</loc></url>
</urlset>
`;

test('new OOD post is inserted while other sitemap entries stay intact', () => {
  const result = includeOurOldDadPostInSitemap(sitemap, manifest);
  assert.equal(result.changed, true);
  assert.match(result.content, /<loc>https:\/\/ourolddad.com\/post\/whose-garden-is-it-anyway<\/loc>/);
  assert.match(result.content, /<lastmod>2026-10-10<\/lastmod>/);
  assert.match(result.content, /post\/older-story/);
  assert.match(result.content, /<\/urlset>/);
});

test('reprocessing the same post is idempotent', () => {
  const first = includeOurOldDadPostInSitemap(sitemap, manifest);
  const second = includeOurOldDadPostInSitemap(first.content, manifest);
  assert.equal(second.changed, false);
  assert.equal(second.content, first.content);
  assert.equal((second.content.match(/post\/whose-garden-is-it-anyway/g) || []).length, 1);
});

test('rejects incorrect canonical URL without changing the sitemap', () => {
  assert.throws(
    () => includeOurOldDadPostInSitemap(sitemap, { ...manifest, canonicalUrl: 'https://www.ourolddad.com/post/whose-garden-is-it-anyway' }),
    /canonical URL/,
  );
});

test('rejects missing or malformed committed sitemap', () => {
  assert.throws(() => includeOurOldDadPostInSitemap('', manifest), /missing or malformed/);
});
