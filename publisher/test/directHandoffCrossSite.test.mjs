import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { verifyDirectHandoff } from '../lib/directHandoff.mjs';
import { findPublishingPullRequest, jobFromPullRequest } from '../lib/publishingJobs.mjs';
import { expectedImageRecords, getSiteProfile } from '../siteProfiles.mjs';
import { imageFixture } from '../test-support/fixtures.mjs';

function directFixture(kind) {
  const life = kind === 'lifeeducation';
  const profile = getSiteProfile({ targetSite: life ? 'LifeEducation' : 'Our Old Dad' });
  const slug = life ? 'life-verification-fixture' : 'ood-verification-fixture';
  const title = life ? 'Life Verification Fixture' : 'OOD Verification Fixture';
  const images = expectedImageRecords(profile, 4).map((image) => ({
    ...image,
    alt: image.role === 'card' ? 'Card illustration.' : image.role === 'hero' ? 'Hero illustration.' : 'Body ' + image.role.slice(5) + '.',
    caption: null,
    sha256: createHash('sha256').update(imageFixture(image.role)).digest('hex'),
  }));
  const manifest = {
    repository: profile.repository,
    targetSite: profile.targetSite,
    title,
    slug,
    excerpt: 'Private synthetic handoff rehearsal.',
    publishedAt: '2026-11-04',
    status: life ? 'Draft' : 'Recent',
    destinationPath: 'src/content/posts/' + slug + '/',
    canonicalUrl: profile.canonicalPrefix + slug,
    buildCommand: profile.buildCommand,
    images,
    ...(life ? { topic: 'Founding Notes', tags: ['LifeEducation'] } : { section: 'diary' }),
  };
  const bodies = images.filter((image) => image.role.startsWith('body-'));
  const imports = bodies.map((image, i) => 'import body' + (i + 1) + ' from "./' + image.file + '";');
  const files = {};
  if (life) {
    files['meta.ts'] = [
      'import cardImage from "./images/card-image.webp";',
      'import heroImage from "./images/hero-image.webp";',
      'export const metadata = {',
      'title: "' + title + '",',
      'slug: "' + slug + '",',
      'excerpt: "Private synthetic handoff rehearsal.",',
      'publishedAt: "2026-11-04", status: "Draft",',
      'topic: "Founding Notes", tags: ["LifeEducation"],',
      'cardImage, cardAlt: "Card illustration.",',
      'heroImage, heroAlt: "Hero illustration.",',
      '};',
    ].join('\n');
    files['index.tsx'] = [
      'import { metadata } from "./meta";',
      ...imports,
      'const post = { ...metadata, body: <>',
      ...bodies.map((image, i) => '<PostFigure src={body' + (i + 1) + '} alt="' + image.alt + '" />'),
      '<a href="/contact">Contact us.</a>',
      '</> };',
      'export default post;',
    ].join('\n');
  } else {
    const figures = bodies.map((image, i) =>
      '<img src="' + '$' + '{body' + (i + 1) + '}" alt="' + image.alt + '" />').join('');
    files['index.ts'] = [
      'import cardImage from "./card-image.webp";',
      'import heroImage from "./hero-image.webp";',
      ...imports,
      'const post = {',
      'title: "' + title + '", slug: "' + slug + '",',
      'excerpt: "Private synthetic handoff rehearsal.",',
      'section: "diary", publishedAt: "2026-11-04", status: "Recent",',
      'cardImage, cardAlt: "Card illustration.",',
      'heroImage, heroAlt: "Hero illustration.",',
      'bodyHtml: ' + String.fromCharCode(96) + '<p>Fixture.</p>' + figures +
        '<a href="/contact">Contact us.</a>' + String.fromCharCode(96) + ',',
      '}; export default post;',
    ].join('\n');
  }
  const records = [
    ...Object.entries(files).map(([path, contents]) => ({ path, bytes: Buffer.from(contents) })),
    ...images.map((image) => ({ path: image.file, bytes: Buffer.from(imageFixture(image.role)) })),
  ].map(({ path, bytes }) => ({
    path,
    bytes,
    size: bytes.length,
    sha: createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex'),
  }));
  const body = [
    '- Site profile: **' + manifest.targetSite + '**',
    '- Handoff method: **Direct GitHub**',
    '- Slug: ' + String.fromCharCode(96) + slug + String.fromCharCode(96),
    '- Destination: ' + String.fromCharCode(96) + manifest.destinationPath + String.fromCharCode(96),
    '- Canonical URL: ' + manifest.canonicalUrl,
    '## Publisher manifest', '',
    String.fromCharCode(96).repeat(3) + 'json',
    JSON.stringify(manifest, null, 2),
    String.fromCharCode(96).repeat(3),
  ].join('\n');
  const pull = {
    state: 'open', number: 881, html_url: 'https://github.com/' + profile.repository + '/pull/881',
    title: 'Publish ' + title, body,
    head: { ref: 'publisher/' + slug, sha: 'a'.repeat(40), repo: { full_name: profile.repository } },
    base: { ref: 'main' },
  };
  const calls = [];
  const dependencies = {
    listFiles: async () => records.map(({ path, sha, size }) => ({ path, sha, size })),
    request: async (repository, route, options) => {
      assert.equal(repository, profile.repository);
      calls.push({ route, method: options?.method || 'GET' });
      if (route === '/pulls/881') return pull;
      if (route === '/git/commits/' + pull.head.sha) return { tree: { sha: 'b'.repeat(40) } };
      if (route.startsWith('/git/blobs/')) {
        const item = records.find((record) => route === '/git/blobs/' + record.sha);
        if (!item) throw new Error('Unrecognized fixture blob.');
        return { sha: item.sha, content: item.bytes.toString('base64'), encoding: 'base64' };
      }
      throw new Error('Unrecognized fixture route ' + route);
    },
  };
  return { profile, slug, title, images, records, pull, calls, dependencies };
}

for (const kind of ['our-old-dad', 'lifeeducation']) {
  test(kind + ' verifies actual WebP bytes and expected source with no GitHub writes', async () => {
    const fixture = directFixture(kind);
    const report = await verifyDirectHandoff({
      repository: fixture.profile.repository, prNumber: fixture.pull.number,
    }, fixture.dependencies);
    assert.equal(report.ok, true, report.errors.join('\n'));
    assert.equal(report.verifiedFiles, fixture.records.length);
    assert.equal(report.imageCount, fixture.images.length);
    assert.ok(fixture.calls.every((call) => call.method === 'GET'));
    assert.equal(jobFromPullRequest(fixture.profile.repository, fixture.pull)?.handoffMethod, 'direct-github');
  });

  test(kind + ' locates the existing deterministic PR rather than a duplicate', () => {
    const fixture = directFixture(kind);
    const prior = findPublishingPullRequest([fixture.pull], {
      slug: fixture.slug, branch: 'publisher/' + fixture.slug,
    });
    assert.equal(prior?.number, 881);
  });

  test(kind + ' rejects changed image bytes after approved manifest digest', async () => {
    const fixture = directFixture(kind);
    const original = fixture.dependencies.request;
    fixture.dependencies.request = async (repository, route, options) => {
      const record = fixture.records.find((item) => item.path.endsWith('hero-image.webp'));
      const response = await original(repository, route, options);
      if (route === '/git/blobs/' + record.sha) {
        const tampered = Buffer.from(response.content, 'base64');
        tampered[tampered.length - 1] ^= 1;
        return { ...response, content: tampered.toString('base64') };
      }
      return response;
    };
    const report = await verifyDirectHandoff({
      repository: fixture.profile.repository, prNumber: fixture.pull.number,
    }, fixture.dependencies);
    assert.equal(report.ok, false);
    assert.match(report.errors.join('\n'), /SHA-256/);
  });
}
