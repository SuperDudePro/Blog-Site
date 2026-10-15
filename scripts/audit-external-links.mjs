import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parsePostSource } from './post-parser.mjs';

const root = resolve('src/content/posts');
const references = new Map();
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
for (const slug of readdirSync(root)) {
  let source;
  try { source = readFileSync(join(root, slug, 'index.ts'), 'utf8'); } catch { continue; }
  const parsed = parsePostSource(source, join(root, slug, 'index.ts'));
  if (parsed.errors.length) throw new Error(slug + ': ' + parsed.errors.join('; '));
  const text = parsed.bodyHtml;
  for (const [, raw] of text.matchAll(/<(?:a|iframe)\b[^>]*\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const value = decode(raw);
    if (!/^https?:\/\//i.test(value)) continue;
    let target;
    try { target = new URL(value); } catch { continue; }
    if (['ourolddad.com', 'www.ourolddad.com'].includes(target.hostname)) continue;
    const normalized = target.href;
    if (!references.has(normalized)) references.set(normalized, []);
    references.get(normalized).push(slug);
  }
}

async function check(url, slugs) {
  const timeLimit = 9000;
  const fetchOnce = async method => {
    const response = await fetch(url, { method, redirect: 'follow',
      headers: { 'user-agent': 'OurOldDad-LinkAudit/1.0 (+https://ourolddad.com)', accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(timeLimit) });
    await response.body?.cancel().catch(() => {});
    return { status: response.status, finalUrl: response.url };
  };
  try {
    let response = await fetchOnce('HEAD');
    if ([400, 403, 405, 410, 429, 501].includes(response.status) || response.status >= 500) {
      response = await fetchOnce('GET');
    }
    const classification = [404, 410].includes(response.status) ? 'broken-candidate'
      : response.status >= 200 && response.status < 400 ? 'reachable'
      : 'unverified';
    return { url, posts: slugs, ...response, classification };
  } catch (error) {
    return { url, posts: slugs, classification: 'unverified', error: error.message };
  }
}

const entries = [...references];
const results = [];
const concurrency = 6;
let index = 0;
await Promise.all(Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
  while (index < entries.length) {
    const current = entries[index++];
    results.push(await check(current[0], current[1]));
  }
}));
results.sort((a, b) => a.url.localeCompare(b.url));
const counts = Object.fromEntries(['reachable', 'broken-candidate', 'unverified'].map(type =>
  [type, results.filter(result => result.classification === type).length]));
const report = { checkedAt: new Date().toISOString(), totalUrls: results.length, counts, results };
writeFileSync('external-link-report.json', JSON.stringify(report, null, 2) + '\n');
console.log('External body links:', results.length, counts);
for (const r of results.filter(r => r.classification !== 'reachable')) {
  console.log(r.classification, r.status || r.error, r.url, 'in', r.posts.join(','));
}
// Observational audit: do not fail builds for third-party blocks or transient failures.
