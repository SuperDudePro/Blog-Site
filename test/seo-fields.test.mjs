import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePostSource } from '../scripts/post-parser.mjs';

function source(extra = '') {
  return `import type { BlogPost } from '../../postTypes';
const post: BlogPost = {
slug: 'example',
title: 'The Original Title',
excerpt: 'The original excerpt.',
section: 'diary',
publishedAt: '2026-10-15',
${extra}
bodyHtml: '<p>The unchanged story.</p>',
};
export default post;`;
}

test('legacy post metadata is accepted without SEO overrides', () => {
  const parsed = parsePostSource(source());
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.values.get('seoTitle'), undefined);
  assert.equal(parsed.values.get('seoDescription'), undefined);
});

test('optional SEO fields parse separately from literary title and excerpt', () => {
  const parsed = parsePostSource(source("seoTitle: 'Specific Search Title',\nseoDescription: 'Specific search description.',"));
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.values.get('seoTitle'), 'Specific Search Title');
  assert.equal(parsed.values.get('seoDescription'), 'Specific search description.');
  assert.equal(parsed.values.get('title'), 'The Original Title');
  assert.equal(parsed.values.get('excerpt'), 'The original excerpt.');
});

test('Junk Drawer format is accepted as explicitly tagged post metadata', () => {
  const parsed = parsePostSource(source("format: 'junk-drawer',"));
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.values.get('format'), 'junk-drawer');
});
