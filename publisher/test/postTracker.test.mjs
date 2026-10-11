import test from 'node:test';
import assert from 'node:assert/strict';
import { addPublishedPost, postFromSource } from '../lib/postTracker.mjs';

const original = '# Blog Post Tracker\n\nLast Updated: 2026-10-10\n\n## Current Social-Ready Index\n\n### 001 — Older Post\n- Site: OurOldDad\n- Slug: `older-post`\n- Synopsis: Human-written line.\n- Social angles/hooks: Keep this editorial angle.\n\n## Placeholder / Not Social-Ready\n\n### Coming Soon\n- Site: LifeEducation\n- Slug: `coming-soon`\n\n## Change Log\n';
const post = {
  repository: 'SuperDudePro/Blog-Site', site: 'OurOldDad', title: 'Garden Story',
  slug: 'garden-story', status: 'Recent', publishedAt: '2026-10-10',
  section: 'diary', excerpt: 'The dog and the garden.', url: 'https://ourolddad.com/post/garden-story',
  sourcePath: 'SuperDudePro/Blog-Site/src/content/posts/garden-story/index.ts',
};

test('append a published slug preserving existing notes and numbering', () => {
  const result = addPublishedPost(original, post, '2026-10-11');
  assert.equal(result.state, 'added');
  assert.equal(result.number, 2);
  assert.match(result.content, /### 002 — Garden Story/);
  assert.match(result.content, /Keep this editorial angle/);
  assert.match(result.content, /Coming Soon/);
  assert.equal(addPublishedPost(result.content, post, '2026-10-11').state, 'already-recorded');
});

test('skip drafts without changing tracker', () => {
  const result = addPublishedPost(original, { ...post, status: 'Draft' }, '2026-10-11');
  assert.equal(result.state, 'skipped');
  assert.equal(result.content, original);
});

test('retire only a matching draft placeholder', () => {
  const draft = original.replace('### Coming Soon', '### Garden Story Draft\n- Slug: `garden-story`\n\n### Coming Soon');
  const result = addPublishedPost(draft, post, '2026-10-11');
  assert.equal(result.state, 'added');
  assert.equal(result.content.split('- Slug: `garden-story`').length-1, 1);
});

test('reject numbering gaps', () => {
  assert.throws(() => addPublishedPost(original.replace('### 001', '### 003'), post, '2026-10-11'), /numbering/);
});

test('source metadata and path must agree', () => {
  const source = 'const post = { slug: "garden-story", title: "Garden Story", excerpt: "The dog and the garden.", section: "diary", publishedAt: "2026-10-10", status: "Recent", };';
  assert.equal(postFromSource({ repository: 'SuperDudePro/Blog-Site', slug: 'garden-story', source }).title, 'Garden Story');
  assert.throws(() => postFromSource({ repository: 'SuperDudePro/Blog-Site', slug: 'another-story', source }), /slug differs/);
});
