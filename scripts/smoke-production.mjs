import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('./smoke-production.json', import.meta.url), 'utf8'));
const origin = config.origin;
const expectedCommit = process.env.DEPLOY_SHA || process.env.GITHUB_SHA;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (path) => path.replace(/\/+$/, '') || '/';
const absolute = (path) => `${origin}${path === '/' ? '/' : path}`;
const decode = (value) => value.replaceAll('&amp;', '&');

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(([, key, , value]) => [key.toLowerCase(), decode(value)]));
}

function metadata(html, path) {
  const head = html.split(/<\/head>/i)[0];
  const tags = [...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const one = (key, value, field) => {
    const found = tags.filter((tag) => tag[key]?.toLowerCase() === value);
    assert.equal(found.length, 1, `${path}: expected one ${value}`);
    assert.ok(found[0][field]?.trim(), `${path}: empty ${value}`);
    return found[0][field];
  };
  assert.match(head, /<title>\s*[^<\s][\s\S]*?<\/title>/i, `${path}: missing title`);
  one('name', 'description', 'content');
  assert.equal(one('rel', 'canonical', 'href'), absolute(path), `${path}: wrong canonical`);
  assert.equal(one('property', 'og:url', 'content'), absolute(path), `${path}: wrong og:url`);
  assert.ok(!tags.some((tag) => tag.name === 'robots' && /\bnoindex\b/i.test(tag.content || '')), `${path}: noindex`);
  const jsonld = [...head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(jsonld.length, 1, `${path}: expected one JSON-LD script`);
  const graph = JSON.parse(jsonld[0][1])['@graph'];
  assert.ok(Array.isArray(graph), `${path}: missing JSON-LD graph`);
  const article = /^\/(post|posts)\//.test(path);
  const types = path === '/' ? ['WebSite'] : article ? ['Article', 'BlogPosting'] : ['WebPage'];
  assert.ok(graph.some((node) => types.includes(node['@type']) && node.url === absolute(path)), `${path}: wrong JSON-LD URL`);
  if (article) assert.ok(graph.some((node) => types.includes(node['@type']) && node.mainEntityOfPage === absolute(path)), `${path}: wrong article page`);
  return head;
}

async function get(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(15000),
        ...options,
      });
      if (response.status < 500 || attempt === 3) return response;
      lastError = new Error(`${url}: HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    if (attempt < 3) await sleep(2000);
  }
  throw lastError;
}

async function waitForDeployment() {
  assert.match(expectedCommit || '', /^[0-9a-f]{40}$/i, 'DEPLOY_SHA must be a full commit SHA');
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      const response = await get(`${origin}/deployment.json?t=${Date.now()}`);
      if (response.ok && (await response.json()).commit === expectedCommit) {
        console.log(`Production is running ${expectedCommit}.`);
        return;
      }
    } catch (error) { console.log(`Deployment check ${attempt}: ${error.message}`); }
    if (attempt < 30) await sleep(10000);
  }
  throw new Error(`Production did not reach ${expectedCommit} within five minutes`);
}

await waitForDeployment();

const robotsResponse = await get(`${origin}/robots.txt`);
assert.equal(robotsResponse.status, 200, 'robots.txt must be available');
assert.ok((await robotsResponse.text()).split(/\r?\n/).some((line) => line.trim() === `Sitemap: ${origin}/sitemap.xml`), 'robots.txt must name the canonical sitemap');
const sitemapResponse = await get(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, 'sitemap.xml must be available');
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => new URL(decode(match[1].trim())));
assert.ok(urls.length >= config.minimumSitemapUrls, `sitemap has only ${urls.length} URLs`);
assert.ok(urls.every((url) => url.origin === origin && !url.search && !url.hash), 'sitemap contains a noncanonical URL');
const paths = new Set(urls.map((url) => normalize(url.pathname)));
for (const path of config.routes) assert.ok(paths.has(path), `${path}: absent from sitemap`);
if (config.articlePrefix) {
  const articlePath = [...paths].find((path) => path.startsWith(config.articlePrefix));
  assert.ok(articlePath, `no ${config.articlePrefix} article in sitemap`);
  config.routes.push(articlePath);
}

let homeHead;
for (const path of config.routes) {
  const response = await get(absolute(path));
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  assert.match(response.headers.get('content-type') || '', /text\/html/i, `${path}: not HTML`);
  const head = metadata(await response.text(), path);
  if (path === '/') homeHead = head;
  console.log(`Checked ${absolute(path)}`);
}

// A missing client bundle can leave metadata intact but break every interactive page.
const moduleTag = [...homeHead.matchAll(/<script\b[^>]*type=["']module["'][^>]*>/gi)].map(([tag]) => attributes(tag)).find((tag) => tag.src?.startsWith('/assets/'));
assert.ok(moduleTag, 'home page has no client module');
const asset = await get(`${origin}${moduleTag.src}`);
assert.equal(asset.status, 200, `client module returned HTTP ${asset.status}`);
assert.ok((await asset.text()).length > 100, 'client module is empty');

const alternate = await get(`${config.alternateOrigin}${config.alternatePath}`);
if (config.alternateMustRedirect) {
  assert.ok([301, 308].includes(alternate.status), `alternate host returned ${alternate.status}, expected permanent redirect`);
  assert.equal(new URL(alternate.headers.get('location'), config.alternateOrigin).href, absolute(config.alternatePath), 'alternate host redirects to wrong URL');
} else if ([301, 308].includes(alternate.status)) {
  assert.equal(new URL(alternate.headers.get('location'), config.alternateOrigin).href, absolute(config.alternatePath), 'alternate host redirects to wrong URL');
} else {
  assert.equal(alternate.status, 200, `alternate host returned ${alternate.status}`);
  metadata(await alternate.text(), config.alternatePath);
  console.log('Alternate host serves HTML with the canonical URL (no host redirect).');
}

if (process.env.SMOKE_BROWSER === '1') {
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    if (config.browser === 'ask') {
      await page.goto(`${origin}/ask`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'What is the 18-year-old Floor?' }).click();
      assert.match(await page.locator('#ask-question').inputValue(), /18-year-old Floor/);
      assert.ok(await page.getByRole('button', { name: 'Ask', exact: true }).isEnabled());
    } else if (config.browser === 'posters') {
      await page.goto(`${origin}/classroom-posters`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.poster-all-card')?.getAttribute('href') === '/classroom-posters/all');
      await page.locator('.poster-all-card').click();
      await page.waitForURL(`${origin}/classroom-posters/all`);
      assert.ok(await page.locator('main img').count() > 0, 'poster gallery rendered no images');
      await page.locator('main img').first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector('main img');
        return image?.complete && image.naturalWidth > 0;
      });
    } else if (config.browser === 'archive') {
      await page.goto(`${origin}/archive`, { waitUntil: 'domcontentloaded' });
      const search = page.getByRole('textbox', { name: 'Search posts' });
      await search.fill('zzzz-smoke-no-matches');
      assert.match(await page.locator('#archive-results-title').innerText(), /^0 matching posts$/);
      await search.fill('');
      assert.doesNotMatch(await page.locator('#archive-results-title').innerText(), /^0 matching posts$/);
    } else throw new Error(`Unknown browser scenario: ${config.browser}`);
    console.log(`Browser interaction passed: ${config.browser}.`);
  } finally { await browser.close(); }
}

console.log(`Production smoke passed for ${origin}: ${config.routes.length} routes, sitemap, metadata, client asset, canonical host${process.env.SMOKE_BROWSER === '1' ? `, and ${config.browser} interaction` : ''}.`);
