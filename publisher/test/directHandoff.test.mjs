import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { verifyDirectHandoff, parseDirectManifest } from '../lib/directHandoff.mjs';
import { imageFixture } from '../test-support/fixtures.mjs';
import handler from '../api/publish/direct-verify.mjs';

const repo = 'SuperDudePro/Blog-Site';
const sha = 'a'.repeat(40);
const images = [
  { file: 'card-image.webp', role: 'card', alt: 'Card image.', caption: null },
  { file: 'hero-image.webp', role: 'hero', alt: 'Hero image.', caption: null },
  ...Array.from({length:4},(_,i)=>({file:`body-image-${i+1}.webp`,role:`body-${i+1}`,alt:`Body image ${i+1}.`,caption:null})),
].map((image) => ({
  ...image,
  sha256: createHash('sha256').update(imageFixture(image.role)).digest('hex'),
}));

const manifest = {
  targetSite: 'Our Old Dad',
  repository: repo,
  title: 'Direct Test',
  slug: 'direct-test',
  excerpt: 'A no ZIP direct handoff.',
  publishedAt: '2026-11-04',
  status: 'Draft',
  section: 'diary',
  destinationPath: 'src/content/posts/direct-test/',
  canonicalUrl: 'https://ourolddad.com/post/direct-test',
  buildCommand: 'npm run build',
  images,
};

const source = [
  'import cardImage from "./card-image.webp";',
  'import heroImage from "./hero-image.webp";',
  ...Array.from({length:4},(_,i)=>`import body${i+1} from "./body-image-${i+1}.webp";`),
  'const post = {',
  '  title: "Direct Test",',
  '  slug: "direct-test",',
  '  excerpt: "A no ZIP direct handoff.",',
  '  section: "diary",',
  '  publishedAt: "2026-11-04",',
  '  status: "Draft",',
  '  cardImage,',
  '  cardAlt: "Card image.",',
  '  heroImage,',
  '  heroAlt: "Hero image.",',
  '  bodyHtml: `<p>Reading flow.</p>' + Array.from({length:4},(_,i)=>'<img src="${body'+(i+1)+'}" alt="Body image '+(i+1)+'." />').join('') + '<a href="/contact">Contact us.</a>`,' ,
  '};',
  'export default post;',
].join('\n');

const prBody = (value = manifest) => [
  '- Site profile: **Our Old Dad**',
  '- Handoff method: **Direct GitHub**',
  '- Slug: ' + String.fromCharCode(96) + 'direct-test' + String.fromCharCode(96),
  '- Destination: ' + String.fromCharCode(96) + 'src/content/posts/direct-test/' + String.fromCharCode(96),
  '- Canonical URL: https://ourolddad.com/post/direct-test',
  '',
  '## Publisher manifest',
  '',
  String.fromCharCode(96).repeat(3) + 'json',
  JSON.stringify(value, null, 2),
  String.fromCharCode(96).repeat(3),
].join('\n');

const fixture = (options = {}) => {
  const fileBytes = new Map([
    ['index.ts', Buffer.from(source)],
    ...images.map((image) => [image.file, Buffer.from(imageFixture(image.role))]),
  ]);
  const files = [...fileBytes.entries()].map(([path, bytes], index) => ({
    path, sha: String(index + 1).repeat(40), size: bytes.length,
  }));
  const pull = {
    number: 99,
    state: 'open',
    merged_at: null,
    title: 'Publish Direct Test',
    body: prBody(options.manifest || manifest),
    html_url: 'https://github.com/SuperDudePro/Blog-Site/pull/99',
    head: { ref: options.branch || 'publisher/direct-test', sha, repo: { full_name: repo } },
    base: { ref: 'main' },
  };
  const calls = [];
  const dependencies = {
    listFiles: async () => files,
    request: async (repository, path, config) => {
      calls.push({ repository, path, method: config?.method || 'GET' });
      if (path === '/pulls/99') return pull;
      if (path === '/git/commits/' + sha) return { tree: { sha: 'b'.repeat(40) } };
      if (path.startsWith('/git/blobs/')) {
        const file = files.find((item) => path === '/git/blobs/' + item.sha);
        return { sha: file.sha, encoding: 'base64', content: fileBytes.get(file.path).toString('base64') };
      }
      throw new Error('Unexpected route: ' + path);
    },
  };
  return { files, pull, calls, dependencies };
};

test('direct handoff preflight reads GitHub assets and validates the selected body images', async () => {
  const f = fixture();
  const result = await verifyDirectHandoff({ repository: repo, prNumber: 99 }, f.dependencies);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.imageCount, 6);
  assert.equal(result.verifiedFiles, 7);
  assert.equal(result.commitSha, sha);
  assert.ok(f.calls.length >= 5);
  assert.ok(f.calls.every((call) => call.method === 'GET'));
});

test('direct handoff fails if approved image digest differs from GitHub bytes', async () => {
  const altered = structuredClone(manifest);
  altered.images[0].sha256 = '0'.repeat(64);
  const f = fixture({ manifest: altered });
  const result = await verifyDirectHandoff({ repository: repo, prNumber: 99 }, f.dependencies);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /SHA-256/);
});

test('rejects branch drift before fetching any image blobs', async () => {
  const f = fixture({ branch: 'feature/not-a-publishing-branch' });
  await assert.rejects(
    verifyDirectHandoff({ repository: repo, prNumber: 99 }, f.dependencies),
    /not a marked Publisher direct GitHub handoff|deterministic/,
  );
  assert.equal(f.calls.some((call) => call.path.startsWith('/git/blobs/')), false);
});

test('rejects a missing direct manifest instead of inferring content from PR title', () => {
  assert.throws(() => parseDirectManifest('- Handoff method: **Direct GitHub**'), /manifest JSON/);
});

test('direct handoff endpoint requires the private publisher access key', async () => {
  const original = process.env.PUBLISHER_ACCESS_KEY;
  process.env.PUBLISHER_ACCESS_KEY = 'fixture-access';
  const response = {
    statusCode: 0,
    status(value) { this.statusCode = value; return this; },
    setHeader() {},
    send(value) { this.payload = JSON.parse(value); },
  };
  try {
    await handler({ method: 'POST', headers: { 'x-publisher-key': 'wrong' }, body: {} }, response);
    assert.equal(response.statusCode, 401);
  } finally {
    if (original === undefined) delete process.env.PUBLISHER_ACCESS_KEY;
    else process.env.PUBLISHER_ACCESS_KEY = original;
  }
});
