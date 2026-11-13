// A draft the Publisher opens from an uploaded package must pass the same
// publishing contract CI enforces on every `publisher/*` pull request.
// These tests run the real start -> blob -> finish handlers against the
// GitHub double, check the resulting commit out to a temporary directory,
// and hand the real pull request to the real gate.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkPublishingPullRequest } from '../../scripts/validate-publishing-pr.mjs';
import blobHandler from '../api/publish/blob.mjs';
import finishHandler from '../api/publish/finish.mjs';
import startHandler from '../api/publish/start.mjs';
import { parseDirectManifest } from '../lib/directHandoff.mjs';
import { jobFromPullRequest } from '../lib/publishingJobs.mjs';
import { imageFixture } from '../test-support/fixtures.mjs';
import { FakeGitHub, checkoutCommit, invoke, withPublisherEnvironment } from '../test-support/fakeGitHub.mjs';
import { LIFE, OOD, publishingFixture, siteRepositoryFiles } from '../test-support/publishingFixture.mjs';

const KEY = 'dummy-publisher-key';
const GATE = fileURLToPath(new URL('../../scripts/validate-publishing-pr.mjs', import.meta.url));
const environment = { PUBLISHER_ACCESS_KEY: KEY, GITHUB_TOKEN: 'dummy-github-token' };
const post = (handler, body) => invoke(handler, { key: KEY, body });
const run = (github, operation) => withPublisherEnvironment({ fetch: github.fetch.bind(github), environment }, operation);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function world(extra = {}) {
  const github = new FakeGitHub();
  github.addRepository(OOD, { files: siteRepositoryFiles(OOD, extra) });
  github.addRepository(LIFE, { files: siteRepositoryFiles(LIFE, extra) });
  return github;
}

async function upload(repository, production) {
  const blobs = [];
  for (const [file, bytes] of Object.entries(production)) {
    const uploaded = await post(blobHandler, { repository, encoding: 'base64', content: Buffer.from(bytes).toString('base64') });
    assert.equal(uploaded.status, 200, uploaded.text);
    blobs.push({ path: file, sha: uploaded.payload.sha, size: Buffer.from(bytes).length });
  }
  return blobs;
}

// The package path exactly as the browser drives it. `tamper` may change
// what is sent to finish after an honest start.
async function submit(fixture, tamper = (request) => request) {
  const started = await post(startHandler, { manifest: fixture.manifest, preflight: fixture.preflight });
  assert.equal(started.status, 200, started.text);
  const blobs = await upload(fixture.manifest.repository, fixture.production);
  return post(finishHandler, await tamper({ manifest: fixture.manifest, session: started.payload.session, blobs }));
}

async function publish(fixture) {
  const finished = await submit(fixture);
  assert.equal(finished.status, 200, finished.text);
  return finished.payload.result;
}

// What CI sees for the draft: the pull_request event and a checkout of its head.
function ciView(t, github, draft) {
  return {
    event: github.pullRequestEvent(draft.repository, draft.prNumber),
    root: checkoutCommit(t, github, draft.repository, draft.commit),
  };
}

const postFolder = (root, manifest) => path.join(root, manifest.destinationPath);

function rewriteManifest(body, change) {
  const manifest = parseDirectManifest(body);
  change(manifest);
  return body.replace(/(## Publisher manifest[^\n]*\n+```json\n)[\s\S]*?(\n```)/, (_, open, close) => `${open}${JSON.stringify(manifest, null, 2)}${close}`);
}

// ---- the generated draft passes ------------------------------------------

for (const kind of ['ood', 'life']) {
  for (const bodyImages of [0, 2]) {
    test(`a ${kind} draft with ${bodyImages} body images passes the publishing contract`, async (t) => {
      const github = world();
      const fixture = publishingFixture(kind, 'generated-draft', { bodyImages });
      const draft = await run(github, () => publish(fixture));
      const { event, root } = ciView(t, github, draft);

      const outcome = checkPublishingPullRequest(event, { root });
      assert.equal(outcome.skipped, false, 'a new draft is checked, not waved through as legacy');
      assert.deepEqual(outcome.errors, []);
      assert.equal(outcome.mode, 'publisher-package');
      assert.equal(outcome.slug, 'generated-draft');
      assert.equal(outcome.imageCount, 2 + bodyImages);

      // It says what it is: a package handoff, not a direct one.
      const body = event.pull_request.body;
      assert.match(body, /^- Handoff method: \*\*Publisher package\*\*$/m);
      assert.doesNotMatch(body, /Direct GitHub/);
      assert.equal(jobFromPullRequest(draft.repository, event.pull_request).handoffMethod, 'package');

      // The manifest it carries describes the committed bytes.
      const manifest = parseDirectManifest(body);
      const committed = github.fileBytes(draft.repository, draft.commit);
      assert.equal(manifest.images.length, 2 + bodyImages);
      for (const image of manifest.images) {
        assert.equal(image.sha256, sha256(committed.get(`${manifest.destinationPath}${image.file}`)), image.file);
        assert.equal(image.sha256, sha256(fixture.production[image.file]), image.file);
      }
      for (const field of ['targetSite', 'repository', 'title', 'slug', 'excerpt', 'publishedAt', 'status', 'destinationPath', 'canonicalUrl', 'buildCommand']) {
        assert.equal(manifest[field], fixture.manifest[field], field);
      }
    });
  }
}

test('an update to an already published post passes, including after the draft is revised', async (t) => {
  for (const kind of ['ood', 'life']) {
    const first = publishingFixture(kind, 'published-post', { note: 'Revised once.', bodyImages: 1 });
    const second = publishingFixture(kind, 'published-post', { note: 'Revised twice.', bodyImages: 0 });
    // The post is already live on the default branch, with a file the update drops.
    const github = world({
      'src/content/posts/published-post/index.ts': 'export default { slug: "published-post" };\n',
      'src/content/posts/published-post/old-notes.md': 'stale\n',
    });
    await run(github, async () => {
      for (const fixture of [first, second]) {
        const draft = await publish(fixture);
        const { event, root } = ciView(t, github, draft);
        assert.equal(event.pull_request.title, `Update ${fixture.manifest.title}`);
        const outcome = checkPublishingPullRequest(event, { root });
        assert.deepEqual(outcome.errors, [], `${kind}: ${fixture.manifest.images.length} images`);
        assert.equal(outcome.imageCount, fixture.manifest.images.length);
      }
    });
    assert.equal(github.pulls(first.manifest.repository).length, 1, 'one draft, revised in place');
  }
});

test('the gate script, run the way CI runs it, passes the draft and fails altered bytes', async (t) => {
  const github = world();
  const fixture = publishingFixture('ood', 'cli-check', { bodyImages: 1 });
  const draft = await run(github, () => publish(fixture));
  const { event, root } = ciView(t, github, draft);
  const eventPath = path.join(root, 'event.json');
  fs.writeFileSync(eventPath, JSON.stringify(event));
  const gate = () => spawnSync(process.execPath, [GATE], { cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH, GITHUB_EVENT_PATH: eventPath } });

  const passed = gate();
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /Publishing PR contract passed for cli-check \(3 image roles\)/);

  fs.appendFileSync(path.join(postFolder(root, fixture.manifest), 'hero-image.webp'), Buffer.from([0]));
  const failed = gate();
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /hero-image\.webp: SHA-256/);
});

// ---- and nothing about the gate got easier ---------------------------------

test('a generated draft still fails the contract when its bytes, manifest, or identity do not hold', async (t) => {
  for (const kind of ['ood', 'life']) {
    const github = world();
    const fixture = publishingFixture(kind, 'strict-draft', { bodyImages: 1 });
    const { manifest } = fixture;
    const draft = await run(github, () => publish(fixture));
    const other = manifest.repository === OOD ? LIFE : OOD;
    const hero = manifest.images[1].file;
    const source = Object.keys(fixture.production)[0];

    const violations = {
      'image bytes altered': [/SHA-256/, ({ root }) => fs.appendFileSync(path.join(postFolder(root, manifest), hero), Buffer.from([0]))],
      'image replaced by a different valid image': [/SHA-256/, ({ root }) => fs.writeFileSync(path.join(postFolder(root, manifest), hero), imageFixture('card'))],
      'image digest edited in the manifest': [/SHA-256/, ({ pr }) => { pr.body = rewriteManifest(pr.body, (value) => { value.images[1].sha256 = '0'.repeat(64); }); }],
      'image digest removed from the manifest': [/SHA-256/, ({ pr }) => { pr.body = rewriteManifest(pr.body, (value) => { delete value.images[0].sha256; }); }],
      'manifest removed from the description': [/manifest JSON/, ({ pr }) => { pr.body = pr.body.replace(/## Publisher manifest[\s\S]*?\n```\n/, ''); }],
      'manifest that is not valid JSON': [/invalid JSON/, ({ pr }) => { pr.body = pr.body.replace('```json\n{', '```json\n{,'); }],
      'handoff marker removed': [/Handoff method/, ({ pr }) => { pr.body = pr.body.replace(/^- Handoff method:.*\n/m, ''); }],
      'handoff marker reworded': [/Handoff method/, ({ pr }) => { pr.body = pr.body.replace('**Publisher package**', '**Package**'); }],
      'both handoff markers': [/Handoff method/, ({ pr }) => { pr.body = pr.body.replace('- Handoff method: **Publisher package**', '- Handoff method: **Publisher package**\n- Handoff method: **Direct GitHub**'); }],
      'event for the other site repository': [/target repository/, ({ event }) => { event.repository.full_name = other; }],
      'pull request from a fork': [/target repository/, ({ pr }) => { pr.head.repo = { full_name: 'outsider/copy' }; }],
      'pull request from a deleted fork': [/target repository/, ({ pr }) => { pr.head.repo = null; }],
      'manifest naming the other repository': [/repository/i, ({ pr }) => { pr.body = rewriteManifest(pr.body, (value) => { value.repository = other; }); }],
      'manifest naming another destination': [/Destination must be/, ({ pr }) => { pr.body = rewriteManifest(pr.body, (value) => { value.destinationPath = 'src/content/posts/untouched-neighbor/'; }); }],
      'destination field changed': [/identity fields or title/, ({ pr }) => { pr.body = pr.body.replace(/^- Destination: .*$/m, '- Destination: `src/content/posts/untouched-neighbor/`'); }],
      'slug field changed': [/identity fields or title/, ({ pr }) => { pr.body = pr.body.replace(/^- Slug: .*$/m, '- Slug: `untouched-neighbor`'); }],
      'canonical URL field changed': [/identity fields or title/, ({ pr }) => { pr.body = pr.body.replace(/^- Canonical URL: .*$/m, `- Canonical URL: ${manifest.canonicalUrl}-2`); }],
      'title changed': [/identity fields or title/, ({ pr }) => { pr.title = 'Publish Something Else'; }],
      'branch that does not match the slug': [/publisher\/<slug>/, ({ pr }) => { pr.head.ref = 'publisher/another-slug'; }],
      'base that is not main': [/into main/, ({ pr }) => { pr.base.ref = 'release'; }],
      'post folder absent from the checkout': [/Missing production post directory/, ({ root }) => fs.rmSync(postFolder(root, manifest), { recursive: true })],
      'source metadata changed': [/title does not match source/, ({ root }) => {
        const file = path.join(postFolder(root, manifest), source);
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(`title: "${manifest.title}"`, 'title: "Edited Afterwards"'));
      }],
      'unexpected file in the post folder': [/Unexpected production file/, ({ root }) => fs.writeFileSync(path.join(postFolder(root, manifest), 'notes.md'), 'x')],
      'image missing from the post folder': [/Missing production file/, ({ root }) => fs.rmSync(path.join(postFolder(root, manifest), hero))],
      ...(kind === 'ood' ? {
        'route missing from the checked-in sitemap': [/sitemap\.xml/, ({ root }) => fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), '<urlset></urlset>')],
      } : {}),
    };

    // The untouched draft passes; each violation alone makes it fail.
    const untouched = ciView(t, github, draft);
    assert.deepEqual(checkPublishingPullRequest(untouched.event, { root: untouched.root }).errors, []);
    for (const [label, [expected, violate]] of Object.entries(violations)) {
      const view = ciView(t, github, draft);
      violate({ event: view.event, pr: view.event.pull_request, root: view.root });
      const outcome = checkPublishingPullRequest(view.event, { root: view.root });
      assert.equal(outcome.skipped, false, `${kind} / ${label}`);
      assert.match(outcome.errors.join('\n'), expected, `${kind} / ${label}: ${JSON.stringify(outcome.errors)}`);
    }
  }
});

// ---- the producer verifies what it is about to describe -------------------

test('finish checks the uploaded bytes against the manifest before it writes anything', async () => {
  for (const kind of ['ood', 'life']) {
    const fixture = publishingFixture(kind, 'verified-upload', { bodyImages: 1 });
    const { manifest } = fixture;
    const repository = manifest.repository;
    const [card, hero] = manifest.images.map((image) => image.file);
    const source = Object.keys(fixture.production).at(kind === 'ood' ? 0 : 1);
    const replace = async (request, file, bytes) => {
      const [uploaded] = await upload(repository, { [file]: bytes });
      return { ...request, blobs: request.blobs.map((blob) => (blob.path === file ? uploaded : blob)) };
    };
    // The session's preflight record is the caller's own account of the
    // package. A caller who swaps bytes also rewrites it to agree, so only
    // the bytes themselves can show the difference.
    const agreeingSession = (request) => ({
      ...request,
      session: {
        ...request.session,
        preflight: {
          ...request.session.preflight,
          imageMetadata: request.session.preflight.imageMetadata.map((image) => ({
            ...image,
            bytes: request.blobs.find((blob) => blob.path === image.file)?.size ?? image.bytes,
          })),
        },
      },
    });

    const tampering = {
      'hero record that points at the card image': [/requires 1600x900/, (request) => {
        const cardBlob = request.blobs.find((blob) => blob.path === card);
        return { ...request, blobs: request.blobs.map((blob) => (blob.path === hero ? { ...cardBlob, path: hero } : blob)) };
      }],
      'bytes that are not an image': [/does not contain readable/, (request) => replace(request, card, Buffer.from('#!/bin/sh\necho not an image\n'))],
      'source whose title differs from the manifest': [/title does not match source/, (request) => replace(request, kind === 'ood' ? 'index.ts' : 'meta.ts', fixture.production[kind === 'ood' ? 'index.ts' : 'meta.ts'].toString().replace(`title: "${manifest.title}"`, 'title: "Something Else"'))],
      'source without the reader call to action': [/reader CTA/, (request) => replace(request, source, fixture.production[source].toString().replace('<a href="/contact">', '<a href="/elsewhere">'))],
      'source that no longer renders an image': [/not imported|not rendered/, (request) => replace(request, source, fixture.production[source].toString().replace(/import body1 from [^\n]+\n/, ''))],
      'manifest digest that is not the uploaded image\'s': [/SHA-256/, (request) => ({
        ...request,
        manifest: { ...request.manifest, images: request.manifest.images.map((image, index) => ({ ...image, sha256: index ? sha256(fixture.production[image.file]) : '0'.repeat(64) })) },
      })],
      'blob that is not in the repository': [/blob/i, (request) => ({ ...request, blobs: request.blobs.map((blob) => (blob.path === hero ? { ...blob, sha: 'f'.repeat(40) } : blob)) })],
    };
    for (const [label, [expected, tamper]] of Object.entries(tampering)) {
      const github = world();
      const refused = await run(github, () => submit(fixture, async (request) => agreeingSession(await tamper(request))));
      assert.ok(refused.status >= 400 && refused.status < 500, `${kind} / ${label}: ${refused.status} ${refused.text}`);
      assert.match(refused.payload.error, expected, `${kind} / ${label}`);
      assert.deepEqual([...github.repository(repository).refs.keys()], ['main'], `${kind} / ${label}: a branch was written`);
      assert.deepEqual(github.pulls(repository), [], `${kind} / ${label}: a pull request was opened`);
      assert.deepEqual(github.writes().filter((request) => !request.path.endsWith('/git/blobs')), [], `${kind} / ${label}`);
    }

    // A manifest that already carries the right digests is accepted as is.
    const github = world();
    const accepted = await run(github, () => submit(fixture, (request) => ({
      ...request,
      manifest: { ...request.manifest, images: request.manifest.images.map((image) => ({ ...image, sha256: sha256(fixture.production[image.file]) })) },
    })));
    assert.equal(accepted.status, 200, accepted.text);
  }
});
