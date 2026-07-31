import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  candidateBaseline,
  ctaAuditMarkdown,
  evaluateBaseline,
  retrofitQueue,
  scanOurOldDad,
} from '../scripts/post-contract.mjs';

function png(width, height) {
  const buffer = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(buffer);
  buffer.write('IHDR', 12, 4, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function createRepo({
  count = 4,
  cardFile = 'card-image.webp',
  heroFile = 'hero-image.webp',
  gap = false,
  blankAlt = false,
  cardDimensions = [960, 720],
  heroDimensions = [1600, 900],
  bodyDimensions = [1200, 900],
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ood-contract-'));
  const folder = path.join(root, 'src/content/posts/valid-post');
  fs.mkdirSync(folder, { recursive: true });
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'public/sitemap.xml'),
    '<urlset><url><loc>https://ourolddad.com/contact</loc></url><url><loc>https://ourolddad.com/post/valid-post</loc></url></urlset>',
  );
  const bodyFiles = Array.from({ length: count }, (_, index) => `body-image-${gap && index === count - 1 ? index + 2 : index + 1}.webp`);
  fs.writeFileSync(path.join(folder, cardFile), png(...cardDimensions));
  fs.writeFileSync(path.join(folder, heroFile), png(...heroDimensions));
  for (const file of bodyFiles) fs.writeFileSync(path.join(folder, file), png(...bodyDimensions));
  const imports = [
    "import type { BlogPost } from '../../postTypes';",
    `import cardImage from './${cardFile}';`,
    `import heroImage from './${heroFile}';`,
    ...bodyFiles.map((file, index) => `import body${index + 1} from './${file}';`),
  ].join('\n');
  const figures = bodyFiles
    .map((_, index) => `<figure class="post-figure"><img src="\${body${index + 1}}" alt="${blankAlt && index === 0 ? '' : `Body ${index + 1}.`}" loading="lazy" decoding="async" /></figure>`)
    .join('\n');
  fs.writeFileSync(
    path.join(folder, 'index.ts'),
    `${imports}
const post: BlogPost = {
  slug: 'valid-post',
  title: 'Valid Post',
  excerpt: 'A valid excerpt.',
  section: 'diary',
  publishedAt: '2026-07-29',
  status: 'Recent',
  cardImage,
  cardAlt: 'Card.',
  heroImage,
  heroAlt: 'Hero.',
  bodyHtml: \`<p>Body.</p>${figures}<p><a href="/contact">Write to me.</a></p>\`,
};
export default post;
`,
  );
  return root;
}

test('valid current-standard Our Old Dad post passes', () => {
  const scan = scanOurOldDad(createRepo());
  assert.deepEqual(scan.posts[0].defects, []);
});

test('relative and canonical absolute contact CTAs are both verified inside bodyHtml', () => {
  const relative = scanOurOldDad(createRepo());
  assert.deepEqual(relative.posts[0].ctaEvidence.matches, [{ href: '/contact', text: 'Write to me.' }]);

  const absoluteRoot = createRepo();
  const indexPath = path.join(absoluteRoot, 'src/content/posts/valid-post/index.ts');
  fs.writeFileSync(
    indexPath,
    fs.readFileSync(indexPath, 'utf8').replace('href="/contact"', 'href="https://ourolddad.com/contact"'),
  );
  const absolute = scanOurOldDad(absoluteRoot);
  assert(!absolute.posts[0].defects.some((value) => value.ruleId === 'cta.contact.required'));
  assert.deepEqual(absolute.posts[0].ctaEvidence.matches, [
    { href: 'https://ourolddad.com/contact', text: 'Write to me.' },
  ]);
});

test('contact wording without an article link does not satisfy the CTA contract', () => {
  const root = createRepo();
  const indexPath = path.join(root, 'src/content/posts/valid-post/index.ts');
  fs.writeFileSync(
    indexPath,
    fs.readFileSync(indexPath, 'utf8').replace('<a href="/contact">Write to me.</a>', 'Use the Contact link in the site footer.'),
  );
  const scan = scanOurOldDad(root);
  assert(scan.posts[0].defects.some((value) => value.ruleId === 'cta.contact.required'));
  assert.deepEqual(scan.posts[0].ctaEvidence.matches, []);
  assert.match(ctaAuditMarkdown(scan), /Closing article text: .*Use the Contact link in the site footer\./);
});

test('fewer than four body roles fails', () => {
  const scan = scanOurOldDad(createRepo({ count: 3 }));
  assert(scan.posts[0].defects.some((value) => value.ruleId === 'image.body.minimum'));
});

test('card or hero reuse and numbering gaps fail', () => {
  const reused = scanOurOldDad(createRepo({ cardFile: 'body-image-1.webp' }));
  assert(reused.posts[0].defects.some((value) => value.ruleId === 'image.role.body-reuse'));
  const gap = scanOurOldDad(createRepo({ gap: true }));
  assert(gap.posts[0].defects.some((value) => value.ruleId === 'image.body.sequence'));
});

test('code, file, and alt mismatch fails', () => {
  const scan = scanOurOldDad(createRepo({ blankAlt: true }));
  assert(scan.posts[0].defects.some((value) => value.ruleId === 'image.body.alt'));
});

test('invalid card, hero, and body geometry is reported with exact dimensions', () => {
  const scan = scanOurOldDad(createRepo({
    cardDimensions: [1200, 900],
    heroDimensions: [960, 720],
    bodyDimensions: [800, 600],
  }));
  const defects = scan.posts[0].defects;
  assert(defects.some((value) =>
    value.ruleId === 'image.role.card.geometry'
    && value.signature === 'file=card-image.webp;actual=1200x900;expected=960x720'));
  assert(defects.some((value) =>
    value.ruleId === 'image.role.hero.geometry'
    && value.signature === 'file=hero-image.webp;actual=960x720;expected=1600x900'));
  assert.equal(defects.filter((value) => value.ruleId === 'image.body.geometry').length, 4);
  assert.equal(scan.posts[0].priority, 'P2 image completion');
});

test('unreadable image data is reported as a geometry defect instead of crashing', () => {
  const root = createRepo();
  fs.writeFileSync(path.join(root, 'src/content/posts/valid-post/card-image.webp'), '');
  const scan = scanOurOldDad(root);
  assert(scan.posts[0].defects.some((value) =>
    value.ruleId === 'image.role.card.geometry'
    && value.signature.includes('actual=unreadable')));
});

test('retrofit queue is newest-first and exposes the exact reviewed findings', () => {
  const scan = {
    posts: [
      { slug: 'older', title: 'Older', publishedAt: '2024-01-01', priority: 'P3 finish and cleanup' },
      { slug: 'newer', title: 'Newer', publishedAt: '2026-01-01', priority: 'P2 image completion' },
    ],
  };
  const baseline = {
    entries: {
      older: [{ ruleId: 'cta.contact.required', signature: '/contact', reason: 'Missing CTA.' }],
      newer: [{ ruleId: 'image.body.geometry', signature: 'bad-size', reason: 'Bad size.' }],
    },
  };
  assert.deepEqual(retrofitQueue(scan, baseline), [
    {
      queueNumber: 1,
      queueTotal: 2,
      slug: 'newer',
      title: 'Newer',
      publishedAt: '2026-01-01',
      priority: 'P2 image completion',
      defects: [{ ruleId: 'image.body.geometry', signature: 'bad-size', message: 'Bad size.' }],
    },
    {
      queueNumber: 2,
      queueTotal: 2,
      slug: 'older',
      title: 'Older',
      publishedAt: '2024-01-01',
      priority: 'P3 finish and cleanup',
      defects: [{ ruleId: 'cta.contact.required', signature: '/contact', message: 'Missing CTA.' }],
    },
  ]);
});

test('failed retrofit does not advance next and confirmed baseline retirement does', () => {
  const scan = {
    posts: [
      { slug: 'first', title: 'First', publishedAt: '2026-07-01', priority: 'P2 image completion' },
      { slug: 'second', title: 'Second', publishedAt: '2026-06-01', priority: 'P3 finish and cleanup' },
    ],
  };
  const baseline = {
    entries: {
      first: [{ ruleId: 'image.body.geometry', signature: 'wrong-size' }],
      second: [{ ruleId: 'cta.contact.required', signature: '/contact' }],
    },
  };
  assert.equal(retrofitQueue(scan, baseline)[0].slug, 'first');
  assert.equal(retrofitQueue(scan, structuredClone(baseline))[0].slug, 'first');
  delete baseline.entries.first;
  assert.equal(retrofitQueue(scan, baseline)[0].slug, 'second');
});

test('only the exact reviewed legacy defect is allowed', () => {
  const root = createRepo({ count: 3 });
  const first = scanOurOldDad(root);
  const baseline = candidateBaseline(first);
  baseline.status = 'reviewed';
  baseline.reviewedAt = '2026-07-29';
  assert.deepEqual(evaluateBaseline(first, baseline), []);
  fs.unlinkSync(path.join(root, 'src/content/posts/valid-post/body-image-3.webp'));
  const sourcePath = path.join(root, 'src/content/posts/valid-post/index.ts');
  fs.writeFileSync(sourcePath, fs.readFileSync(sourcePath, 'utf8').replace("import body3 from './body-image-3.webp';", ''));
  const changed = scanOurOldDad(root);
  assert(evaluateBaseline(changed, baseline).some((value) => value.includes('unapproved')));
});

test('obsolete baseline defects fail until removed', () => {
  const legacy = scanOurOldDad(createRepo({ count: 3 }));
  const baseline = candidateBaseline(legacy);
  baseline.status = 'reviewed';
  const repaired = scanOurOldDad(createRepo());
  assert(evaluateBaseline(repaired, baseline).some((value) => value.includes('obsolete baseline entry')));
});
