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
const jobs = new Map();
const stepLabels = ['ZIP received', 'Manifest validated', 'Workspace created', 'Blog-Site copied', 'Production files injected', 'Dependencies installed', 'Site built', 'Preview generated'];
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8' };

const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); response.end(JSON.stringify(body)); };
const collectBody = async (request) => { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > maxBytes) throw new Error('ZIP exceeds the 100 MB preview limit.'); chunks.push(chunk); } return Buffer.concat(chunks); };
const run = (command, args, cwd) => new Promise((done) => { const child = spawn(command, args, { cwd, shell: process.platform === 'win32' }); let stdout = ''; let stderr = ''; child.stdout.on('data', (chunk) => { stdout += chunk.toString(); }); child.stderr.on('data', (chunk) => { stderr += chunk.toString(); }); child.on('close', (code) => done({ code: code ?? 1, stdout, stderr })); });
const safeRelative = (path) => { const normalized = path.replaceAll('\\', '/').replace(/^\/+/, ''); if (!normalized || normalized.includes('../') || normalized.startsWith('..')) throw new Error(`Unsafe archive path: ${path}`); return normalized; };
const publicJob = (job) => ({ id: job.id, status: job.status, stage: job.stage, steps: stepLabels.map((label, index) => ({ label, status: index < job.step ? 'complete' : index === job.step && job.status === 'running' ? 'active' : job.status === 'failed' && index === job.step ? 'failed' : 'pending' })), result: job.result });
const advance = (job, step, stage) => { job.step = step; job.stage = stage; job.updatedAt = Date.now(); };

function diagnose(stage, logs) {
  const text = logs || '';
  const missingImport = text.match(/Could not resolve ["']([^"']+)["']/i) || text.match(/Cannot find module ["']([^"']+)["']/i);
  if (missingImport) return { code: 'missing-file-or-import', problem: `The build cannot find ${missingImport[1]}.`, fix: 'Confirm the referenced file is included in the ZIP and that index.ts uses the exact filename, extension, capitalization, and relative path.' };
  const tsError = text.match(/error TS\d+:\s*([^\n]+)/i);
  if (tsError) return { code: 'typescript-error', problem: tsError[1].trim(), fix: 'Open the referenced production file and correct the TypeScript error before rebuilding the preview.' };
  const syntax = text.match(/(?:SyntaxError|Parse error|Unexpected token)[:\s]+([^\n]+)/i);
  if (syntax) return { code: 'syntax-error', problem: syntax[1].trim(), fix: 'Check the production index.ts near the reported line for a missing bracket, quote, comma, or malformed JSX.' };
  if (/npm ci can only install packages when your package\.json and package-lock\.json/i.test(text) || /EUSAGE/i.test(text)) return { code: 'lockfile-mismatch', problem: 'The site package.json and package-lock.json are out of sync.', fix: 'Regenerate and commit the lockfile in the Blog-Site repository, then run the preview again.' };
  if (/ENOSPC/i.test(text)) return { code: 'disk-space', problem: 'The preview workspace ran out of disk space.', fix: 'Remove old temporary files or free local disk space, then rebuild.' };
  if (/EAI_AGAIN|ENETUNREACH|ETIMEDOUT|network/i.test(text) && stage === 'install') return { code: 'network-install', problem: 'Dependencies could not be downloaded.', fix: 'Check the internet connection and npm availability, then retry the preview build.' };
  return { code: 'unknown-build-error', problem: stage === 'install' ? 'The dependency installation failed.' : 'The site build failed.', fix: 'Review the condensed build output below. The first file path or error line usually identifies the production file that needs correction.' };
}

async function buildPreview(job, zipBuffer) {
  let workspace = '';
  try {
    advance(job, 0, 'package');
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
    advance(job, 1, 'manifest');

    workspace = await mkdtemp(join(tmpdir(), 'ood-publisher-preview-'));
    const siteRoot = join(workspace, 'site');
    advance(job, 2, 'workspace');
    await cp(repoRoot, siteRoot, { recursive: true, filter: (source) => { const relative = source.slice(repoRoot.length).split(sep).join('/'); return !relative.startsWith('/.git') && !relative.startsWith('/node_modules') && !relative.startsWith('/dist') && !relative.startsWith('/publisher'); } });
    advance(job, 3, 'copy');

    const destinationRoot = join(siteRoot, normalizedDestination);
    await mkdir(destinationRoot, { recursive: true });
    for (const entry of productionEntries) {
      const relative = safeRelative(entry.name.replaceAll('\\', '/').slice(prefix.length));
      const target = join(destinationRoot, relative);
      if (!target.startsWith(destinationRoot + sep) && target !== destinationRoot) throw new Error(`Unsafe destination: ${relative}`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, await entry.async('nodebuffer'));
    }
    advance(job, 4, 'inject');

    const install = await run('npm', ['ci'], siteRoot);
    if (install.code !== 0) { const logs = `${install.stdout}\n${install.stderr}`.trim(); throw Object.assign(new Error('Dependency installation failed.'), { stage: 'install', logs, diagnosis: diagnose('install', logs) }); }
    advance(job, 5, 'install');

    const build = await run('npm', ['run', 'build'], siteRoot);
    const logs = `${build.stdout}\n${build.stderr}`.trim();
    if (build.code !== 0) throw Object.assign(new Error('Site build failed.'), { stage: 'build', logs, diagnosis: diagnose('build', logs) });
    advance(job, 6, 'build');

    const distPath = join(siteRoot, 'dist');
    await readFile(join(distPath, 'index.html'), 'utf8');
    const previewId = randomUUID();
    previews.set(previewId, { workspace, distPath, createdAt: Date.now() });
    workspace = '';
    advance(job, 8, 'complete');
    job.status = 'complete';
    job.result = { ok: true, stage: 'complete', manifest, logs, preview: { id: previewId, url: `/preview/${previewId}/${manifest.slug}/`, canonicalUrl: manifest.canonicalUrl } };
  } catch (error) {
    if (workspace) await rm(workspace, { recursive: true, force: true });
    job.status = 'failed';
    job.stage = error.stage || job.stage || 'package';
    job.result = { ok: false, stage: job.stage, error: error instanceof Error ? error.message : 'Preview failed.', logs: error.logs, diagnosis: error.diagnosis || { code: 'package-error', problem: error instanceof Error ? error.message : 'The package could not be prepared.', fix: 'Correct the package structure or manifest, then upload the ZIP again.' } };
  }
  job.updatedAt = Date.now();
}

async function servePreview(request, response) {
  const match = request.url?.match(/^\/preview\/([^/]+)\/(.*)$/);
  if (!match) return false;
  const preview = previews.get(match[1]);
  if (!preview) { json(response, 404, { error: 'Preview expired or was not found.' }); return true; }
  const relative = safeRelative(match[2] || 'index.html');
  let target = join(preview.distPath, relative);
  if (!target.startsWith(preview.distPath + sep) && target !== preview.distPath) { json(response, 400, { error: 'Unsafe preview path.' }); return true; }
  try { const info = await stat(target).catch(() => null); if (!info || info.isDirectory()) target = join(target, 'index.html'); const body = await readFile(target).catch(async () => readFile(join(preview.distPath, 'index.html'))); response.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' }); response.end(body); }
  catch { json(response, 404, { error: 'Preview file not found.' }); }
  return true;
}

setInterval(async () => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, preview] of previews) if (preview.createdAt < cutoff) { previews.delete(id); await rm(preview.workspace, { recursive: true, force: true }); }
  for (const [id, job] of jobs) if (job.updatedAt < cutoff) jobs.delete(id);
}, 10 * 60 * 1000).unref();

const server = http.createServer(async (request, response) => {
  if (await servePreview(request, response)) return;
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, { ok: true });
  const jobMatch = request.method === 'GET' && request.url?.match(/^\/api\/preview\/([^/]+)$/);
  if (jobMatch) { const job = jobs.get(jobMatch[1]); return job ? json(response, 200, publicJob(job)) : json(response, 404, { error: 'Preview job not found.' }); }
  if (request.method !== 'POST' || request.url !== '/api/preview') return json(response, 404, { error: 'Not found.' });
  if (!request.headers['content-type']?.includes('application/zip')) return json(response, 415, { error: 'Expected application/zip.' });
  try {
    const id = randomUUID();
    const job = { id, status: 'running', stage: 'queued', step: 0, result: null, updatedAt: Date.now() };
    jobs.set(id, job);
    const body = await collectBody(request);
    json(response, 202, publicJob(job));
    void buildPreview(job, body);
  } catch (error) { json(response, 400, { ok: false, stage: 'package', error: error instanceof Error ? error.message : 'Preview failed.' }); }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Publisher preview API listening on http://127.0.0.1:${PORT}`));
