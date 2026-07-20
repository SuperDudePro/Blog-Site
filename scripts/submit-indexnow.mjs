const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY || '';
const expectedCommit = process.env.DEPLOY_SHA || process.env.GITHUB_SHA || '';

if (!siteUrl) throw new Error('SITE_URL is required.');
if (!key) throw new Error('INDEXNOW_KEY is required.');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

await waitForDeployment();

const sitemapResponse = await fetch(`${siteUrl}/sitemap.xml?t=${Date.now()}`, {
  headers: { 'cache-control': 'no-cache' },
});
if (!sitemapResponse.ok) {
  throw new Error(`Could not fetch sitemap: HTTP ${sitemapResponse.status}`);
}

const urlList = parseSitemap(await sitemapResponse.text());
if (!urlList.length) throw new Error('The sitemap contained no URLs.');
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

console.log(`Submitted ${urlList.length} URLs to IndexNow. HTTP ${response.status}.`);
