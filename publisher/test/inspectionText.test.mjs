import test from 'node:test';
import assert from 'node:assert/strict';
import { captionMatchesSource, normalizeComparableText } from '../src/inspectionText.js';

test('caption comparison treats HTML apostrophe entities as equivalent', () => {
  const source = '<figcaption>Caribou Ranch, where some of Walsh&rsquo;s early records were made and where I later lived.</figcaption>';
  const caption = "Caribou Ranch, where some of Walsh's early records were made and where I later lived.";
  assert.equal(captionMatchesSource(source, caption), true);
});

test('caption comparison preserves meaningful text differences', () => {
  const source = '<figcaption>Not bowling trophies.</figcaption>';
  assert.equal(captionMatchesSource(source, 'Bowling trophies.'), false);
});

test('normalization handles smart punctuation and whitespace', () => {
  assert.equal(normalizeComparableText('  Walsh\u2019s   records  '), "Walsh's records");
});
