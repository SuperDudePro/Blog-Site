import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY || '';
const expectedCommit = process.env.DEPLOY_SHA || process.env.GITHUB_SHA || '';
const beforeCommit = process.env.BEFORE_SHA || '';
const eventName = process.env.EVENT_NAME || process.env.GITHUB_EVENT_NAME || '';

if (!siteUrl) throw new Error('SITE_URL is required.');
if (!key) throw new Error('INDEXNOW_KEY is required.');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const addUrl = (set, pathname) => set.add(`${siteUrl}${pathname === '/' ? '/' : pathname}`);

async function waitForDeployment() {
  if (!expectedCommit) return;

  const markerUrl = `${siteUrl}/deployment.json`;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${markerUrl}?t=${Date.now()}`, {
        headers: { 'cache-control': 'no-cache' },
      });
      if (response.ok) {
        const marker = await response.json();
        if (marker.commit === expectedCommit) {
          console.log(`Confirmed production deployment ${expectedCommit}.`);
          return;
        }
      }
    } catch (error) {
      console.log(`Deployment check ${attempt} failed: ${error.message}`);
    }

    console.log(`Waiting for production deployment (${attempt}/30)...`);
    await sleep(10000);
  }

  throw new Error(`Production did not reach commit ${expectedCommit} within five minutes.`);
}

function parseSitemap(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1].trim());
}

async function fetchSitemapUrls() {
  const response = await fetch(`${siteUrl}/sitemap.xml?t=${Date.now()}`, {
    headers: { 'cache-control': 'no-cache' },
  });
  if (!response.ok) throw new Error(`Could not fetch sitemap: HTTP ${response.status}`);
  const urls = parseSitemap(await response.text());
  if (!urls.length) throw new Error('The sitemap contained no URLs.');
  return urls;
}

function changedFiles() {
  if (!beforeCommit || !expectedCommit || /^0+$/.test(beforeCommit)) return [];
  return execFileSync('git', ['diff', '--name-only', beforeCommit, expectedCommit], { encoding: 'utf8' })
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean);
}

function readPostSource(slug) {
  const currentPath = `src/content/posts/${slug}/index.ts`;
  if (fs.existsSync(currentPath)) return fs.readFileSync(currentPath, 'utf8');
  try {
    return execFileSync('git', ['show', `${beforeCommit}:${currentPath}`], { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function urlsForPush(files) {
  const urls = new Set();
  let fullSite = false;

  for (const file of files) {
    const postMatch = file.match(/^src\/content\/posts\/([^/]+)\//);
    if (postMatch) {
      const slug = postMatch[1];
      addUrl(urls, `/post/${slug}`);
      addUrl(urls, '/');
      addUrl(urls, '/archive');
      addUrl(urls, '/categories');
      addUrl(urls, '/section/everything');

      const section = readPostSource(slug).match(/section:\s*['"]([^'"]+)['"]/)?.[1];
      if (section) addUrl(urls, `/section/${section}`);
      continue;
    }

    if (file === 'src/pages/AboutPage.tsx') addUrl(urls, '/about');
    else if (file === 'src/pages/ContactPage.tsx') addUrl(urls, '/contact');
    else if (file === 'src/pages/ArchivePage.tsx') addUrl(urls, '/archive');
    else if (file === 'src/pages/CategoriesPage.tsx') addUrl(urls, '/categories');
    else if (file.startsWith('src/') || file === 'index.html' || file === 'vercel.json' || file === 'redirects.json') fullSite = true;
  }

  return { urls: [...urls], fullSite };
}

await waitForDeployment();

let urlList;
if (eventName === 'workflow_dispatch') {
  urlList = await fetchSitemapUrls();
  console.log('Manual run requested: submitting the full sitemap.');
} else {
  const files = changedFiles();
  const selection = urlsForPush(files);
  if (selection.fullSite) {
    urlList = await fetchSitemapUrls();
    console.log('Global public-site files changed: submitting the full sitemap.');
  } else {
    urlList = selection.urls;
    console.log(`Changed files considered: ${files.length}.`);
  }
}

if (!urlList.length) {
  console.log('No public URLs were affected; skipping IndexNow submission.');
  process.exit(0);
}
if (urlList.length > 10000) throw new Error('IndexNow accepts at most 10,000 URLs per request.');

const endpoint = 'https://api.indexnow.org/indexnow';
const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList,
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow rejected the submission: HTTP ${response.status} ${body}`);
}

console.log(`Submitted ${urlList.length} URL${urlList.length === 1 ? '' : 's'} to IndexNow: ${urlList.join(', ')}`);
