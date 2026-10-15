import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const routes = [...sitemap.matchAll(/<loc>https:\/\/ourolddad\.com(\/[^<]*)<\/loc>/g)].map(([, path]) => path);
assert.ok(routes.length >= 50, 'Unexpectedly short sitemap');
const origin = 'http://127.0.0.1:4175';
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'ignore', detached: true });
const results = [], errors = [];
try {
  let ready = false;
  for (let n = 0; n < 80; n++) {
    try { ready = (await fetch(origin)).ok; if (ready) break; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  assert.ok(ready, 'Preview did not start');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
  try {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      try {
        const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
        assert.equal(response?.status(), 200, route + ' HTTP');
        await page.locator('main h1').first().waitFor({ timeout: 16000 });
        if (route.startsWith('/post/')) await page.locator('.post-article[aria-busy]').waitFor({ state: 'detached', timeout: 16000 }).catch(() => {});
        const info = await page.evaluate(() => ({
          h1: document.querySelectorAll('main h1').length,
          main: document.querySelectorAll('main').length,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 4,
          heading: document.querySelector('main h1')?.textContent?.trim(),
          postImageCount: document.querySelectorAll('article.post-article img').length,
          images: [...document.querySelectorAll('article.post-article img')].map(el => ({ src: el.getAttribute('src'), alt: el.getAttribute('alt') })),
          invalidInternalLinks: [...document.querySelectorAll('a[href]')].filter(a => a.getAttribute('href')?.startsWith('/post/')).filter(a => !a.pathname || a.pathname === '/post/').length
        }));
        assert.equal(info.h1, 1, route + ' H1 count');
        assert.equal(info.main, 1, route + ' main count');
        assert.ok(!info.overflow, route + ' horizontal mobile overflow');
        if (route.startsWith('/post/')) {
          assert.ok(info.postImageCount >= 1, route + ' missing body images');
          assert.ok(info.images.every(i => i.src && i.alt !== null), route + ' image src/alt missing');
          // Force lazy inline images to load and verify decoded bytes, not just DOM tags.
          const decoded = await page.locator('article.post-article img').evaluateAll(async (images) =>
            Promise.all(images.map(async (img) => {
              img.loading = 'eager';
              const timeout = new Promise(resolve => setTimeout(() => resolve(false), 12000));
              const loaded = img.decode().then(() => true).catch(() => false);
              return { src: img.getAttribute('src'), ok: await Promise.race([loaded, timeout]) && img.naturalWidth > 0 };
            }))
          );
          const broken = decoded.filter(image => !image.ok);
          assert.deepEqual(broken, [], route + ' broken decoded body images');
        }
        assert.equal(info.invalidInternalLinks, 0, route + ' invalid post links');
        results.push({ route, status: 'pass', ...info });
      } catch (error) {
        errors.push({ route, message: error.message });
        results.push({ route, status: 'fail', message: error.message });
      } finally { await page.close(); }
    }
    // Exercise native form constraints without clicking submit or calling any API.
    const formPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      await formPage.goto(origin + '/contact', { waitUntil: 'domcontentloaded' });
      await formPage.locator('form input[name="email"]').first().waitFor();
      const contact = formPage.locator('main form').first();
      assert.equal(await contact.evaluate(form => form.checkValidity()), false, 'empty contact form should be invalid');
      await contact.locator('[name="name"]').fill('Audit');
      await contact.locator('[name="email"]').fill('not-an-email');
      await contact.locator('[name="message"]').fill('Validation only; do not send');
      assert.equal(await contact.evaluate(form => form.checkValidity()), false, 'invalid contact email accepted');
      await contact.locator('[name="email"]').fill('audit@example.com');
      assert.equal(await contact.evaluate(form => form.checkValidity()), true, 'valid contact inputs rejected');
      const subscription = formPage.locator('footer form').first();
      assert.equal(await subscription.evaluate(form => form.checkValidity()), false, 'empty subscription accepted');
      await subscription.locator('input[name="email"]').fill('bad-email');
      assert.equal(await subscription.evaluate(form => form.checkValidity()), false, 'malformed subscription email accepted');
      await subscription.locator('input[name="email"]').fill('audit@example.com');
      assert.equal(await subscription.evaluate(form => form.checkValidity()), true, 'valid subscription email rejected');
      results.push({ route: '/contact#validation-only', status: 'pass', submitted: false });
    } catch (error) {
      errors.push({ route: '/contact#validation-only', message: error.message });
    } finally { await formPage.close(); }
  } finally { await browser.close(); }
} finally {
  try { process.kill(-server.pid); } catch {}
  writeFileSync('route-browser-report.json', JSON.stringify({ total: routes.length, failed: errors.length, errors, results }, null, 2) + '\n');
}
console.log('Browser audit:', routes.length, 'routes,', errors.length, 'failures');
if (errors.length) { console.error(errors.map(x => x.route + ': ' + x.message).join('\n')); process.exitCode = 1; }
