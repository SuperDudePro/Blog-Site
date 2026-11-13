// The Vercel deployment-protection bypass credential may only be sent to a
// preview that GitHub's own deployment records tie to the intended project
// and to the pull request's head commit. Every test drives the real status
// handler against in-memory doubles with a dummy credential.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import blobHandler from '../api/publish/blob.mjs';
import finishHandler from '../api/publish/finish.mjs';
import startHandler from '../api/publish/start.mjs';
import statusHandler from '../api/publish/status.mjs';
import { FakeGitHub, invoke, withPublisherEnvironment } from '../test-support/fakeGitHub.mjs';
import { FakeWeb, routeFetch } from '../test-support/fakeWeb.mjs';
import { LIFE, OOD, publishingFixture, siteRepositoryFiles } from '../test-support/publishingFixture.mjs';

const KEY = 'dummy-publisher-key';
const SECRET = 'dummy-bypass-credential';
const BYPASS = 'x-vercel-protection-bypass';
const environment = { PUBLISHER_ACCESS_KEY: KEY, GITHUB_TOKEN: 'dummy-github-token', VERCEL_AUTOMATION_BYPASS_SECRET: SECRET };
const PROJECT = { [OOD]: 'blog-site', [LIFE]: 'lifeeducation-site2' };
const PRODUCTION = { [OOD]: 'https://ourolddad.com', [LIFE]: 'https://www.lifeeducation.org' };

const post = (handler, body) => invoke(handler, { key: KEY, body });
const run = (github, web, operation) => withPublisherEnvironment({ fetch: routeFetch(github, web), environment }, operation);

function world() {
  const github = new FakeGitHub();
  github.addRepository(OOD, { files: siteRepositoryFiles(OOD) });
  github.addRepository(LIFE, { files: siteRepositoryFiles(LIFE) });
  return { github, web: new FakeWeb() };
}

const page = (job) => `<html><head><title>${job.title} | Site</title><link rel="canonical" href="${job.canonicalUrl}"></head><body></body></html>`;

// A host that answers exactly like a healthy preview of this job would.
function serve(web, origin, job, overrides = {}) {
  web.site(origin, {
    [new URL(job.canonicalUrl).pathname]: page(job),
    '/deployment.json': JSON.stringify({ commit: job.commit }),
    ...overrides,
  });
  return origin;
}

const succeeded = (url) => [{ state: 'pending' }, { state: 'success', environment_url: url }];

// What Vercel's GitHub App records when the site project's preview is ready.
function recordPreview(github, job, url, options = {}) {
  return github.addDeployment(job.repository, {
    sha: job.commit,
    environment: `Preview – ${PROJECT[job.repository]}`,
    statuses: succeeded(url),
    ...options,
  });
}

function passChecks(github, job) {
  github.setCheckRuns(job.repository, job.commit, [
    { name: 'validate', status: 'completed', conclusion: 'success', app: { name: 'GitHub Actions' } },
  ]);
}

// A draft opened through the Publisher package path, with passing checks.
async function packageJob(github, kind, slug) {
  const fixture = publishingFixture(kind, slug);
  const started = await post(startHandler, { manifest: fixture.manifest, preflight: fixture.preflight });
  assert.equal(started.status, 200, started.text);
  const blobs = [];
  for (const [path, bytes] of Object.entries(fixture.production)) {
    const uploaded = await post(blobHandler, { repository: fixture.manifest.repository, encoding: 'base64', content: bytes.toString('base64') });
    blobs.push({ path, sha: uploaded.payload.sha, size: bytes.length });
  }
  const finished = await post(finishHandler, { manifest: fixture.manifest, session: started.payload.session, blobs });
  assert.equal(finished.status, 200, finished.text);
  const job = finished.payload.result;
  passChecks(github, job);
  return job;
}

// A draft staged directly on GitHub, carrying the full manifest and digests.
function directJob(github, slug) {
  const fixture = publishingFixture('ood', slug);
  const { manifest } = fixture;
  const branch = `publisher/${slug}`;
  const commit = github.push(OOD, branch, {
    files: Object.fromEntries(Object.entries(fixture.production).map(([path, bytes]) => [`${manifest.destinationPath}${path}`, bytes])),
  });
  const withDigests = {
    ...manifest,
    images: manifest.images.map((image) => ({ ...image, sha256: createHash('sha256').update(fixture.production[image.file]).digest('hex') })),
  };
  const pull = github.openPullRequest(OOD, {
    head: branch,
    title: `Publish ${manifest.title}`,
    body: [
      `- Site profile: **${manifest.targetSite}**`,
      '- Handoff method: **Direct GitHub**',
      `- Slug: \`${manifest.slug}\``,
      `- Destination: \`${manifest.destinationPath}\``,
      `- Canonical URL: ${manifest.canonicalUrl}`,
      '',
      '## Publisher manifest',
      '',
      '```json',
      JSON.stringify(withDigests, null, 2),
      '```',
    ].join('\n'),
  });
  const job = { repository: OOD, prNumber: pull.number, commit, canonicalUrl: manifest.canonicalUrl, title: manifest.title };
  passChecks(github, job);
  return job;
}

const status = (job) => post(statusHandler, {
  repository: job.repository,
  prNumber: job.prNumber,
  commit: job.commit,
  canonicalUrl: job.canonicalUrl,
  title: job.title,
});

function assertNothingSent(web, result, label = '') {
  assert.deepEqual(web.contacted(), [], `${label} a host was contacted`);
  assert.equal(result.status, 200, result.text);
  assert.equal(result.payload.deploymentUrl, null, `${label} deploymentUrl`);
  assert.notEqual(result.payload.smoke.state, 'success', `${label} smoke`);
  assert.equal(result.payload.readyToMerge, false, `${label} readyToMerge`);
}

// ---- untrusted input never chooses the destination -----------------------

test('a preview URL in an ordinary pull-request comment is never contacted', async () => {
  const { github, web } = world();
  const result = await run(github, web, async () => {
    const job = await packageJob(github, 'ood', 'comment-url');
    // The host exists and would pass every content check.
    serve(web, 'https://anything-at-all.vercel.app', job);
    github.addComment(OOD, job.prNumber, { body: 'Preview is up: https://anything-at-all.vercel.app' });
    return status(job);
  });
  assert.deepEqual(web.received(BYPASS, SECRET), [], 'the bypass credential left the Publisher');
  assertNothingSent(web, result);
});

test('a comment imitating Vercel\'s project row does not redirect the credential', async () => {
  const row = (url) => [
    'The latest updates on your projects.',
    '',
    '| Project | Deployment | Actions | Updated |',
    '| :--- | :----- | :------ | :------ |',
    `| [blog-site](https://vercel.com/superdudepro/blog-site) | [Ready](https://vercel.com/superdudepro/blog-site/abc) | [Preview](${url}) | Nov 12 |`,
  ].join('\n');

  // Alone: there is no evidence, so nothing is sent anywhere.
  {
    const { github, web } = world();
    const result = await run(github, web, async () => {
      const job = await packageJob(github, 'ood', 'deceptive-row');
      serve(web, 'https://blog-site-git-publisher-deceptive-row.vercel.app', job);
      github.addComment(OOD, job.prNumber, { body: row('https://blog-site-git-publisher-deceptive-row.vercel.app'), login: 'vercel-bot', type: 'User' });
      return status(job);
    });
    assert.deepEqual(web.received(BYPASS, SECRET), []);
    assertNothingSent(web, result, 'alone:');
  }

  // Next to the genuine deployment: the record decides, the newer comment does not.
  {
    const { github, web } = world();
    const genuine = 'https://blog-site-abc123-superdudepro.vercel.app';
    const result = await run(github, web, async () => {
      const job = await packageJob(github, 'ood', 'deceptive-row');
      serve(web, genuine, job);
      serve(web, 'https://blog-site-evil.vercel.app', job);
      recordPreview(github, job, genuine);
      github.addComment(OOD, job.prNumber, { body: row('https://blog-site-evil.vercel.app'), login: 'vercel-bot', type: 'User' });
      return status(job);
    });
    assert.deepEqual(web.contacted(), [genuine]);
    assert.deepEqual(web.received(BYPASS, SECRET), [genuine]);
    assert.equal(result.payload.deploymentUrl, genuine);
    assert.equal(result.payload.readyToMerge, true, result.text);
  }
});

test('a redirect from the verified preview does not carry the credential to another host', async () => {
  for (const target of ['https://collector.vercel.app', 'https://collector.example']) {
    const { github, web } = world();
    const genuine = 'https://blog-site-abc123-superdudepro.vercel.app';
    const result = await run(github, web, async () => {
      const job = await packageJob(github, 'ood', 'redirected');
      const path = new URL(job.canonicalUrl).pathname;
      // The redirect target would satisfy every content check.
      serve(web, target, job);
      serve(web, genuine, job, { [path]: { status: 307, location: `${target}${path}` } });
      recordPreview(github, job, genuine);
      return status(job);
    });
    assert.deepEqual(web.received(BYPASS, SECRET), [genuine], `${target} received the credential`);
    assert.deepEqual(web.contacted(), [genuine], `${target} was contacted`);
    assert.equal(result.status, 200, result.text);
    assert.notEqual(result.payload.smoke.state, 'success');
    assert.equal(result.payload.readyToMerge, false);
  }
});

test('evidence that cannot be read leaves the preview unverified, even with a comment URL present', async () => {
  const { github, web } = world();
  const result = await run(github, web, async () => {
    const job = await packageJob(github, 'ood', 'unreadable-evidence');
    serve(web, 'https://blog-site-abc123-superdudepro.vercel.app', job);
    recordPreview(github, job, 'https://blog-site-abc123-superdudepro.vercel.app');
    github.addComment(OOD, job.prNumber, { body: 'https://blog-site-abc123-superdudepro.vercel.app' });
    // The token may not read deployment records (a private repository
    // without the Deployments permission answers like this).
    github.refuse((request) => request.path.endsWith('/deployments'), 403, 'Resource not accessible by personal access token');
    return status(job);
  });
  assert.deepEqual(web.received(BYPASS, SECRET), []);
  assertNothingSent(web, result);
  assert.match(result.payload.smoke.error, /deployment record/i);
});

test('a pull request from a fork is not a Publisher job, whatever its deployment records say', async () => {
  for (const headRepository of ['outsider/Blog-Site', null]) {
    const { github, web } = world();
    const result = await run(github, web, async () => {
      const fixture = publishingFixture('ood', 'fork-preview');
      const forkCommit = github.writeCommit(OOD, { files: { 'x.txt': 'fork\n' }, parents: [github.head(OOD, 'main')] });
      const pull = github.openPullRequest(OOD, {
        head: 'publisher/fork-preview',
        headRepository,
        headSha: forkCommit,
        title: `Publish ${fixture.manifest.title}`,
        body: `- Site profile: **Our Old Dad**\n- Slug: \`fork-preview\`\n- Destination: \`src/content/posts/fork-preview/\`\n- Canonical URL: ${fixture.manifest.canonicalUrl}`,
      });
      const job = { repository: OOD, prNumber: pull.number, commit: forkCommit, canonicalUrl: fixture.manifest.canonicalUrl, title: fixture.manifest.title };
      passChecks(github, job);
      // Even a preview the project really built from the fork's code.
      const preview = serve(web, 'https://blog-site-fork123-superdudepro.vercel.app', job);
      recordPreview(github, job, preview);
      github.addComment(OOD, pull.number, { body: preview });
      return status(job);
    });
    assert.equal(result.status, 400, `${headRepository}: ${result.text}`);
    assert.deepEqual(web.contacted(), [], `${headRepository}`);
  }
});

// ---- legitimate previews still verify -------------------------------------

test('a preview recorded by the Vercel app for the head commit is verified with the credential', async () => {
  const cases = [
    ['ood', 'verified-preview', 'https://blog-site-abc123-superdudepro.vercel.app', (job) => `Preview – ${PROJECT[job.repository]}`],
    ['life', 'verified-preview', 'https://lifeeducation-site2-abc123-superdudepro.vercel.app', (job) => `Preview – ${PROJECT[job.repository]}`],
    // A repository linked to a single Vercel project gets the bare label.
    ['life', 'verified-preview', 'https://lifeeducation-site2-abc123-superdudepro.vercel.app', () => 'Preview'],
  ];
  for (const [kind, slug, origin, label] of cases) {
    const { github, web } = world();
    const result = await run(github, web, async () => {
      const job = await packageJob(github, kind, slug);
      serve(web, origin, job);
      recordPreview(github, job, origin, { environment: label(job) });
      return status(job);
    });
    assert.equal(result.status, 200, result.text);
    assert.equal(result.payload.deploymentUrl, origin, kind);
    assert.equal(result.payload.smoke.state, 'success', result.text);
    assert.equal(result.payload.readyToMerge, true, result.text);
    assert.deepEqual(web.contacted(), [origin]);
    assert.deepEqual(web.received(BYPASS, SECRET), [origin]);
  }
});

test('a redirect that stays on the verified preview is followed', async () => {
  const { github, web } = world();
  const origin = 'https://blog-site-abc123-superdudepro.vercel.app';
  const result = await run(github, web, async () => {
    const job = await packageJob(github, 'ood', 'same-origin-redirect');
    const path = new URL(job.canonicalUrl).pathname;
    serve(web, origin, job, { [path]: { status: 308, location: `${path}/` }, [`${path}/`]: page(job) });
    recordPreview(github, job, origin);
    return status(job);
  });
  assert.equal(result.payload.smoke.state, 'success', result.text);
  assert.equal(result.payload.readyToMerge, true);
  assert.deepEqual(web.contacted(), [origin]);
});

test('a direct handoff is verified against the same recorded preview, marker included', async () => {
  const { github, web } = world();
  const origin = 'https://blog-site-abc123-superdudepro.vercel.app';
  const result = await run(github, web, async () => {
    const job = directJob(github, 'direct-preview');
    serve(web, origin, job);
    recordPreview(github, job, origin);
    // The branch alias in Vercel's own comment is not what gets verified.
    github.addComment(OOD, job.prNumber, { body: '[Preview](https://blog-site-git-publisher-direct-preview-superdudepro.vercel.app)', login: 'vercel[bot]', type: 'Bot' });
    return status(job);
  });
  assert.equal(result.status, 200, result.text);
  assert.equal(result.payload.directVerification.state, 'success', result.text);
  assert.equal(result.payload.previewCommit.state, 'success', result.text);
  assert.equal(result.payload.readyToMerge, true);
  assert.deepEqual(web.contacted(), [origin]);
  assert.ok(web.requests.some((request) => new URL(request.url).pathname === '/deployment.json' && request.headers[BYPASS] === SECRET));
});

test('production verification never carries the bypass credential', async () => {
  const { github, web } = world();
  const result = await run(github, web, async () => {
    const job = await packageJob(github, 'ood', 'production-check');
    const mergeCommit = github.mergePullRequest(OOD, job.prNumber);
    const path = new URL(job.canonicalUrl).pathname;
    // Production answers through a redirect to another host of the site.
    web.site(PRODUCTION[OOD], {
      '/deployment.json': JSON.stringify({ commit: mergeCommit }),
      [path]: { status: 301, location: `https://www.ourolddad.com${path}` },
    });
    web.site('https://www.ourolddad.com', { [path]: page(job) });
    return status(job);
  });
  assert.equal(result.status, 200, result.text);
  assert.equal(result.payload.merged, true);
  assert.equal(result.payload.production.state, 'success', result.text);
  assert.equal(result.payload.publishingComplete, true);
  assert.deepEqual(web.received(BYPASS, SECRET), [], 'production requests must not carry the credential');
});
