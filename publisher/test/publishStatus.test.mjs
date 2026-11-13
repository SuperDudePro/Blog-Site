import assert from 'node:assert/strict';
import test from 'node:test';
import { activePullRequestCommit, canonicalUrlsMatch, createPreviewFetcher, deployedCommitIsReady, findVerifiedPreview, inspectPublishedHtml, inspectPublishedUrl, missingStatusFields, normalizeStatusRequest } from '../lib/publishStatus.mjs';

const commit = 'a'.repeat(40);
const vercelApp = { login: 'vercel[bot]', type: 'Bot' };
const preview = 'https://blog-site-abc123-superdudepro.vercel.app';
const deployment = (overrides = {}) => ({
  id: 1,
  sha: commit,
  environment: 'Preview – blog-site',
  production_environment: false,
  creator: vercelApp,
  created_at: '2026-11-12T12:00:00Z',
  ...overrides,
});
const deploymentStatus = (state, overrides = {}) => ({
  state,
  environment_url: preview,
  creator: vercelApp,
  created_at: '2026-11-12T12:05:00Z',
  ...overrides,
});

// Answers the two GitHub reads findVerifiedPreview makes.
function deploymentRecords(deployments, statuses = { 1: [deploymentStatus('success')] }) {
  const calls = [];
  return {
    calls,
    request: async (suffix) => {
      calls.push(suffix);
      if (suffix.startsWith('/deployments?')) return deployments;
      return statuses[Number(suffix.match(/^\/deployments\/(\d+)\/statuses\?/)[1])] || [];
    },
  };
}

const verifiedPreview = (deployments, statuses, project = 'blog-site') => (
  findVerifiedPreview({ commit, project, request: deploymentRecords(deployments, statuses).request })
);

test('the preview is the one the Vercel app recorded for this commit and project', async () => {
  const records = deploymentRecords([deployment()]);
  assert.equal(await findVerifiedPreview({ commit, project: 'blog-site', request: records.request }), preview);
  assert.deepEqual(records.calls, [`/deployments?sha=${commit}&per_page=100`, '/deployments/1/statuses?per_page=100']);
});

test('selects the registered site preview when a commit deploys several Vercel projects', async () => {
  const publisherPreview = 'https://wilbert-publisher-abc123-superdudepro.vercel.app';
  const deployments = [deployment({ id: 2, environment: 'Preview – wilbert-publisher' }), deployment()];
  const statuses = { 1: [deploymentStatus('success')], 2: [deploymentStatus('success', { environment_url: publisherPreview })] };
  assert.equal(await verifiedPreview(deployments, statuses, 'blog-site'), preview);
  assert.equal(await verifiedPreview(deployments, statuses, 'wilbert-publisher'), publisherPreview);
  assert.equal(await verifiedPreview(deployments, statuses, 'lifeeducation-site2'), null);
});

test('a repository with one Vercel project uses the plain label, and the hostname must then name the project', async () => {
  const plain = [deployment({ environment: 'Preview' })];
  const lifePreview = 'https://lifeeducation-site2-abc123-superdudepro.vercel.app';
  assert.equal(await verifiedPreview(plain, { 1: [deploymentStatus('success', { environment_url: lifePreview })] }, 'lifeeducation-site2'), lifePreview);
  assert.equal(await verifiedPreview(plain, { 1: [deploymentStatus('success', { environment_url: lifePreview })] }, 'blog-site'), null);
  assert.equal(await verifiedPreview(plain, { 1: [deploymentStatus('success', { environment_url: 'https://lifeeducation-site2.evil.vercel.app.example' })] }, 'lifeeducation-site2'), null);
});

test('a superseded or redeployed preview of the same commit is still the verified preview', async () => {
  // GitHub marked the record inactive after a later preview elsewhere succeeded.
  assert.equal(await verifiedPreview([deployment()], { 1: [
    deploymentStatus('inactive', { created_at: '2026-11-12T12:09:00Z' }),
    deploymentStatus('success'),
  ] }), preview);
  // A newer redeploy is still building; the earlier build of this commit is ready.
  assert.equal(await verifiedPreview(
    [deployment({ id: 2, created_at: '2026-11-12T12:20:00Z' }), deployment()],
    { 1: [deploymentStatus('success')], 2: [deploymentStatus('pending', { environment_url: 'https://blog-site-newer-superdudepro.vercel.app' })] },
  ), preview);
});

test('anything short of that record leaves the preview unverified', async () => {
  const insufficient = {
    'no deployment records': [[], {}],
    'GitHub answered with something that is not a list': [{ message: 'Not Found' }, {}],
    'record for a different commit': [[deployment({ sha: 'b'.repeat(40) })]],
    'record written by a repository collaborator': [[deployment({ creator: { login: 'SuperDudePro', type: 'User' } })]],
    'record written by another app': [[deployment({ creator: { login: 'github-actions[bot]', type: 'Bot' } })]],
    'user account imitating the app name': [[deployment({ creator: { login: 'vercel[bot]', type: 'User' } })]],
    'record without a creator': [[deployment({ creator: null })]],
    'another project of the same repository': [[deployment({ environment: 'Preview – wilbert-publisher' })]],
    'a label that merely starts like the project': [[deployment({ environment: 'Preview – blog-site-copy' })]],
    'a hyphen instead of Vercel\'s dash': [[deployment({ environment: 'Preview - blog-site' })]],
    'production record': [[deployment({ environment: 'Production – blog-site', production_environment: true })]],
    'preview label on a production record': [[deployment({ production_environment: true })]],
    'record without a usable identifier': [[deployment({ id: '1/../../x' })]],
    'still building': [[deployment()], { 1: [deploymentStatus('in_progress'), deploymentStatus('pending', { created_at: '2026-11-12T12:01:00Z' })] }],
    'build failed': [[deployment()], { 1: [deploymentStatus('failure')] }],
    'build errored after an earlier success': [[deployment()], { 1: [deploymentStatus('error', { created_at: '2026-11-12T12:09:00Z' }), deploymentStatus('success')] }],
    'no statuses': [[deployment()], { 1: [] }],
    'success status written by someone other than the app': [[deployment()], { 1: [deploymentStatus('success', { creator: { login: 'SuperDudePro', type: 'User' } })] }],
    'success without a URL': [[deployment()], { 1: [deploymentStatus('success', { environment_url: '' })] }],
    'plain http': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'http://blog-site-abc123-superdudepro.vercel.app' })] }],
    'credentials in the URL': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'https://user:pass@blog-site-abc123-superdudepro.vercel.app' })] }],
    'explicit port': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'https://blog-site-abc123-superdudepro.vercel.app:8443' })] }],
    'host outside vercel.app': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'https://blog-site.example.com' })] }],
    'vercel.app used as a subdomain of another host': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'https://blog-site.vercel.app.example.com' })] }],
    'host that only ends with the letters vercel.app': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'https://blog-site-evilvercel.app' })] }],
    'not a URL': [[deployment()], { 1: [deploymentStatus('success', { environment_url: 'blog-site-abc123-superdudepro.vercel.app' })] }],
  };
  for (const [label, [deployments, statuses]] of Object.entries(insufficient)) {
    assert.equal(await verifiedPreview(deployments, statuses), null, label);
  }
  const records = deploymentRecords([deployment()]);
  assert.equal(await findVerifiedPreview({ commit: 'not-a-sha', project: 'blog-site', request: records.request }), null);
  assert.equal(await findVerifiedPreview({ commit, project: '', request: records.request }), null);
  assert.deepEqual(records.calls, [], 'no lookup without a full commit SHA and a project');
});

function recordingSend(answers) {
  const sent = [];
  return {
    sent,
    send: async (url, options) => {
      sent.push({ url, redirect: options.redirect, bypass: options.headers['x-vercel-protection-bypass'] ?? null });
      const answer = answers[url] || { status: 404, body: 'missing' };
      return new Response(answer.location ? null : answer.body, { status: answer.status || 200, headers: answer.location ? { location: answer.location } : {} });
    },
  };
}

test('the preview fetcher sends the credential to the verified origin only', async () => {
  const network = recordingSend({
    [`${preview}/post/a`]: { status: 308, location: '/post/a/' },
    [`${preview}/post/a/`]: { body: '<html></html>' },
  });
  const fetchText = createPreviewFetcher(preview, { secret: 'dummy-credential', send: network.send });
  const { result, body } = await fetchText(`${preview}/post/a`);
  assert.equal(result.status, 200);
  assert.equal(body, '<html></html>');
  assert.deepEqual(network.sent, [
    { url: `${preview}/post/a`, redirect: 'manual', bypass: 'dummy-credential' },
    { url: `${preview}/post/a/`, redirect: 'manual', bypass: 'dummy-credential' },
  ]);

  // Another origin is refused before anything is sent, however it is spelled.
  for (const url of ['https://elsewhere.vercel.app/post/a', `${preview}.example.com/post/a`, `http://${new URL(preview).host}/post/a`, `${preview}:444/post/a`]) {
    const refused = recordingSend({});
    await assert.rejects(createPreviewFetcher(preview, { secret: 'dummy-credential', send: refused.send })(url), /not the verified preview deployment/);
    assert.deepEqual(refused.sent, []);
  }
});

test('the preview fetcher stops at a redirect that leaves the verified origin', async () => {
  for (const location of ['https://collector.vercel.app/post/a', 'https://collector.example/post/a', '//collector.example/post/a', `http://${new URL(preview).host}/post/a`]) {
    const network = recordingSend({ [`${preview}/post/a`]: { status: 302, location } });
    await assert.rejects(createPreviewFetcher(preview, { secret: 'dummy-credential', send: network.send })(`${preview}/post/a`), /not the verified preview deployment/);
    assert.deepEqual(network.sent.map((request) => request.url), [`${preview}/post/a`], location);
  }
  const loop = recordingSend({ [`${preview}/loop`]: { status: 302, location: '/loop' } });
  await assert.rejects(createPreviewFetcher(preview, { send: loop.send })(`${preview}/loop`), /redirected too many times/);
  assert.equal(loop.sent.length, 6);
  assert.ok(loop.sent.every((request) => request.bypass === null), 'no header is sent when no credential is configured');
});

test('retries a transient generic preview shell and accepts the deployed route', async () => {
  let calls = 0;
  const result = await inspectPublishedUrl({
    url: 'https://blog-site-git-post.vercel.app/post/dads-story',
    canonicalUrl: 'https://ourolddad.com/post/dads-story',
    title: "Dad's Story",
    attempts: 3,
    wait: () => Promise.resolve(),
    fetchText: async () => {
      calls += 1;
      return calls === 1
        ? { result: { ok: true, status: 200 }, body: '<html><head><title>Our Old Dad</title></head></html>' }
        : { result: { ok: true, status: 200 }, body: '<html><head><title>Dad&#39;s Story | Our Old Dad</title><link rel="canonical" href="https://ourolddad.com/post/dads-story"></head></html>' };
    },
  });
  assert.deepEqual(result, { ok: true, status: 200 });
  assert.equal(calls, 2);
});

test('verifies the expected title and canonical URL in rendered HTML', () => {
  const html = '<html><head><title>Dad&#39;s Story | Our Old Dad</title><link rel="canonical" href="https://ourolddad.com/post/dads-story"></head><body><h1>Dad&#39;s Story</h1></body></html>';
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

test('accepts client-rendered SPA shells when static metadata is not required', async () => {
  const html = '<html><head><title>LifeEducation.org</title><link rel="canonical" href="https://www.lifeeducation.org/"></head><body><div id="root"></div></body></html>';
  assert.deepEqual(
    inspectPublishedHtml(
      html,
      'https://www.lifeeducation.org/posts/golden-olden-days-denominator-trick',
      'The Golden Olden Days Were a Denominator Trick',
      { requireStaticMetadata: false },
    ),
    { ok: true },
  );

  const result = await inspectPublishedUrl({
    url: 'https://lifeeducation-site2-git-post.vercel.app/posts/golden-olden-days-denominator-trick',
    canonicalUrl: 'https://www.lifeeducation.org/posts/golden-olden-days-denominator-trick',
    title: 'The Golden Olden Days Were a Denominator Trick',
    requireStaticMetadata: false,
    fetchText: async () => ({ result: { ok: true, status: 200 }, body: html }),
  });
  assert.deepEqual(result, { ok: true, status: 200 });
});

test('rejects a canonical post route when the expected title differs from rendered metadata', () => {
  const html = '<html><head><link rel="canonical" href="https://www.lifeeducation.org/posts/domain-10"><title>Domain 10: Life Skills &amp; Project Execution | LifeEducation.org</title><meta property="og:title" content="Domain 10: Life Skills &amp; Project Execution | LifeEducation.org"></head><body><div id="root"></div></body></html>';
  assert.match(
    inspectPublishedHtml(html, 'https://www.lifeeducation.org/posts/domain-10', 'Update Domain 10').error,
    /expected post title/,
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

test('Publisher checks the latest PR revision instead of the failed original handoff', () => {
  const original = 'a'.repeat(40);
  const corrected = 'b'.repeat(40);
  assert.equal(activePullRequestCommit({ head: { sha: corrected } }, original), corrected);
  assert.equal(activePullRequestCommit({ head: {} }, original), original);
});
