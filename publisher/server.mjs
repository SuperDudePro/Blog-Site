import http from 'node:http';
import { mkdtemp, mkdir, cp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import JSZip from 'jszip';

const PORT = Number(process.env.PUBLISHER_API_PORT || 4174);
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const maxBytes = 100 * 1024 * 1024;

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};

const collectBody = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('ZIP exceeds the 100 MB preview limit.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const run = (command, args, cwd) => new Promise((resolveRun) => {
  const child = spawn(command, args, { cwd, shell: process.platform === 'win32' });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('close', (code) => resolveRun({ code: code ?? 1, stdout, stderr }));
});

const safeRelative = (path) => {
  const normalized = path.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('../') || normalized.startsWith('..')) {
    throw new Error(`Unsafe archive path: ${path}`);
  }
  return normalized;
};

async function buildPreview(zipBuffer) {
  const zip = await JSZip.loadAsync(zipBuffer);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const manifestEntry = entries.find((entry) => entry.name.replaceAll('\\', '/').endsWith('/source/package-manifest.json'));
  if (!manifestEntry) throw new Error('No source/package-manifest.json was found.');

  const manifest = JSON.parse(await manifestEntry.async('text'));
  if (!manifest.slug || !manifest.destinationPath || !manifest.buildCommand) {
    throw new Error('Manifest is missing slug, destinationPath, or buildCommand.');
  }
  if (manifest.repository !== 'SuperDudePro/Blog-Site') {
    throw new Error(`Unsupported repository: ${manifest.repository}`);
  }

  const root = manifestEntry.name.replaceAll('\\', '/').replace(/\/source\/package-manifest\.json$/, '');
  const prefix = `${root}/drop-in/${manifest.slug}/`;
  const productionEntries = entries.filter((entry) => entry.name.replaceAll('\\', '/').startsWith(prefix));
  if (!productionEntries.length) throw new Error(`No production files found under ${prefix}`);

  const expectedDestination = `src/content/posts/${manifest.slug}/`;
  const normalizedDestination = manifest.destinationPath.replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalizedDestination !== expectedDestination) {
    throw new Error(`Destination must be ${expectedDestination}; received ${normalizedDestination}`);
  }

  const workspace = await mkdtemp(join(tmpdir(), 'ood-publisher-preview-'));
  const siteRoot = join(workspace, 'site');
  try {
    await cp(repoRoot, siteRoot, {
      recursive: true,
      filter: (source) => {
        const relative = source.slice(repoRoot.length).split(sep).join('/');
        return !relative.startsWith('/.git') && !relative.startsWith('/node_modules') && !relative.startsWith('/dist') && !relative.startsWith('/publisher');
      },
    });

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
    if (install.code !== 0) return { ok: false, stage: 'install', manifest, logs: `${install.stdout}\n${install.stderr}`.trim() };

    const build = await run('npm', ['run', 'build'], siteRoot);
    const logs = `${build.stdout}\n${build.stderr}`.trim();
    if (build.code !== 0) return { ok: false, stage: 'build', manifest, logs };

    const indexPath = join(siteRoot, 'dist', 'index.html');
    await readFile(indexPath, 'utf8');
    return {
      ok: true,
      stage: 'complete',
      manifest,
      logs,
      preview: {
        workspace,
        distPath: join(siteRoot, 'dist'),
        canonicalUrl: manifest.canonicalUrl,
      },
    };
  } catch (error) {
    await rm(workspace, { recursive: true, force: true });
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, { ok: true });
  if (request.method !== 'POST' || request.url !== '/api/preview') return json(response, 404, { error: 'Not found.' });
  if (!request.headers['content-type']?.includes('application/zip')) return json(response, 415, { error: 'Expected application/zip.' });

  try {
    const body = await collectBody(request);
    const result = await buildPreview(body);
    json(response, result.ok ? 200 : 422, result);
  } catch (error) {
    json(response, 400, { ok: false, stage: 'package', error: error instanceof Error ? error.message : 'Preview failed.' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Publisher preview API listening on http://127.0.0.1:${PORT}`);
});
