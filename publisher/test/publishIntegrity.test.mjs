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

// ---- A stale or racing submission never replaces newer branch content ----

test('a push that lands between validation and the branch write is not overwritten', async () => {
  const first = publishingFixture('ood', 'racing-update', { note: 'First version.' });
  const second = publishingFixture('ood', 'racing-update', { note: 'Second version.' });
  const fake = world();
  let newerWork;
  const result = await run(fake, async () => {
    const draft = await publish(first);
    const session = await begin(second);
    assert.equal(session.existingPullRequest.commit, draft.commit);
    // Another writer adds a commit to the draft after finish has checked the
    // pull request and built its own commit, but before it moves the branch.
    fake.once('after', commitCreated, () => {
      newerWork = fake.push(OOD, draft.branch, { files: { 'src/content/posts/racing-update/index.ts': 'export default "hand-edited";\n' } });
    });
    return finish(second, session);
  });
  assert.ok(newerWork, 'the competing push ran');
  assert.equal(fake.head(OOD, 'publisher/racing-update'), newerWork, 'the newer commit must still be the branch head');
  assert.equal(result.status, 409, result.text);
  assert.equal(result.payload.code, 'PUBLISHING_BRANCH_CHANGED');
  assert.equal(fake.pulls(OOD).length, 1);
  assert.match(fake.pulls(OOD)[0].body, /Publishes a new post folder/, 'the draft description must not be rewritten by the rejected update');
});

test('a branch created by another job between validation and the branch write is not overwritten', async () => {
  const fixture = publishingFixture('ood', 'racing-create');
  const fake = world();
  let competing;
  const result = await run(fake, async () => {
    const session = await begin(fixture);
    fake.once('after', commitCreated, () => {
      competing = fake.push(OOD, 'publisher/racing-create', { files: { 'src/content/posts/racing-create/index.ts': 'export default "other job";\n' } });
    });
    return finish(fixture, session);
  });
  assert.ok(competing, 'the competing push ran');
  assert.equal(fake.head(OOD, 'publisher/racing-create'), competing, 'the other job\'s commit must still be the branch head');
  assert.equal(result.status, 409, result.text);
  assert.equal(fake.pulls(OOD).length, 0, 'no pull request may be opened for content this request did not write');
});

test('a session that predates another job\'s draft cannot replace that draft', async () => {
  const stale = publishingFixture('ood', 'stale-session', { note: 'Older package.' });
  const fake = world();
  const result = await run(fake, async () => {
    const session = await begin(stale);
    // After this session was created, a different submission staged the post
    // and opened the draft (for example the direct GitHub handoff).
    const newer = fake.push(OOD, 'publisher/stale-session', { files: { 'src/content/posts/stale-session/index.ts': 'export default "newer draft";\n' } });
    fake.openPullRequest(OOD, { head: 'publisher/stale-session', title: 'Publish Fixture stale-session', body: 'Newer draft.' });
    const before = fake.writes().length;
    const outcome = await finish(stale, session);
    assert.equal(fake.head(OOD, 'publisher/stale-session'), newer, 'the newer draft must still be the branch head');
    assert.deepEqual(fake.writes().slice(before).filter((request) => !request.path.endsWith('/git/blobs')), [], 'nothing but the uploads may be written');
    return outcome;
  });
  assert.equal(result.status, 409, result.text);
  assert.equal(fake.pulls(OOD).length, 1);
  assert.equal(fake.pulls(OOD)[0].body, 'Newer draft.');
});

test('finishing the same submission twice leaves one draft and one commit', async () => {
  const fixture = publishingFixture('ood', 'finished-twice');
  const fake = world();
  await run(fake, async () => {
    const session = await begin(fixture);
    const first = await finish(fixture, session);
    assert.equal(first.status, 200, first.text);
    const head = fake.head(OOD, 'publisher/finished-twice');
    assert.equal(head, first.payload.result.commit);

    // The identical request again: a double submit, or a client-side retry.
    const second = await finish(fixture, session);
    assert.equal(fake.head(OOD, 'publisher/finished-twice'), head, 'the replay must not rewrite the published commit');
    assert.equal(second.status, 409, second.text);
    assert.equal(fake.pulls(OOD).length, 1);

    // Restarting is the supported retry: it recognises the finished draft.
    const restarted = await finish(fixture, await begin(fixture));
    assert.equal(restarted.status, 200, restarted.text);
    assert.equal(restarted.payload.result.recovered, true);
    assert.equal(restarted.payload.result.commit, head);
    assert.equal(fake.head(OOD, 'publisher/finished-twice'), head);
    assert.equal(fake.pulls(OOD).length, 1);
  });
});

test('when GitHub opens the draft but the response is lost, a replay cannot rewrite it', async () => {
  const fixture = publishingFixture('ood', 'lost-response');
  const fake = world();
  await run(fake, async () => {
    const session = await begin(fixture);
    fake.loseResponse((request) => request.method === 'POST' && request.path.endsWith('/pulls'));
    const lost = await finish(fixture, session);
    // GitHub completed the work; the caller was told it failed, never that it succeeded.
    assert.equal(lost.payload.ok, undefined);
    assert.equal(lost.payload.stage, 'create-pull-request');
    assert.equal(fake.pulls(OOD).length, 1);
    const head = fake.head(OOD, 'publisher/lost-response');

    const replay = await finish(fixture, session);
    assert.equal(fake.head(OOD, 'publisher/lost-response'), head, 'the replay must not rewrite the commit GitHub already accepted');
    assert.equal(replay.status, 409, replay.text);

    const restarted = await finish(fixture, await begin(fixture));
    assert.equal(restarted.status, 200, restarted.text);
    assert.equal(restarted.payload.result.recovered, true);
    assert.equal(restarted.payload.result.prNumber, fake.pulls(OOD)[0].number);
    assert.equal(fake.pulls(OOD).length, 1);
    assert.equal(fake.head(OOD, 'publisher/lost-response'), head);
  });
});

// ---- The intended update paths still work, without a forced write --------

test('updating an open draft fast-forwards the branch instead of forcing it', async () => {
  const first = publishingFixture('ood', 'normal-update', { note: 'First version.' });
  const second = publishingFixture('ood', 'normal-update', { note: 'Second version.' });
  const fake = world();
  await run(fake, async () => {
    const main = fake.head(OOD, 'main');
    const draft = await publish(first);
    const updated = await publish(second);
    assert.equal(updated.prNumber, draft.prNumber);
    assert.equal(fake.pulls(OOD).length, 1);
    const head = fake.head(OOD, 'publisher/normal-update');
    assert.equal(head, updated.commit);
    // Still one commit on top of the live default branch; the previous draft
    // commit is kept as a second parent so the update is a fast-forward.
    assert.deepEqual(fake.commit(OOD, head).parents, [main, draft.commit]);
    assert.match(fake.files(OOD, head)['src/content/posts/normal-update/index.ts'], /Second version\./);
    assert.deepEqual(changedPaths(fake, main, head), [
      'public/sitemap.xml',
      'src/content/posts/normal-update/card-image.webp',
      'src/content/posts/normal-update/hero-image.webp',
      'src/content/posts/normal-update/index.ts',
    ]);
    assert.deepEqual(branchWrites(fake).map((request) => [request.method, request.body.force]), [['POST', undefined], ['PATCH', false]]);
  });
});

test('republishing over a branch left behind by a merged pull request still works without forcing', async () => {
  const fixture = publishingFixture('ood', 'leftover-branch');
  const fake = world();
  await run(fake, async () => {
    // The earlier publishing pull request was merged and its branch was kept.
    const leftover = fake.push(OOD, 'publisher/leftover-branch', { files: { 'src/content/posts/leftover-branch/index.ts': 'export default "published earlier";\n' } });
    const main = fake.push(OOD, 'main', { files: { 'src/content/posts/leftover-branch/index.ts': 'export default "published earlier";\n', 'README.md': '# Later main\n' } });
    const result = await publish(fixture);
    const head = fake.head(OOD, 'publisher/leftover-branch');
    assert.equal(head, result.commit);
    assert.deepEqual(fake.commit(OOD, head).parents, [main, leftover]);
    assert.equal(fake.files(OOD, head)['README.md'], '# Later main\n');
    assert.equal(fake.pulls(OOD).length, 1);
    assert.equal(fake.pulls(OOD)[0].head.sha, head);
    assert.deepEqual(branchWrites(fake).map((request) => [request.method, request.body.force]), [['PATCH', false]]);
  });
});
