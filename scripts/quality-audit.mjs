import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const routes = JSON.parse(readFileSync(join(root, 'scripts/quality-routes.json'), 'utf8'));
const baselinePath = join(root, 'scripts/quality-baseline.json');
const mode = process.argv[2] || '--check';
const output = join(root, 'quality-report.json');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const initial = [...html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="(\/assets\/[^\"]+\.(?:js|css))"/g)]
  .map(([, asset]) => asset);
assert.ok(initial.some((asset) => asset.endsWith('.js')), 'Missing initial JavaScript');
const sizes = Object.fromEntries(['js', 'css'].map((type) => [type, initial.filter((asset) => asset.endsWith(`.${type}`))
  .reduce((sum, asset) => sum + statSync(join(dist, asset)).size, 0)]));
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? files(path) : [path];
});
const images = files(dist).filter((path) => /\.(avif|gif|jpe?g|png|webp)$/i.test(path));
sizes.images = images.reduce((sum, path) => sum + statSync(path).size, 0);
sizes.largestImage = Math.max(0, ...images.map((path) => statSync(path).size));
sizes.imageCount = images.length;

if (mode === '--record') {
  writeFileSync(baselinePath, `${JSON.stringify({ recorded: new Date().toISOString().slice(0, 10), sizes }, null, 2)}\n`);
  console.log(`Recorded built-asset baseline: ${JSON.stringify(sizes)}`);
  process.exit(0);
}
assert.equal(mode, '--check', 'Use --record or --check');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).sizes;
for (const [type, allowance] of [['js', 32768], ['css', 16384], ['images', 1048576], ['largestImage', 131072]]) {
  const limit = Math.ceil(baseline[type] * 1.25 + allowance);
  assert.ok(sizes[type] <= limit, `${type}: ${sizes[type]} bytes exceeds baseline ${baseline[type]} + 25% + ${allowance} bytes`);
}

const origin = 'http://127.0.0.1:4173';
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { cwd: root, stdio: 'pipe', detached: true });
let serverError = '';
server.stderr.on('data', (part) => { serverError += part; });
const axeSource = readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const failures = [];
const report = { site: JSON.parse(readFileSync(join(root, 'package.json'))).name, sizes, routes: [] };
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview exited: ${serverError}`);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* wait for preview */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, `Preview did not start: ${serverError}`);
  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
    headless: true, args: ['--no-sandbox'],
  });
  try {
    for (const path of routes) {
      const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
      try {
        await page.addInitScript(() => {
          window.__quality = { lcp: 0, cls: 0 };
          new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__quality.lcp = entry.startTime; })
            .observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__quality.cls += entry.value; })
            .observe({ type: 'layout-shift', buffered: true });
        });
        const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
        assert.equal(response?.status(), 200, `${path}: route failed`);
        await page.locator('main').first().waitFor();
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(() => window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        }));
        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const paints = performance.getEntriesByType('paint');
          return {
            ttfbMs: Math.round(nav.responseStart),
            domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
            fcpMs: Math.round(paints.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0),
            lcpMs: Math.round(window.__quality.lcp),
            cls: Number(window.__quality.cls.toFixed(3)),
            resourceCount: performance.getEntriesByType('resource').length,
          };
        });
        const landmarks = await page.locator('main').count();
        const headings = await page.locator('h1').count();
        if (landmarks !== 1 || headings !== 1) failures.push(`${path}: expected one main and one h1 (got ${landmarks}, ${headings})`);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(300); // Let the skip-link focus animation finish.
        const keyboard = await page.evaluate(() => {
          const el = document.activeElement;
          const rect = el?.getBoundingClientRect();
          return { label: el?.textContent?.trim().slice(0, 80), visible: Boolean(rect && rect.width && rect.height && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0') };
        });
        if (!keyboard.visible) failures.push(`${path}: first keyboard target is not visible`);
        const violations = result.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => node.target) }));
        for (const violation of violations.filter((item) => ['critical', 'serious'].includes(item.impact)))
          failures.push(`${path}: ${violation.impact} ${violation.id} (${violation.nodes.length} nodes)`);
        report.routes.push({ path, metrics, keyboard, violations, incomplete: result.incomplete.map((item) => item.id) });
        console.log(`${path}: axe ${violations.length} violations, FCP ${metrics.fcpMs}ms, LCP ${metrics.lcpMs}ms, CLS ${metrics.cls}`);
      } catch (error) { failures.push(`${path}: ${error.message}`); }
      finally { await page.close(); }
    }

    // Reader journeys on a real narrow viewport: compact header, archive recovery, and category return.
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
      for (const route of ['/', '/archive', '/section/diary', '/post/the-math-isnt-good']) {
        const response = await mobile.goto(`${origin}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
        assert.equal(response?.status(), 200, `${route}: mobile page unavailable`);
        await mobile.locator('main h1').first().waitFor();
        const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
        if (overflow) failures.push(`${route}: mobile horizontal overflow`);
        const toggle = mobile.getByRole('button', { name: 'Explore site' });
        if (!await toggle.isVisible()) failures.push(`${route}: compact navigation missing`);
        else {
          if (await toggle.getAttribute('aria-expanded') !== 'false') failures.push(`${route}: compact navigation not collapsed`);
          await toggle.click();
          if (await mobile.getByRole('button', { name: 'Close menu' }).getAttribute('aria-expanded') !== 'true') failures.push(`${route}: menu not expanded`);
          if (!await mobile.locator('#ood-mobile-navigation').getByRole('link', { name: 'Categories' }).isVisible()) failures.push(`${route}: Categories absent in mobile menu`);
          await mobile.getByRole('button', { name: 'Close menu' }).click();
        }
        if (route === '/') {
          if (!await mobile.getByRole('link', { name: 'Search all posts' }).isVisible()) failures.push('Home: searchable archive not available');
          if (!await mobile.getByRole('link', { name: 'Browse by category' }).isVisible()) failures.push('Home: categories entry missing');
        }
        if (route === '/archive') {
          const search = mobile.getByRole('textbox', { name: 'Search posts' });
          await search.fill('zzzz-our-old-dad-unmatched-query');
          if (!await mobile.getByRole('status').getByText('No posts match those filters.').isVisible()) failures.push('Archive: empty-state guidance missing');
          await mobile.getByRole('button', { name: 'Clear filters and show all posts' }).click();
          if (await search.inputValue() !== '') failures.push('Archive: reset left search text');
          if (await mobile.locator('.post-card').count() === 0) failures.push('Archive: reset did not restore posts');
        }
        if (route === '/section/diary') {
          // Use a settled reading position, not a smooth-scroll-in-progress at the footer.
          await mobile.evaluate(() => window.scrollTo({ top: Math.min(1200, document.body.scrollHeight / 2), behavior: 'instant' }));
          await mobile.locator('.long-post-nav--visible').waitFor();
          const navHit = await mobile.evaluate(() => {
            const button = document.querySelector('.long-post-nav__button:not(.long-post-nav__button--top)');
            const root = document.querySelector('.long-post-nav');
            if (!button || !root) return { hit: false, rootPointer: 'missing' };
            const rect = button.getBoundingClientRect();
            const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return { hit: button === target || button.contains(target), rootPointer: getComputedStyle(root).pointerEvents, target: target?.className?.toString().slice(0, 90) };
          });
          if (!navHit.hit || navHit.rootPointer !== 'auto') failures.push(`Section: floating menu obstructed: ${JSON.stringify(navHit)}`);
          else await mobile.getByRole('button', { name: /Menu/ }).last().click({ timeout: 5000 });
          if (!await mobile.getByRole('link', { name: 'All categories' }).isVisible()) failures.push('Section: long-read return does not point to categories');
        }
        report.routes.push({ path: route, viewport: '390px mobile', readerNavigation: true });
      }
    } catch (error) { failures.push(`Mobile reader journey: ${error.message}`); }
    finally { await mobile.close(); }
  } finally { await browser.close(); }
} finally {
  try { process.kill(-server.pid); } catch { /* preview already exited */ }
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Accessibility and built-asset regression checks passed. Review timing trends and manual checklist in docs/quality-baseline.md.');
