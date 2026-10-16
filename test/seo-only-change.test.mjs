import test from 'node:test';
import assert from 'node:assert/strict';
import { isSeoOnlyChange } from '../scripts/seo-only-change.mjs';
const base = "const post = {\n  title: 'Original',\n  excerpt: 'Original excerpt',\n  bodyHtml: `<p>Keep exact story.</p>`,\n};\n";
test('new SEO fields alone are allowed', () => {
  const next = base.replace("  bodyHtml:", "  seoTitle: \"Search title\",\n  seoDescription: \"A search description\",\n  bodyHtml:");
  assert.equal(isSeoOnlyChange(base, next), true);
  assert.equal(isSeoOnlyChange(base, next.replace('Keep exact story.', 'Changed story.')), false);
  assert.equal(isSeoOnlyChange(base, next.replace("title: 'Original'", "title: 'Changed'")), false);
});
test('malformed SEO metadata and duplicate fields fail closed', () => {
  assert.equal(isSeoOnlyChange(base, base.replace('  bodyHtml:', '  seoTitle: dynamicValue,\n  bodyHtml:')), false);
  assert.equal(isSeoOnlyChange(base, base.replace('  bodyHtml:', '  seoTitle: "One",\n  seoTitle: "Two",\n  bodyHtml:')), false);
});
