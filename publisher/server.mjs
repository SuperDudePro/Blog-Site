import http from 'node:http';
import { mkdtemp, mkdir, cp, rm, writeFile, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import JSZip from 'jszip';

const PORT = Number(process.env.PUBLISHER_API_PORT || 4174);
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const maxBytes = 100 * 1024 * 1024;
const previews = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8' };

const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(body)); };
const collectBody = async (request) => { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > maxBytes) throw new Error('ZIP exceeds the 100 MB preview limit.'); chunks.push(chunk); } return Buffer.concat(chunks); };
const run = (command, args, cwd) => new Promise((done) => { const child = spawn(command, args, { cwd, shell: process.platform === 'win32' }); let stdout = ''; let stderr = ''; child.stdout.on('data', (chunk) => { stdout += chunk.toString(); }); child.stderr.on('data', (chunk) => { stderr += chunk.toString(); }); child.on('close', (code) => done({ code: code ?? 1, stdout, stderr })); });
const safeRelative = (path) => { const normalized = path.replaceAll('\\', '/').replace(/^\/+/, ''); if (!normalized || normalized.includes('../') || normalized.startsWith('..')) throw new Error(`Unsafe archive path: ${path}`); return normalized; };

async function buildPreview(zipBuffer) {
  const zip = await JSZip.loadAsync(zipBuffer);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const manifestEntry = entries.find((entry) => entry.name.replaceAll('\\', '/').endsWith('/source/package-manifest.json'));
  if (!manifestEntry) throw new Error('No source/package-manifest.json was found.');
  const manifest = JSON.parse(await manifestEntry.async('text'));
  if (!manifest.slug || !manifest.destinationPath || !manifest.buildCommand) throw new Error('Manifest is missing slug, destinationPath, or buildCommand.');
  if (manifest.repository !== 'SuperDudePro/Blog-Site') throw new Error(`Unsupported repository: ${manifest.repository}`);

  const root = manifestEntry.name.replaceAll('\\', '/').replace(/\/source\/package-manifest\.json$/, '');
  const prefix = `${root}/drop-in/${manifest.slug}/`;
  const productionEntries = entries.filter((entry) => entry.name.replaceAll('\\', '/').startsWith(prefix));
  if (!productionEntries.length) throw new Error(`No production files found under ${prefix}`);
  const expectedDestination = `src/content/posts/${manifest.slug}/`;
  const normalizedDestination = manifest.destinationPath.replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalizedDestination !== expectedDestination) throw new Error(`Destination must be ${expectedDestination}; received ${normalizedDestination}`);

  const workspace = await mkdtemp(join(tmpdir(), 'ood-publisher-preview-'));
  const siteRoot = join(workspace, 'site');
  try {
    await cp(repoRoot, siteRoot, { recursive: true, filter: (source) => { const relative = source.slice(repoRoot.length).split(sep).join('/'); return !relative.startsWith('/.git') && !relative.startsWith('/node_modules') && !relative.startsWith('/dist') && !relative.startsWith('/publisher'); } });
    const destinationRoot = join(siteRoot, normalizedDestination);
    await mkdir(destinationRoot, { recursive: true });
    for (const entry of productionEntries) {
      const relative = safeRelative(entry.name.replaceAll('\\', '/').slice(prefix.length));
      const target = join(destinationRoot, relative);
      if (!target.startsWith(destinationRoot + sep) && target !== destinationRoot) throw new Error(`Unsafe destination: ${relative}`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, await entry.async('nodebuffer'));
    }

    const install = await run('npm', ['ci'], siteRoot);
    if (install.code !== 0) { await rm(workspace, { recursive: true, force: true }); return { ok: false, stage: 'install', manifest, logs: `${install.stdout}\n${install.stderr}`.trim() }; }
    const build = await run('npm', ['run', 'build'], siteRoot);
    const logs = `${build.stdout}\n${build.stderr}`.trim();
    if (build.code !== 0) { await rm(workspace, { recursive: true, force: true }); return { ok: false, stage: 'build', manifest, logs }; }

    const distPath = join(siteRoot, 'dist');
    await readFile(join(distPath, 'index.html'), 'utf8');
    const id = randomUUID();
    previews.set(id, { workspace, distPath, createdAt: Date.now() });
    return { ok: true, stage: 'complete', manifest, logs, preview: { id, url: `/preview/${id}/${manifest.slug}/`, canonicalUrl: manifest.canonicalUrl } };
  } catch (error) { await rm(workspace, { recursive: true, force: true }); throw error; }
}

async function servePreview(request, response) {
  const match = request.url?.match(/^\/preview\/([^/]+)\/(.*)$/);
  if (!match) return false;
  const preview = previews.get(match[1]);
  if (!preview) { json(response, 404, { error: 'Preview expired or was not found.' }); return true; }
  const relative = safeRelative(match[2] || 'index.html');
  let target = join(preview.distPath, relative);
  if (!target.startsWith(preview.distPath + sep) && target !== preview.distPath) { json(response, 400, { error: 'Unsafe preview path.' }); return true; }
  try {
    const info = await stat(target).catch(() => null);
    if (!info || info.isDirectory()) target = join(target, 'index.html');
    const body = await readFile(target).catch(async () => readFile(join(preview.distPath, 'index.html')));
    response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(body);
  } catch { json(response, 404, { error: 'Preview file not found.' }); }
  return true;
}

setInterval(async () => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, preview] of previews) if (preview.createdAt < cutoff) { previews.delete(id); await rm(preview.workspace, { recursive: true, force: true }); }
}, 10 * 60 * 1000).unref();

const server = http.createServer(async (request, response) => {
  if (await servePreview(request, response)) return;
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, { ok: true });
  if (request.method !== 'POST' || request.url !== '/api/preview') return json(response, 404, { error: 'Not found.' });
  if (!request.headers['content-type']?.includes('application/zip')) return json(response, 415, { error: 'Expected application/zip.' });
  try { const result = await buildPreview(await collectBody(request)); json(response, result.ok ? 200 : 422, result); }
  catch (error) { json(response, 400, { ok: false, stage: 'package', error: error instanceof Error ? error.message : 'Preview failed.' }); }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Publisher preview API listening on http://127.0.0.1:${PORT}`));
