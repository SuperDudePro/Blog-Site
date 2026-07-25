import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { safeRelative, validateManifest } from '../../lib/validation.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    const { manifest, session, blobs } = await readJson(request);
    validateManifest(manifest);
    if (!session || session.repository !== manifest.repository || session.slug !== manifest.slug || session.destinationPath !== manifest.destinationPath) throw new Error('The publishing session does not match this package.');
    if (!Array.isArray(blobs) || !blobs.length) throw new Error('No uploaded production files were supplied.');

    const uploadedPaths = new Set();
    const additions = blobs.map((blob) => {
      if (!blob.sha || !blob.path) throw new Error('An uploaded file is missing its path or blob SHA.');
      const relative = safeRelative(blob.path);
      const path = `${manifest.destinationPath}${relative}`;
      if (uploadedPaths.has(path)) throw new Error(`Duplicate production path: ${path}`);
      uploadedPaths.add(path);
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    });

    const baseTree = await repoRequest(manifest.repository, `/git/trees/${session.baseTreeSha}?recursive=1`);
    const existing = (baseTree.tree || []).filter((entry) => entry.type === 'blob' && String(entry.path || '').startsWith(manifest.destinationPath));
    const deletions = existing
      .filter((entry) => !uploadedPaths.has(entry.path))
      .map((entry) => ({ path: entry.path, mode: '100644', type: 'blob', sha: null }));

    const createdTree = await repoRequest(manifest.repository, '/git/trees', {
      method: 'POST', body: { base_tree: session.baseTreeSha, tree: [...deletions, ...additions] },
    });
    const message = `Publish ${manifest.title}`;
    const commit = await repoRequest(manifest.repository, '/git/commits', {
      method: 'POST', body: { message, tree: createdTree.sha, parents: [session.baseCommitSha] },
    });
    await repoRequest(manifest.repository, `/git/refs/heads/${session.branch.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'PATCH', body: { sha: commit.sha, force: false },
    });
    const pullRequest = await repoRequest(manifest.repository, '/pulls', {
      method: 'POST',
      body: {
        title: message,
        head: session.branch,
        base: session.baseBranch,
        draft: true,
        body: `## What changed\n\nPublishes **${manifest.title}** from an approved Wilbert Publisher package.\n\n- Slug: \`${manifest.slug}\`\n- Destination: \`${manifest.destinationPath}\`\n- Canonical URL: ${manifest.canonicalUrl}\n- Production files added/replaced: ${additions.length}\n- Stale destination files removed: ${deletions.length}\n\n## Publisher controls\n\n- Package contract passed in the browser\n- The destination post folder was replaced atomically through the GitHub API\n- GitHub Actions and Vercel must pass before merge\n- Production merge remains manual\n`,
      },
    });
    return json(response, 200, {
      ok: true,
      result: { repository: manifest.repository, branch: session.branch, commit: commit.sha, prNumber: pullRequest.number, prUrl: pullRequest.html_url, baseBranch: session.baseBranch },
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
