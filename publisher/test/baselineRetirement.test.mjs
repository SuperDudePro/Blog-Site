import assert from 'node:assert/strict';
import test from 'node:test';
import { retireResolvedBaselineEntries, supportedPostDefects } from '../lib/baselineRetirement.mjs';

function postSource({ cta = true, bodyCount = 4 } = {}) {
  const bodyImports = Array.from(
    { length: bodyCount },
    (_, index) => `import body${index + 1} from './body-image-${index + 1}.webp';`,
  ).join('\n');
  const figures = Array.from(
    { length: bodyCount },
    (_, index) => `<img src="\${body${index + 1}}" alt="Body ${index + 1}." />`,
  ).join('');
  return `
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
${bodyImports}
const post = {
  cardImage,
  heroImage,
  bodyHtml: \`<p>Body.</p>${figures}${cta ? '<a href="https://ourolddad.com/contact">Write to us.</a>' : ''}\`,
};
`;
}

const baseline = () => ({
  schemaVersion: 1,
  repository: 'SuperDudePro/Blog-Site',
  status: 'reviewed',
  entries: {
    'sample-post': [
      { ruleId: 'cta.contact.required', signature: '/contact', reason: 'Missing CTA.' },
      { ruleId: 'image.body.minimum', signature: 'count=3', reason: 'Only three body images.' },
    ],
    'another-post': [
      { ruleId: 'cta.contact.required', signature: '/contact', reason: 'Missing CTA.' },
    ],
  },
});

test('retires only resolved exceptions after inspecting the uploaded post', () => {
  const result = retireResolvedBaselineEntries({
    baseline: baseline(),
    repository: 'SuperDudePro/Blog-Site',
    slug: 'sample-post',
    indexSource: postSource(),
  });
  assert.equal(result.changed, true);
  assert.deepEqual(result.retired.map((entry) => entry.ruleId), [
    'cta.contact.required',
    'image.body.minimum',
  ]);
  assert.equal(result.baseline.entries['sample-post'], undefined);
  assert.equal(result.baseline.entries['another-post'].length, 1);
});

test('preserves an exception while the uploaded post still has that exact defect', () => {
  const result = retireResolvedBaselineEntries({
    baseline: baseline(),
    repository: 'SuperDudePro/Blog-Site',
    slug: 'sample-post',
    indexSource: postSource({ cta: false, bodyCount: 3 }),
  });
  assert.equal(result.changed, false);
  assert.deepEqual(result.retained.map((entry) => entry.ruleId), [
    'cta.contact.required',
    'image.body.minimum',
  ]);
});

test('does not retire unsupported exceptions speculatively', () => {
  const value = baseline();
  value.entries['sample-post'].push({
    ruleId: 'future.contract.rule',
    signature: 'future',
    reason: 'Future rule.',
  });
  const result = retireResolvedBaselineEntries({
    baseline: value,
    repository: 'SuperDudePro/Blog-Site',
    slug: 'sample-post',
    indexSource: postSource(),
  });
  assert.deepEqual(result.retained.map((entry) => entry.ruleId), ['future.contract.rule']);
});

test('recomputes current defect signatures rather than deleting by rule name alone', () => {
  const defects = supportedPostDefects(postSource({ cta: false, bodyCount: 3 }));
  assert(defects.has('cta.contact.required\u0000/contact'));
  assert(defects.has('image.body.minimum\u0000count=3'));
});
