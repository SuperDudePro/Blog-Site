import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import JSZip from 'jszip';
import blobHandler from '../api/publish/blob.mjs';
import finishHandler from '../api/publish/finish.mjs';
import resumeHandler from '../api/publish/resume.mjs';
import startHandler from '../api/publish/start.mjs';
import statusHandler from '../api/publish/status.mjs';
import { inspectPackage } from '../src/inspectPackage.js';
import { imageFixture } from '../test-support/fixtures.mjs';

const ACCESS_KEY = 'fixture-access-key';
const BASE_COMMIT = 'a'.repeat(40);
const MERGE_COMMIT = 'e'.repeat(40);

const profiles = {
  ood: {
    targetSite: 'Our Old Dad',
    repository: 'SuperDudePro/Blog-Site',
    project: 'blog-site',
    canonicalPrefix: 'https://ourolddad.com/post/',
    sourceFiles: ['index.ts'],
    imagePrefix: '',
    buildCommand: 'npm run build',
  },
  life: {
    targetSite: 'LifeEducation',
    repository: 'SuperDudePro/LifeEducationOrg',
    project: 'lifeeducation-site2',
    canonicalPrefix: 'https://www.lifeeducation.org/posts/',
    sourceFiles: ['meta.ts', 'index.tsx'],
    imagePrefix: 'images/',
    buildCommand: 'npm run check',
  },
};

function sha(value) {
  return createHash('sha1').update(String(value)).digest('hex');
}

function images(prefix) {
  return [
    { file: `${prefix}card-image.webp`, role: 'card', alt: 'Card image.', caption: null },
    { file: `${prefix}hero-image.webp`, role: 'hero', alt: 'Hero image.', caption: null },
    ...Array.from({ length: 4 }, (_, index) => ({
      file: `${prefix}body-image-${index + 1}.webp`,
      role: `body-${index + 1}`,
      alt: `Body image ${index + 1}.`,
      caption: null,
    })),
  ];
}

function packageSource(kind, slug) {
  if (kind === 'ood') {
    const bodyImports = Array.from({ length: 4 }, (_, index) => (
      `import body${index + 1} from "./body-image-${index + 1}.webp";`
    )).join('\n');
    const figures = Array.from({ length: 4 }, (_, index) => (
      `<img src="\${body${index + 1}}" alt="Body image ${index + 1}." />`
    )).join('');
    return {
      'index.ts': `
import cardImage from "./card-image.webp";
import heroImage from "./hero-image.webp";
${bodyImports}
const post = {
  title: "Fixture ${slug}",
  slug: "${slug}",
  excerpt: "Deterministic publishing fixture.",
  section: "diary",
  publishedAt: "2026-07-30",
  status: "Recent",
  cardImage,
  cardAlt: "Card image.",
  heroImage,
  heroAlt: "Hero image.",
  bodyHtml: \`${figures}<p><a href="/contact">Tell us what we missed.</a></p>\`,
};
export default post;`,
    };
  }
  const bodyImports = Array.from({ length: 4 }, (_, index) => (
    `import body${index + 1} from "./images/body-image-${index + 1}.webp";`
  )).join('\n');
  const figures = Array.from({ length: 4 }, (_, index) => (
    `<PostFigure src={body${index + 1}} alt="Body image ${index + 1}." />`
  )).join('');
  return {
    'meta.ts': `
import cardImage from "./images/card-image.webp";
import heroImage from "./images/hero-image.webp";
export const metadata = {
  title: "Fixture ${slug}",
  slug: "${slug}",
  excerpt: "Deterministic publishing fixture.",
  publishedAt: "2026-07-30",
  status: "Recent",
  topic: "Founding Notes",
  tags: ["LifeEducation"],
  cardImage,
  cardAlt: "Card image.",
  heroImage,
  heroAlt: "Hero image.",
};`,
    'index.tsx': `
import { metadata } from "./meta";
${bodyImports}
const post = {
  ...metadata,
  body: <>${figures}<p><a href="/contact">Tell us what we missed.</a></p></>,
};
export default post;`,
  };
}

async function buildPackage(kind, slug) {
  const profile = profiles[kind];
  const packageImages = images(profile.imagePrefix);
  const sourceFiles = packageSource(kind, slug);
  const manifest = {
    targetSite: profile.targetSite,
    repository: profile.repository,
    title: `Fixture ${slug}`,
    slug,
    excerpt: 'Deterministic publishing fixture.',
    publishedAt: '2026-07-30',
    status: 'Recent',
    ...(kind === 'ood'
      ? { section: 'diary' }
      : { topic: 'Founding Notes', tags: ['LifeEducation'] }),
    destinationPath: `src/content/posts/${slug}/`,
    canonicalUrl: `${profile.canonicalPrefix}${slug}`,
    buildCommand: profile.buildCommand,
    images: packageImages,
  };
  const root = `fixture--${kind}--${slug}`;
  const drop = `${root}/drop-in/${slug}/`;
  const zip = new JSZip();
  zip.file(`${root}/README-HANDOFF.md`, '# Fixture handoff');
  zip.file(`${root}/source/post.md`, '# Fixture post');
  zip.file(`${root}/source/image-notes.md`, '# Fixture images');
  zip.file(`${root}/source/package-manifest.json`, JSON.stringify(manifest));
  for (const [name, source] of Object.entries(sourceFiles)) zip.file(`${drop}${name}`, source);
  for (const image of packageImages) zip.file(`${drop}${image.file}`, imageFixture(image.role));
  const bytes = await zip.generateAsync({ type: 'uint8array' });
  const production = Object.fromEntries([
    ...Object.entries(sourceFiles).map(([name, source]) => [name, Buffer.from(source)]),
    ...packageImages.map((image) => [image.file, Buffer.from(imageFixture(image.role))]),
  ]);
  return { bytes, manifest, production };
}

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    status(value) {
      this.statusCode = value;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    send(value) {
      this.body = value;
    },
  };
}

async function call(handler, body) {
  const response = responseCapture();
  await handler({
    method: 'POST',
    headers: { 'x-publisher-key': ACCESS_KEY },
    body,
  }, response);
  const payload = JSON.parse(response.body);
  assert.ok(response.statusCode >= 200 && response.statusCode < 300, payload.error);
  return payload;
}

async function callRaw(handler, body) {
  const response = responseCapture();
  await handler({
    method: 'POST',
    headers: { 'x-publisher-key': ACCESS_KEY },
    body,
  }, response);
  return { status: response.statusCode, payload: JSON.parse(response.body) };
}

class FakeServices {
  constructor({ kind, slug, existing }) {
    this.profile = profiles[kind];
    this.slug = slug;
    this.existing = existing;
    this.baseTree = 'b'.repeat(40);
    this.nextTree = 'c'.repeat(40);
    this.nextCommit = 'd'.repeat(40);
    this.nextPr = kind === 'ood' ? 901 : 902;
    this.blobs = new Map();
    this.refs = new Map();
    this.pulls = [];
    this.trees = new Map();
    this.commits = new Map([[BASE_COMMIT, this.baseTree]]);
    this.baselines = new Map();
    const baseline = {
      schemaVersion: 1,
      repository: this.profile.repository,
      status: 'reviewed',
      entries: existing
        ? { [slug]: [{ ruleId: 'image.body.geometry', signature: 'wrong-size', reason: 'Fixture legacy defect.' }] }
        : {},
    };
    this.baselines.set(BASE_COMMIT, baseline);
    const baseEntries = existing
      ? this.profile.sourceFiles.map((name) => ({
          path: `src/content/posts/${slug}/${name}`,
          type: 'blob',
          sha: sha(`old-${name}`),
          size: 10,
        }))
      : [];
    this.trees.set(this.baseTree, baseEntries);
    this.merged = false;
  }

  json(value, status = 200) {
    return new Response(JSON.stringify(value), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  currentPull() {
    return this.pulls[0] || null;
  }

  async fetch(input, options = {}) {
    const url = new URL(String(input));
    if (url.hostname !== 'fake-github.test') return this.fetchPublished(url);
    const repositoryPrefix = `/repos/${this.profile.repository}`;
    if (!url.pathname.startsWith(repositoryPrefix)) {
      if (url.pathname.endsWith('/pulls')) return this.json([]);
      return this.json({ message: `Unhandled fixture repository: ${url.pathname}` }, 404);
    }
    const path = url.pathname.replace(repositoryPrefix, '');
    const method = String(options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;

    if (path === '' && method === 'GET') return this.json({ default_branch: 'main' });
    if (path === '/pulls' && method === 'GET') return this.json(this.pulls);
    if (path === '/git/ref/heads/main') return this.json({ object: { sha: BASE_COMMIT } });
    if (path === `/git/commits/${BASE_COMMIT}`) return this.json({ sha: BASE_COMMIT, tree: { sha: this.baseTree } });
    if (path === `/git/commits/${this.nextCommit}`) return this.json({ sha: this.nextCommit, tree: { sha: this.nextTree } });
    if (path.startsWith('/git/trees/') && method === 'GET') {
      const treeSha = path.split('/')[3];
      return this.json({ tree: this.trees.get(treeSha) || [] });
    }
    if (path === '/git/blobs' && method === 'POST') {
      const content = body.encoding === 'base64' ? Buffer.from(body.content, 'base64') : Buffer.from(body.content);
      const blobSha = sha(content);
      this.blobs.set(blobSha, content);
      return this.json({ sha: blobSha });
    }
    if (path.startsWith('/contents/post-contract-baseline.json')) {
      const ref = url.searchParams.get('ref') || BASE_COMMIT;
      const baseline = this.baselines.get(ref) || this.baselines.get(BASE_COMMIT);
      return this.json({
        encoding: 'base64',
        content: Buffer.from(`${JSON.stringify(baseline, null, 2)}\n`).toString('base64'),
      });
    }
    if (path === '/git/trees' && method === 'POST') {
      const combined = new Map((this.trees.get(this.baseTree) || []).map((entry) => [entry.path, entry]));
      for (const entry of body.tree) {
        if (entry.sha === null) combined.delete(entry.path);
        else combined.set(entry.path, { ...entry, size: this.blobs.get(entry.sha)?.length || 0 });
      }
      this.trees.set(this.nextTree, [...combined.values()]);
      const baselineEntry = body.tree.find((entry) => entry.path === 'post-contract-baseline.json');
      const nextBaseline = baselineEntry
        ? JSON.parse(this.blobs.get(baselineEntry.sha).toString('utf8'))
        : this.baselines.get(BASE_COMMIT);
      this.pendingBaseline = nextBaseline;
      return this.json({ sha: this.nextTree });
    }
    if (path === '/git/commits' && method === 'POST') {
      this.commits.set(this.nextCommit, body.tree);
      this.baselines.set(this.nextCommit, this.pendingBaseline || this.baselines.get(BASE_COMMIT));
      return this.json({ sha: this.nextCommit });
    }
    if (path.startsWith('/git/ref/heads/publisher')) {
      const branch = decodeURIComponent(path.replace('/git/ref/heads/', ''));
      if (!this.refs.has(branch)) return this.json({ message: 'Reference does not exist' }, 404);
      return this.json({ object: { sha: this.refs.get(branch) } });
    }
    if (path === '/git/refs' && method === 'POST') {
      this.refs.set(body.ref.replace('refs/heads/', ''), body.sha);
      return this.json({ ref: body.ref, object: { sha: body.sha } });
    }
    if (path.startsWith('/git/refs/heads/') && method === 'PATCH') {
      const branch = decodeURIComponent(path.replace('/git/refs/heads/', ''));
      this.refs.set(branch, body.sha);
      return this.json({ ref: `refs/heads/${branch}`, object: { sha: body.sha } });
    }
    if (path === '/pulls' && method === 'POST') {
      const pull = {
        number: this.nextPr,
        html_url: `https://github.com/${this.profile.repository}/pull/${this.nextPr}`,
        title: body.title,
        body: body.body,
        state: 'open',
        merged: false,
        merged_at: null,
        merge_commit_sha: null,
        updated_at: '2026-07-30T18:00:00Z',
        head: { ref: body.head, sha: this.nextCommit },
        base: { ref: body.base },
      };
      this.pulls = [pull];
      return this.json(pull);
    }
    if (path === `/pulls/${this.nextPr}` && method === 'PATCH') {
      Object.assign(this.pulls[0], body, { head: { ...this.pulls[0].head, sha: this.nextCommit } });
      return this.json(this.pulls[0]);
    }
    if (path === `/pulls/${this.nextPr}` && method === 'GET') {
      return this.json({
        ...this.pulls[0],
        merged: this.merged,
        merged_at: this.merged ? '2026-07-30T19:00:00Z' : null,
        merge_commit_sha: this.merged ? MERGE_COMMIT : null,
        state: this.merged ? 'closed' : 'open',
      });
    }
    if (path === `/commits/${this.nextCommit}/check-runs`) {
      return this.json({ check_runs: [{ name: 'Site validation', status: 'completed', conclusion: 'success', app: { name: 'GitHub Actions' } }] });
    }
    if (path === `/commits/${this.nextCommit}/status`) {
      return this.json({ statuses: [{ context: 'Vercel', state: 'success', target_url: 'https://vercel.com/fixture' }] });
    }
    if (path === `/issues/${this.nextPr}/comments`) {
      return this.json([{
        body: `| Project | Deployment | Actions |\n| [${this.profile.project}](https://vercel.com/team/${this.profile.project}) | Ready | [Preview](https://${this.profile.project}-git-fixture.vercel.app) |`,
      }]);
    }
    if (path.startsWith('/compare/')) return this.json({ status: 'identical' });
    return this.json({ message: `Unhandled fake GitHub route: ${method} ${path}` }, 404);
  }

  fetchPublished(url) {
    if (url.pathname === '/deployment.json') return this.json({ commit: MERGE_COMMIT });
    const canonicalUrl = `${this.profile.canonicalPrefix}${this.slug}`;
    const html = `<html><head><title>Fixture ${this.slug} | ${this.profile.targetSite}</title><link rel="canonical" href="${canonicalUrl}"></head><body><h1>Fixture ${this.slug}</h1></body></html>`;
    return new Response(html, { status: 200, headers: { 'content-type': 'text/html' } });
  }
}

async function uploadProduction(repository, production) {
  const blobs = [];
  for (const [path, bytes] of Object.entries(production)) {
    const result = await call(blobHandler, {
      repository,
      encoding: 'base64',
      content: bytes.toString('base64'),
    });
    blobs.push({ path, sha: result.sha, size: bytes.length });
  }
  return blobs;
}

async function exerciseJourney(kind, existing) {
  const slug = `${existing ? 'existing' : 'new'}-${kind}-fixture`;
  const fixture = await buildPackage(kind, slug);
  const inspection = await inspectPackage(fixture.bytes);
  assert.deepEqual(inspection.checks.filter((check) => !check.ok), []);

  const services = new FakeServices({ kind, slug, existing });
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    PUBLISHER_ACCESS_KEY: process.env.PUBLISHER_ACCESS_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_API_URL: process.env.GITHUB_API_URL,
  };
  process.env.PUBLISHER_ACCESS_KEY = ACCESS_KEY;
  process.env.GITHUB_TOKEN = 'fixture-token';
  process.env.GITHUB_API_URL = 'https://fake-github.test';
  globalThis.fetch = services.fetch.bind(services);

  try {
    const start = await call(startHandler, {
      manifest: inspection.manifest,
      preflight: inspection.preflight,
    });
    assert.equal(start.session.operation, existing ? 'replace' : 'create');
    assert.equal(start.session.existingPullRequest, null);

    const blobs = await uploadProduction(inspection.manifest.repository, fixture.production);
    const finish = await call(finishHandler, {
      manifest: inspection.manifest,
      session: start.session,
      blobs,
    });
    assert.equal(finish.result.prNumber, services.nextPr);
    assert.equal(services.pulls.length, 1);
    if (existing) assert.equal(services.baselines.get(services.nextCommit).entries[slug], undefined);

    const preview = await call(statusHandler, {
      handoff: finish.result,
      manifest: inspection.manifest,
    });
    assert.equal(preview.readyToMerge, true);
    assert.equal(preview.smoke.state, 'success');

    const restored = await call(resumeHandler, {
      job: `${inspection.manifest.repository}#${services.nextPr}`,
    });
    assert.equal(restored.job.handoff.prNumber, services.nextPr);
    assert.equal(restored.job.manifest.slug, slug);

    const repeatStart = await call(startHandler, {
      manifest: inspection.manifest,
      preflight: inspection.preflight,
    });
    assert.equal(repeatStart.session.existingPullRequest.number, services.nextPr);
    const repeatBlobs = await uploadProduction(inspection.manifest.repository, fixture.production);
    const repeatFinish = await call(finishHandler, {
      manifest: inspection.manifest,
      session: repeatStart.session,
      blobs: repeatBlobs,
    });
    assert.equal(repeatFinish.result.prNumber, services.nextPr);
    assert.equal(repeatFinish.result.recovered, true);
    assert.equal(services.pulls.length, 1);

    services.merged = true;
    const production = await call(statusHandler, {
      handoff: finish.result,
      manifest: inspection.manifest,
    });
    assert.equal(production.merged, true);
    assert.equal(production.production.state, 'success');
    assert.equal(production.publishingComplete, true);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

for (const [kind, existing, label] of [
  ['ood', false, 'new Our Old Dad post'],
  ['ood', true, 'existing Our Old Dad retrofit'],
  ['life', false, 'new LifeEducation post'],
  ['life', true, 'existing LifeEducation retrofit'],
]) {
  test(`complete deterministic journey: ${label}`, async () => {
    await exerciseJourney(kind, existing);
  });
}

test('failed aggregate preflight performs no GitHub request or write', async () => {
  const fixture = await buildPackage('life', 'invalid-preflight-fixture');
  const inspection = await inspectPackage(fixture.bytes);
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    PUBLISHER_ACCESS_KEY: process.env.PUBLISHER_ACCESS_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_API_URL: process.env.GITHUB_API_URL,
  };
  let githubCalls = 0;
  process.env.PUBLISHER_ACCESS_KEY = ACCESS_KEY;
  process.env.GITHUB_TOKEN = 'fixture-token';
  process.env.GITHUB_API_URL = 'https://fake-github.test';
  globalThis.fetch = async () => {
    githubCalls += 1;
    return new Response(JSON.stringify({ message: 'Preflight should have stopped this request.' }), { status: 500 });
  };
  try {
    const invalid = {
      ...inspection,
      manifest: {
        ...inspection.manifest,
        canonicalUrl: 'https://www.lifeeducation.org/posts/wrong',
        status: 'Starter',
        tags: [],
      },
      preflight: {
        ...inspection.preflight,
        productionPaths: inspection.preflight.productionPaths.concat('notes.md'),
        imageMetadata: inspection.preflight.imageMetadata.map((image) => (
          image.role === 'card' ? { ...image, width: 1000, height: 750 } : image
        )),
      },
    };
    const result = await callRaw(startHandler, {
      manifest: invalid.manifest,
      preflight: invalid.preflight,
    });
    assert.equal(result.status, 400);
    assert.equal(result.payload.code, 'PACKAGE_PREFLIGHT_FAILED');
    assert.ok(result.payload.details.errors.length >= 5);
    assert.equal(githubCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
