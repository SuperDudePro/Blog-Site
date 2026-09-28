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
  } finally { await browser.close(); }
} finally {
  try { process.kill(-server.pid); } catch { /* preview already exited */ }
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Accessibility and built-asset regression checks passed. Review timing trends and manual checklist in docs/quality-baseline.md.');
