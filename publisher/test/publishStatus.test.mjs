import assert from 'node:assert/strict';
import test from 'node:test';
import { deployedCommitIsReady, findVercelUrl, inspectPublishedHtml } from '../lib/publishStatus.mjs';

test('finds a deployable Vercel preview URL and ignores toolbar URLs', () => {
  const comments = [{ body: 'Toolbar https://example.vercel.live then preview https://blog-git-post-example.vercel.app' }];
  assert.equal(findVercelUrl(comments), 'https://blog-git-post-example.vercel.app');
});

test('verifies the expected title and canonical URL in rendered HTML', () => {
  const html = '<html><head><link rel="canonical" href="https://ourolddad.com/post/dads-story"></head><body><h1>Dad&#39;s Story</h1></body></html>';
  assert.deepEqual(inspectPublishedHtml(html, 'https://ourolddad.com/post/dads-story', "Dad's Story"), { ok: true });
});

test('rejects a generic app shell at the expected route', () => {
  const html = '<html><head><title>Our Old Dad</title></head><body><div id="root"></div></body></html>';
  assert.match(inspectPublishedHtml(html, 'https://ourolddad.com/post/dads-story', "Dad's Story").error, /expected post title/);
});

test('requires the production commit to equal or follow the merge commit', () => {
  const merge = 'a'.repeat(40);
  const deployed = 'b'.repeat(40);
  assert.equal(deployedCommitIsReady(merge, merge, null), true);
  assert.equal(deployedCommitIsReady(merge, deployed, 'ahead'), true);
  assert.equal(deployedCommitIsReady(merge, deployed, 'behind'), false);
  assert.equal(deployedCommitIsReady(merge, deployed, null), false);
  assert.equal(deployedCommitIsReady('not-a-commit', deployed, 'ahead'), false);
});
