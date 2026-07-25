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
const previewSteps = ['ZIP received', 'Manifest validated', 'Workspace created', 'Blog-Site copied', 'Production files injected', 'Dependencies installed', 'Site built', 'Preview generated'];
const publishSteps = ['Approval confirmed', 'Repository cloned', 'Publish branch created', 'Production files staged', 'Commit created', 'Branch pushed', 'Draft PR opened', 'GitHub checks passed', 'Vercel preview discovered', 'Published page smoke tested'];
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8' };

const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); response.end(JSON.stringify(body)); };
const collectBody = async (request) => { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > maxBytes) throw new Error('Request exceeds the 100 MB limit.'); chunks.push(chunk); } return Buffer.concat(chunks); };
const collectJson = async (request) => JSON.parse((await collectBody(request)).toString('utf8') || '{}');
const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));
const run = (command, args, cwd) => new Promise((done) => { const child = spawn(command, args, { cwd, shell: process.platform === 'win32' }); let stdout = ''; let stderr = ''; child.stdout.on('data', (chunk) => { stdout += chunk.toString(); }); child.stderr.on('data', (chunk) => { stderr += chunk.toString(); }); child.on('close', (code) => done({ code: code ?? 1, stdout, stderr })); });
const runOrThrow = async (command, args, cwd, stage) => { const result = await run(command, args, cwd); if (result.code !== 0) throw Object.assign(new Error(`${command} ${args[0] ?? ''} failed.`), { stage, logs: `${result.stdout}\n${result.stderr}`.trim() }); return result.stdout.trim(); };
const safeRelative = (path) => { const normalized = path.replaceAll('\\', '/').replace(/^\/+/, ''); if (!normalized || normalized.includes('../') || normalized.startsWith('..')) throw new Error(`Unsafe archive path: ${path}`); return normalized; };
const publicJob = (job) => ({ id: job.id, kind: job.kind, status: job.status, stage: job.stage, steps: job.labels.map((label, index) => ({ label, status: index < job.step ? 'complete' : index === job.step && job.status === 'running' ? 'active' : job.status === 'failed' && index === job.step ? 'failed' : 'pending' })), result: job.result });
const advance = (job, step, stage) => { job.step = step; job.stage = stage; job.updatedAt = Date.now(); };
const createJob = (kind, labels) => { const id = randomUUID(); const job = { id, kind, labels, status: 'running', stage: 'queued', step: 0, result: null, updatedAt: Date.now() }; jobs.set(id, job); return job; };

function diagnose(stage, logs) {
  const text = logs || '';
  const missingImport = text.match(/Could not resolve ["']([^"']+)["']/i) || text.match(/Cannot find module ["']([^"']+)["']/i);
  if (missingImport) return { code: 'missing-file-or-import', problem: `The build cannot find ${missingImport[1]}.`, fix: 'Confirm the referenced file is included in the ZIP and that index.ts uses the exact filename, extension, capitalization, and relative path.' };
  const tsError = text.match(/error TS\d+:\s*([^\n]+)/i);
  if (tsError) return { code: 'typescript-error', problem: tsError[1].trim(), fix: 'Open the referenced production file and correct the TypeScript error before rebuilding the preview.' };
  if (/npm ci can only install packages|EUSAGE/i.test(text)) return { code: 'lockfile-mismatch', problem: 'The site package.json and package-lock.json are out of sync.', fix: 'Regenerate and commit the lockfile, then run the preview again.' };
  if (/not logged into any github hosts|authentication failed|could not read username/i.test(text)) return { code: 'github-auth', problem: 'GitHub authentication is not available to the publisher.', fix: 'Run gh auth login and confirm git push works for SuperDudePro/Blog-Site.' };
  if (stage === 'checks') return { code: 'checks-failed', problem: 'One or more pull-request checks failed.', fix: 'Open the draft pull request, inspect the failing check, correct the package or site code, and run the publisher again.' };
  if (stage === 'deployment') return { code: 'deployment-not-found', problem: 'The publisher could not discover a Vercel preview URL.', fix: 'Confirm the Vercel GitHub integration posts a preview URL or deployment check on the pull request.' };
  if (stage === 'smoke-test') return { code: 'smoke-test-failed', problem: 'The deployed post did not pass the HTTP smoke test.', fix: 'Open the Vercel preview and verify the post route, redirect behavior, and deployment output.' };
  if (/EAI_AGAIN|ENETUNREACH|ETIMEDOUT|network/i.test(text)) return { code: 'network', problem: 'The operation could not reach npm, GitHub, or Vercel.', fix: 'Check the internet connection and retry.' };
  return { code: `${stage || 'unknown'}-error`, problem: stage === 'install' ? 'The dependency installation failed.' : stage === 'build' ? 'The site build failed.' : 'The publishing operation failed.', fix: 'Review the condensed output below. The final error line usually identifies the required correction.' };
}

async function readPackage(zipBuffer) {
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
  return { manifest, prefix, productionEntries, normalizedDestination };
}

async function injectProduction(packageData, siteRoot) {
  const destinationRoot = join(siteRoot, packageData.normalizedDestination);
  await mkdir(destinationRoot, { recursive: true });
  for (const entry of packageData.productionEntries) {
    const relative = safeRelative(entry.name.replaceAll('\\', '/').slice(packageData.prefix.length));
    const target = join(destinationRoot, relative);
    if (!target.startsWith(destinationRoot + sep) && target !== destinationRoot) throw new Error(`Unsafe destination: ${relative}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await entry.async('nodebuffer'));
  }
}

async function buildPreview(job, zipBuffer) {
  let workspace = '';
  try {
    advance(job, 0, 'package');
    const packageData = await readPackage(zipBuffer);
    advance(job, 1, 'manifest');
    workspace = await mkdtemp(join(tmpdir(), 'ood-publisher-preview-'));
    const siteRoot = join(workspace, 'site');
    advance(job, 2, 'workspace');
    await cp(repoRoot, siteRoot, { recursive: true, filter: (source) => { const relative = source.slice(repoRoot.length).split(sep).join('/'); return !relative.startsWith('/.git') && !relative.startsWith('/node_modules') && !relative.startsWith('/dist') && !relative.startsWith('/publisher'); } });
    advance(job, 3, 'copy');
    await injectProduction(packageData, siteRoot);
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
    previews.set(previewId, { workspace, distPath, zipBuffer, manifest: packageData.manifest, createdAt: Date.now(), published: false });
    workspace = '';
    advance(job, previewSteps.length, 'complete');
    job.status = 'complete';
    job.result = { ok: true, stage: 'complete', manifest: packageData.manifest, logs, preview: { id: previewId, url: `/preview/${previewId}/${packageData.manifest.slug}/`, canonicalUrl: packageData.manifest.canonicalUrl } };
  } catch (error) {
    if (workspace) await rm(workspace, { recursive: true, force: true });
    job.status = 'failed'; job.stage = error.stage || job.stage || 'package';
    job.result = { ok: false, stage: job.stage, error: error instanceof Error ? error.message : 'Preview failed.', logs: error.logs, diagnosis: error.diagnosis || diagnose(job.stage, error.logs) };
  }
  job.updatedAt = Date.now();
}

async function discoverVercelUrl(repository, prUrl, cwd) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const comments = await run('gh', ['pr', 'view', prUrl, '--repo', repository, '--json', 'comments', '--jq', '.comments[].body'], cwd);
    const match = comments.stdout.match(/https:\/\/[a-z0-9.-]+\.vercel\.app(?:\/[a-zA-Z0-9_./?=&%-]*)?/i);
    if (match) return match[0].replace(/[)>.,]+$/, '');
    await pause(5000);
  }
  throw Object.assign(new Error('Timed out waiting for a Vercel preview URL.'), { stage: 'deployment', logs: 'No vercel.app URL appeared in pull-request comments.' });
}

async function smokeTest(deploymentUrl, manifest) {
  const canonicalPath = (() => { try { return new URL(manifest.canonicalUrl).pathname; } catch { return `/${manifest.slug}/`; } })();
  const smokeUrl = new URL(canonicalPath, deploymentUrl).toString();
  const response = await fetch(smokeUrl, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  if (!response.ok || !body.toLowerCase().includes('<html')) throw Object.assign(new Error(`Smoke test returned HTTP ${response.status}.`), { stage: 'smoke-test', logs: `${smokeUrl}\nHTTP ${response.status}` });
  return { smokeUrl, status: response.status };
}

async function publishPreview(job, preview) {
  let workspace = '';
  try {
    advance(job, 0, 'approval');
    await runOrThrow('gh', ['auth', 'status'], repoRoot, 'auth');
    workspace = await mkdtemp(join(tmpdir(), 'ood-publisher-publish-'));
    const siteRoot = join(workspace, 'site');
    await runOrThrow('git', ['clone', '--no-hardlinks', repoRoot, siteRoot], workspace, 'clone');
    advance(job, 1, 'clone');
    const defaultBranch = (await runOrThrow('gh', ['repo', 'view', preview.manifest.repository, '--json', 'defaultBranchRef', '--jq', '.defaultBranchRef.name'], siteRoot, 'repository')) || 'main';
    await runOrThrow('git', ['checkout', defaultBranch], siteRoot, 'branch');
    await runOrThrow('git', ['pull', '--ff-only', 'origin', defaultBranch], siteRoot, 'branch');
    const branch = `agent/publish-${preview.manifest.slug}-${Date.now()}`;
    await runOrThrow('git', ['checkout', '-b', branch], siteRoot, 'branch');
    advance(job, 2, 'branch');
    const packageData = await readPackage(preview.zipBuffer);
    await injectProduction(packageData, siteRoot);
    await runOrThrow('git', ['add', '--', packageData.normalizedDestination], siteRoot, 'stage');
    const status = await runOrThrow('git', ['status', '--short'], siteRoot, 'stage');
    if (!status) throw Object.assign(new Error('The approved package produced no repository changes.'), { stage: 'stage', logs: 'git status --short returned no changes.' });
    advance(job, 3, 'stage');
    const commitMessage = `Publish ${preview.manifest.title}`;
    await runOrThrow('git', ['commit', '-m', commitMessage], siteRoot, 'commit');
    const commit = await runOrThrow('git', ['rev-parse', 'HEAD'], siteRoot, 'commit');
    advance(job, 4, 'commit');
    await runOrThrow('git', ['push', '-u', 'origin', branch], siteRoot, 'push');
    advance(job, 5, 'push');
    const bodyPath = join(workspace, 'pr-body.md');
    await writeFile(bodyPath, `## What changed\n\nPublishes **${preview.manifest.title}** from the approved Wilbert Publisher package.\n\n- Slug: \`${preview.manifest.slug}\`\n- Destination: \`${preview.manifest.destinationPath}\`\n- Canonical URL: ${preview.manifest.canonicalUrl || 'Not supplied'}\n\n## Validation\n\n- Package contract passed\n- Production site build passed in an isolated preview workspace\n- Publisher approval was explicitly confirmed\n`);
    const prUrl = (await runOrThrow('gh', ['pr', 'create', '--draft', '--repo', preview.manifest.repository, '--base', defaultBranch, '--head', branch, '--title', commitMessage, '--body-file', bodyPath], siteRoot, 'pr')).trim();
    advance(job, 6, 'checks');
    await runOrThrow('gh', ['pr', 'checks', prUrl, '--repo', preview.manifest.repository, '--watch', '--interval', '5'], siteRoot, 'checks');
    advance(job, 7, 'deployment');
    const deploymentUrl = await discoverVercelUrl(preview.manifest.repository, prUrl, siteRoot);
    advance(job, 8, 'smoke-test');
    const smoke = await smokeTest(deploymentUrl, preview.manifest);
    advance(job, publishSteps.length, 'complete');
    preview.published = true;
    job.status = 'complete';
    job.result = { ok: true, stage: 'complete', branch, commit, prUrl, repository: preview.manifest.repository, deploymentUrl, smokeUrl: smoke.smokeUrl, smokeStatus: smoke.status };
  } catch (error) {
    job.status = 'failed'; job.stage = error.stage || job.stage || 'publish';
    job.result = { ok: false, stage: job.stage, error: error instanceof Error ? error.message : 'Publish failed.', logs: error.logs, diagnosis: error.diagnosis || diagnose(job.stage, error.logs) };
  } finally {
    if (workspace) await rm(workspace, { recursive: true, force: true });
    job.updatedAt = Date.now();
  }
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
  const jobMatch = request.method === 'GET' && request.url?.match(/^\/api\/jobs\/([^/]+)$/);
  if (jobMatch) { const job = jobs.get(jobMatch[1]); return job ? json(response, 200, publicJob(job)) : json(response, 404, { error: 'Job not found.' }); }
  const legacyPreviewJobMatch = request.method === 'GET' && request.url?.match(/^\/api\/preview\/([^/]+)$/);
  if (legacyPreviewJobMatch) { const job = jobs.get(legacyPreviewJobMatch[1]); return job ? json(response, 200, publicJob(job)) : json(response, 404, { error: 'Preview job not found.' }); }
  if (request.method === 'POST' && request.url === '/api/preview') {
    if (!request.headers['content-type']?.includes('application/zip')) return json(response, 415, { error: 'Expected application/zip.' });
    try { const job = createJob('preview', previewSteps); const body = await collectBody(request); json(response, 202, publicJob(job)); void buildPreview(job, body); }
    catch (error) { return json(response, 400, { ok: false, stage: 'package', error: error instanceof Error ? error.message : 'Preview failed.' }); }
    return;
  }
  const publishMatch = request.method === 'POST' && request.url?.match(/^\/api\/publish\/([^/]+)$/);
  if (publishMatch) {
    try {
      const preview = previews.get(publishMatch[1]);
      if (!preview) return json(response, 404, { error: 'Preview expired or was not found.' });
      if (preview.published) return json(response, 409, { error: 'This preview has already been published.' });
      const body = await collectJson(request);
      if (body.approval !== 'APPROVE') return json(response, 400, { error: 'Explicit approval is required.' });
      const job = createJob('publish', publishSteps);
      json(response, 202, publicJob(job));
      void publishPreview(job, preview);
    } catch (error) { return json(response, 400, { error: error instanceof Error ? error.message : 'Publish could not start.' }); }
    return;
  }
  return json(response, 404, { error: 'Not found.' });
});

server.listen(PORT, '127.0.0.1', () => console.log(`Publisher API listening on http://127.0.0.1:${PORT}`));
