import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { candidateBaseline, ctaAuditMarkdown, evaluateBaseline, scanOurOldDad } from '../scripts/post-contract.mjs';

function createRepo({ count = 4, cardFile = 'card-image.webp', heroFile = 'hero-image.webp', gap = false, blankAlt = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ood-contract-'));
  const folder = path.join(root, 'src/content/posts/valid-post');
  fs.mkdirSync(folder, { recursive: true });
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'public/sitemap.xml'),
    '<urlset><url><loc>https://ourolddad.com/contact</loc></url><url><loc>https://ourolddad.com/post/valid-post</loc></url></urlset>',
  );
  const bodyFiles = Array.from({ length: count }, (_, index) => `body-image-${gap && index === count - 1 ? index + 2 : index + 1}.webp`);
  for (const file of [cardFile, heroFile, ...bodyFiles]) fs.writeFileSync(path.join(folder, file), '');
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
