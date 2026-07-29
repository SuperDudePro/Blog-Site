import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalUrlsMatch, deployedCommitIsReady, findVercelUrl, inspectPublishedHtml, missingStatusFields, normalizeStatusRequest } from '../lib/publishStatus.mjs';

test('finds a deployable Vercel preview URL and ignores toolbar URLs', () => {
  const comments = [{ body: 'Toolbar https://example.vercel.live then preview https://blog-git-post-example.vercel.app' }];
  assert.equal(findVercelUrl(comments), 'https://blog-git-post-example.vercel.app');
});

test('verifies the expected title and canonical URL in rendered HTML', () => {
  const html = '<html><head><link rel="canonical" href="https://ourolddad.com/post/dads-story"></head><body><h1>Dad&#39;s Story</h1></body></html>';
  assert.deepEqual(inspectPublishedHtml(html, 'https://ourolddad.com/post/dads-story', "Dad's Story"), { ok: true });
});

test('treats equivalent canonical URL forms as the same route', () => {
  assert.equal(canonicalUrlsMatch(
    'https://WWW.LIFEEDUCATION.ORG/posts/domain-10-life-skills-project-execution/',
    'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution',
  ), true);
  assert.deepEqual(
    inspectPublishedHtml(
      '<html><head><link href="https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution/" rel="canonical"><title>Domain 10</title></head></html>',
      'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution',
      'Domain 10',
    ),
    { ok: true },
  );
});

test('rejects a generic app shell at the expected route', () => {
  const html = '<html><head><title>Our Old Dad</title></head><body><div id="root"></div></body></html>';
  assert.match(inspectPublishedHtml(html, 'https://ourolddad.com/post/dads-story', "Dad's Story").error, /canonical URL/);
});

test('accepts a canonical post route when a stale handoff title differs from rendered article metadata', () => {
  const html = '<html><head><link rel="canonical" href="https://www.lifeeducation.org/posts/domain-10"><title>Domain 10: Life Skills &amp; Project Execution | LifeEducation.org</title><meta property="og:title" content="Domain 10: Life Skills &amp; Project Execution | LifeEducation.org"></head><body><div id="root"></div></body></html>';
  assert.deepEqual(
    inspectPublishedHtml(html, 'https://www.lifeeducation.org/posts/domain-10', 'Update Domain 10'),
    { ok: true },
  );
});

test('rejects a canonical route that does not declare any page title', () => {
  const html = '<html><head><link rel="canonical" href="https://www.lifeeducation.org/posts/domain-10"></head><body><div id="root"></div></body></html>';
  assert.match(
    inspectPublishedHtml(html, 'https://www.lifeeducation.org/posts/domain-10', 'Domain 10').error,
    /does not declare a page title/,
  );
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

test('normalizes the current nested LifeEducation handoff request', () => {
  const request = normalizeStatusRequest({
    handoff: {
      repository: 'SuperDudePro/LifeEducationOrg',
      prNumber: 26,
      commit: '0123456789abcdef0123456789abcdef01234567',
      prUrl: 'https://github.com/SuperDudePro/LifeEducationOrg/pull/26',
    },
    manifest: {
      canonicalUrl: 'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution',
      title: 'Domain 10: Life Skills & Project Execution',
    },
  });
  assert.deepEqual(missingStatusFields(request), []);
  assert.equal(request.prNumber, 26);
  assert.equal(request.repository, 'SuperDudePro/LifeEducationOrg');
});

test('recovers status fields from legacy aliases and a pull-request URL', () => {
  const request = normalizeStatusRequest({
    repository: 'SuperDudePro/LifeEducationOrg',
    prUrl: 'https://github.com/SuperDudePro/LifeEducationOrg/pull/26',
    commitSha: '0123456789abcdef0123456789abcdef01234567',
    canonicalURL: 'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution',
    title: 'Domain 10: Life Skills & Project Execution',
  });
  assert.deepEqual(missingStatusFields(request), []);
  assert.equal(request.prNumber, 26);
});

test('reports the exact missing publisher handoff fields', () => {
  const request = normalizeStatusRequest({
    repository: 'SuperDudePro/LifeEducationOrg',
    prNumber: 26,
  });
  assert.deepEqual(missingStatusFields(request), ['commit', 'canonical URL', 'title']);
});
