// Handler-level regressions for the November 2026 Publisher review.
// Every test here fails on the reviewed commit (1045efc) and passes with the
// accompanying fixes. GitHub is the in-memory double in test-support.
import assert from 'node:assert/strict';
import test from 'node:test';
import blobHandler from '../api/publish/blob.mjs';
import finishHandler from '../api/publish/finish.mjs';
import preflightHandler from '../api/publish/preflight.mjs';
import startHandler from '../api/publish/start.mjs';
import { FakeGitHub, invoke, withPublisherEnvironment } from '../test-support/fakeGitHub.mjs';
import { OOD, publishingFixture, siteRepositoryFiles } from '../test-support/publishingFixture.mjs';

const KEY = 'dummy-publisher-key';
const PRIVATE = 'SuperDudePro/Private-Notes';
const environment = { PUBLISHER_ACCESS_KEY: KEY, GITHUB_TOKEN: 'dummy-github-token' };

function world() {
  const fake = new FakeGitHub();
  fake.addRepository(OOD, { files: siteRepositoryFiles(OOD) });
  // Any other repository the server-side token happens to be able to read.
  fake.addRepository(PRIVATE, { files: { 'records/2026-budget.md': 'private\n' } });
  return fake;
}

const run = (fake, operation) => withPublisherEnvironment({ fetch: fake.fetch.bind(fake), environment }, operation);
const post = (handler, body) => invoke(handler, { key: KEY, body });
const branchWrites = (fake) => fake.writes().filter((request) => request.path.includes('/git/refs'));
const commitCreated = (request) => request.method === 'POST' && request.path.endsWith('/git/commits');
const describePulls = (fake) => fake.pulls(OOD).map((pull) => `${pull.number}|${pull.title}|${pull.body}|${pull.head.sha}`).join('\n');

async function begin(fixture) {
  const started = await post(startHandler, { manifest: fixture.manifest, preflight: fixture.preflight });
  assert.equal(started.status, 200, started.text);
  return started.payload.session;
}

async function upload(fixture) {
  const blobs = [];
  for (const [path, bytes] of Object.entries(fixture.production)) {
    const result = await post(blobHandler, { repository: fixture.manifest.repository, encoding: 'base64', content: bytes.toString('base64') });
    assert.equal(result.status, 200, result.text);
    blobs.push({ path, sha: result.payload.sha, size: bytes.length });
  }
  return blobs;
}

const finish = async (fixture, session) => post(finishHandler, { manifest: fixture.manifest, session, blobs: await upload(fixture) });

async function publish(fixture) {
  const result = await finish(fixture, await begin(fixture));
  assert.equal(result.status, 200, result.text);
  return result.payload.result;
}

function changedPaths(fake, from, to) {
  const a = fake.files(OOD, from);
  const b = fake.files(OOD, to);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((path) => a[path] !== b[path]).sort();
}

// ---- The manifest that is validated must be the manifest that is used -----

test('start validates the submitted manifest even when the preflight record carries its own', async () => {
  const valid = publishingFixture('ood', 'manifest-binding');
  const fake = world();
  const result = await run(fake, () => post(startHandler, {
    // Used for every GitHub request, but not the one that was validated.
    manifest: { repository: PRIVATE, slug: 'x', destinationPath: 'records/' },
    preflight: { ...valid.preflight, manifest: valid.manifest },
  }));
  assert.equal(result.status, 400, result.text);
  assert.equal(result.payload.code, 'PACKAGE_PREFLIGHT_FAILED');
  assert.deepEqual(fake.requests.map((request) => request.path), [], 'no GitHub request may be sent for an unvalidated manifest');
  assert.ok(!result.text.includes('2026-budget.md'));
});

test('preflight reports on the submitted manifest, not one nested in the preflight record', async () => {
  const valid = publishingFixture('ood', 'manifest-binding');
  const fake = world();
  const result = await run(fake, () => post(preflightHandler, {
    manifest: { ...valid.manifest, repository: PRIVATE, destinationPath: 'records/' },
    preflight: { ...valid.preflight, manifest: valid.manifest },
  }));
  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, false);
  assert.ok(result.payload.errors.length > 0);
});

// ---- A pull request from another repository is never this job's ----------

for (const [label, headRepository] of [['a fork', 'outsider/Blog-Site'], ['a deleted fork', null]]) {
  test(`start ignores a same-named publishing branch opened from ${label}`, async () => {
    const fixture = publishingFixture('ood', 'fork-selection');
    const fake = world();
    const outsider = fake.openPullRequest(OOD, {
      head: 'publisher/fork-selection',
      headRepository,
      headSha: fake.head(OOD, 'main'),
      title: 'Publish Fixture fork-selection',
      body: '- Slug: `fork-selection`',
    });
    const result = await run(fake, async () => {
      const session = await begin(fixture);
      assert.equal(session.existingPullRequest, null);
      return finish(fixture, session);
    });
    // The job gets its own branch and draft; the outside pull request is untouched.
    assert.equal(result.status, 200, result.text);
    assert.notEqual(result.payload.result.prNumber, outsider.number);
    const pulls = fake.pulls(OOD);
    assert.equal(pulls.length, 2);
    assert.deepEqual(pulls.find((pull) => pull.number === outsider.number), outsider);
    assert.equal(pulls.find((pull) => pull.number === result.payload.result.prNumber).head.repo.full_name, OOD);
  });
}

test('finish refuses a session that points at a pull request whose head repository is gone', async () => {
  const fixture = publishingFixture('ood', 'fork-adoption');
  const fake = world();
  const outsider = fake.openPullRequest(OOD, {
    head: 'publisher/fork-adoption',
    headRepository: null,
    headSha: fake.head(OOD, 'main'),
    title: 'Outside change',
  });
  const before = describePulls(fake);
  const result = await run(fake, async () => {
    const session = await begin(fixture);
    return finish(fixture, {
      ...session,
      existingPullRequest: { number: outsider.number, url: outsider.html_url, commit: outsider.head.sha },
    });
  });
  assert.equal(result.status, 400, result.text);
  assert.match(result.payload.error, /does not belong to this publishing job/);
  assert.equal(describePulls(fake), before, 'the outside pull request must not be retitled or reported as the job');
  assert.deepEqual(branchWrites(fake), []);
});
