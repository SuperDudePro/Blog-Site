import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { compareDestination, listDestinationFiles } from '../../lib/repository.mjs';
import { branchFor, safeRelative, validateManifest } from '../../lib/validation.mjs';

const summaryLine = (label, files) => `- ${label}: ${files.length}${files.length ? ` — ${files.map((file) => `\`${file}\``).join(', ')}` : ''}`;

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const { manifest, session, blobs } = await readJson(request);
    validateManifest(manifest);
    if (!session || session.repository !== manifest.repository || session.slug !== manifest.slug || session.destinationPath !== manifest.destinationPath) throw new Error('The publishing session does not match this package.');
    if (!Array.isArray(blobs) || !blobs.length) throw new Error('No uploaded production files were supplied.');

    const repository = await repoRequest(manifest.repository, '');
    const baseBranch = repository.default_branch || 'main';
    const reference = await repoRequest(manifest.repository, `/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const baseCommitSha = reference.object.sha;
    const commit = await repoRequest(manifest.repository, `/git/commits/${baseCommitSha}`);
    const existingFiles = await listDestinationFiles(manifest.repository, commit.tree.sha, manifest.destinationPath);

    const uploadedFiles = blobs.map((blob) => {
      if (!blob.sha || !blob.path) throw new Error('An uploaded file is missing its path or blob SHA.');
      return { path: safeRelative(blob.path), sha: blob.sha, size: blob.size || 0 };
    });
    if (new Set(uploadedFiles.map((file) => file.path)).size !== uploadedFiles.length) throw new Error('The package contains duplicate production paths.');

    const comparison = compareDestination(existingFiles, uploadedFiles);
    const operation = existingFiles.length ? 'replace' : 'create';
    const tree = [
      ...uploadedFiles.map((blob) => ({
        path: `${manifest.destinationPath}${blob.path}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      })),
      ...comparison.deleted.map((path) => ({
        path: `${manifest.destinationPath}${path}`,
        sha: null,
      })),
    ];

    const createdTree = await repoRequest(manifest.repository, '/git/trees', {
      method: 'POST',
      body: { base_tree: commit.tree.sha, tree },
    });

    const verb = operation === 'replace' ? 'Update' : 'Publish';
    const message = `${verb} ${manifest.title}`;
    const createdCommit = await repoRequest(manifest.repository, '/git/commits', {
      method: 'POST',
      body: { message, tree: createdTree.sha, parents: [baseCommitSha] },
    });

    const branch = branchFor(manifest.slug);
    await repoRequest(manifest.repository, '/git/refs', {
      method: 'POST',
      body: { ref: `refs/heads/${branch}`, sha: createdCommit.sha },
    });

    const changeSummary = [
      summaryLine('Added', comparison.added),
      summaryLine('Replaced', comparison.replaced),
      summaryLine('Unchanged', comparison.unchanged),
      summaryLine('Deleted', comparison.deleted),
    ].join('\n');

    const pullRequest = await repoRequest(manifest.repository, '/pulls', {
      method: 'POST',
      body: {
        title: message,
        head: branch,
        base: baseBranch,
        draft: true,
        body: `## What changed\n\n${operation === 'replace' ? 'Replaces the complete existing post folder' : 'Publishes a new post folder'} for **${manifest.title}** from an approved Wilbert Publisher package.\n\n- Operation: **${operation === 'replace' ? 'Update existing post' : 'Publish new post'}**\n- Slug: \`${manifest.slug}\`\n- Destination: \`${manifest.destinationPath}\`\n- Canonical URL: ${manifest.canonicalUrl}\n\n## Folder comparison\n\n${changeSummary}\n\n## Publisher controls\n\n- Package contract passed in the browser\n- The uploaded drop-in folder was treated as authoritative for this destination only\n- Stale files were deleted only from \`${manifest.destinationPath}\`\n- Production assets were committed atomically through the GitHub API\n- GitHub Actions and Vercel must pass before merge\n- Production merge remains manual\n`,
      },
    });

    return json(response, 200, {
      ok: true,
      result: {
        repository: manifest.repository,
        branch,
        commit: createdCommit.sha,
        prNumber: pullRequest.number,
        prUrl: pullRequest.html_url,
        baseBranch,
        operation,
        comparison,
      },
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
