import { requirePublisher } from '../../lib/auth.mjs';
import { decodeGithubBlob, encodeBaseline, retireValidatedBaselineEntries } from '../../lib/baselineRetirement.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { buildTreeEntries, compareDestination, listDestinationFiles } from '../../lib/repository.mjs';
import { branchFor, safeRelative, validateManifest, validateProductionPaths } from '../../lib/validation.mjs';

const summaryLine = (label, files) => `- ${label}: ${files.length}${files.length ? ` — ${files.map((file) => `\`${file}\``).join(', ')}` : ''}`;

function stageError(stage, error) {
  const wrapped = new Error(`${stage}: ${error.message}`);
  wrapped.status = error.status || 400;
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.stage = stage;
  return wrapped;
}

async function atStage(stage, operation) {
  try {
    return await operation();
  } catch (error) {
    throw stageError(stage, error);
  }
}

async function setBranch(repository, branch, commitSha) {
  try {
    await repoRequest(repository, `/git/ref/heads/${encodeURIComponent(branch)}`);
    await repoRequest(repository, `/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH',
      body: { sha: commitSha, force: true },
    });
    return 'updated';
  } catch (error) {
    if (error.status !== 404) throw error;
    await repoRequest(repository, '/git/refs', {
      method: 'POST',
      body: { ref: `refs/heads/${branch}`, sha: commitSha },
    });
    return 'created';
  }
}

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const { manifest, session, blobs } = await readJson(request);
    validateManifest(manifest);
    if (!session || session.repository !== manifest.repository || session.slug !== manifest.slug || session.destinationPath !== manifest.destinationPath) throw new Error('The publishing session does not match this package.');
    if (!Array.isArray(blobs) || !blobs.length) throw new Error('No uploaded production files were supplied.');

    const repository = await atStage('load-repository', () => repoRequest(manifest.repository, ''));
    const baseBranch = repository.default_branch || 'main';
    const reference = await atStage('load-base-reference', () => repoRequest(manifest.repository, `/git/ref/heads/${encodeURIComponent(baseBranch)}`));
    const baseCommitSha = reference.object.sha;
    const commit = await atStage('load-base-commit', () => repoRequest(manifest.repository, `/git/commits/${baseCommitSha}`));
    const existingFiles = await atStage('list-destination-files', () => listDestinationFiles(manifest.repository, commit.tree.sha, manifest.destinationPath));

    validateProductionPaths(manifest, blobs.map((blob) => blob.path));
    const uploadedFiles = blobs.map((blob) => {
      if (!blob.sha || !blob.path) throw new Error('An uploaded file is missing its path or blob SHA.');
      return { path: safeRelative(blob.path), sha: blob.sha, size: blob.size || 0 };
    });
    const expectedPreflightPaths = [...new Set(session.preflight?.productionPaths || [])].sort();
    const uploadedPaths = uploadedFiles.map((file) => file.path).sort();
    if (
      expectedPreflightPaths.length !== uploadedPaths.length
      || expectedPreflightPaths.some((path, index) => path !== uploadedPaths[index])
    ) throw new Error('Uploaded production files do not match the completed package preflight.');
    const preflightSizes = new Map((session.preflight?.imageMetadata || []).map((image) => [image.file, Number(image.bytes || 0)]));
    for (const file of uploadedFiles) {
      const expectedSize = preflightSizes.get(file.path);
      if (expectedSize && expectedSize !== file.size) throw new Error(`${file.path} changed after package preflight.`);
    }

    const comparison = compareDestination(existingFiles, uploadedFiles);
    const operation = existingFiles.length ? 'replace' : 'create';
    const branch = String(session.branch || branchFor(manifest.slug));
    if (!branch.startsWith('publisher/')) throw new Error('The publishing branch is invalid.');

    if (session.existingPullRequest?.number && session.existingPullRequest?.commit) {
      const existingCommit = await atStage('load-existing-pull-request-commit', () => repoRequest(
        manifest.repository,
        `/git/commits/${session.existingPullRequest.commit}`,
      ));
      const existingBranchFiles = await atStage('list-existing-pull-request-files', () => listDestinationFiles(
        manifest.repository,
        existingCommit.tree.sha,
        manifest.destinationPath,
      ));
      const existingComparison = compareDestination(existingBranchFiles, uploadedFiles);
      const existingBaselineFile = await atStage('load-existing-pull-request-baseline', () => repoRequest(
        manifest.repository,
        `/contents/post-contract-baseline.json?ref=${encodeURIComponent(session.existingPullRequest.commit)}`,
      ));
      const existingBaseline = JSON.parse(decodeGithubBlob(existingBaselineFile));
      const baselineAlreadyRetired = !existingBaseline?.entries?.[manifest.slug];
      if (
        baselineAlreadyRetired
        && !existingComparison.added.length
        && !existingComparison.replaced.length
        && !existingComparison.deleted.length
      ) {
        return json(response, 200, {
          ok: true,
          result: {
            repository: manifest.repository,
            branch,
            commit: session.existingPullRequest.commit,
            prNumber: session.existingPullRequest.number,
            prUrl: session.existingPullRequest.url,
            baseBranch,
            canonicalUrl: manifest.canonicalUrl,
            title: manifest.title,
            operation,
            comparison: existingComparison,
            baselineRetirement: { retired: [], retained: [] },
            recovered: true,
          },
        });
      }
    }

    const tree = buildTreeEntries(manifest.destinationPath, uploadedFiles, comparison.deleted);
    if (!tree.length) throw new Error('The Git tree would be empty.');

    let baselineRetirement = { retired: [], retained: [], changed: false };
    if (['SuperDudePro/Blog-Site', 'SuperDudePro/LifeEducationOrg'].includes(manifest.repository)) {
      const baselineFile = await atStage('load-post-contract-baseline', () => repoRequest(
        manifest.repository,
        `/contents/post-contract-baseline.json?ref=${encodeURIComponent(baseCommitSha)}`,
      ));
      const baseline = JSON.parse(decodeGithubBlob(baselineFile));
      baselineRetirement = retireValidatedBaselineEntries({
        baseline,
        slug: manifest.slug,
      });
      if (baselineRetirement.changed) {
        const baselineBlob = await atStage('create-updated-baseline', () => repoRequest(manifest.repository, '/git/blobs', {
          method: 'POST',
          body: { content: encodeBaseline(baselineRetirement.baseline), encoding: 'utf-8' },
        }));
        tree.push({
          path: 'post-contract-baseline.json',
          mode: '100644',
          type: 'blob',
          sha: baselineBlob.sha,
        });
      }
    }

    const createdTree = await atStage('create-tree', () => repoRequest(manifest.repository, '/git/trees', {
      method: 'POST',
      body: { base_tree: commit.tree.sha, tree },
    }));
    if (!createdTree?.sha) throw new Error('create-tree: GitHub returned no tree SHA.');

    const verb = operation === 'replace' ? 'Update' : 'Publish';
    const message = `${verb} ${manifest.title}`;
    const createdCommit = await atStage('create-commit', () => repoRequest(manifest.repository, '/git/commits', {
      method: 'POST',
      body: { message, tree: createdTree.sha, parents: [baseCommitSha] },
    }));
    if (!createdCommit?.sha) throw new Error('create-commit: GitHub returned no commit SHA.');

    await atStage('create-or-update-branch', () => setBranch(manifest.repository, branch, createdCommit.sha));

    const changeSummary = [
      summaryLine('Added', comparison.added),
      summaryLine('Replaced', comparison.replaced),
      summaryLine('Unchanged', comparison.unchanged),
      summaryLine('Deleted', comparison.deleted),
    ].join('\n');
    const retiredBaselineSummary = baselineRetirement.retired.length
      ? `\n\n## Retired legacy exceptions\n\n${baselineRetirement.retired.map((entry) => `- \`${entry.ruleId}\` — \`${entry.signature}\``).join('\n')}\n`
      : '';

    const pullBody = `## What changed\n\n${operation === 'replace' ? 'Replaces the complete existing post folder' : 'Publishes a new post folder'} for **${manifest.title}** from an approved Wilbert Publisher package.\n\n- Site profile: **${manifest.targetSite}**\n- Operation: **${operation === 'replace' ? 'Update existing post' : 'Publish new post'}**\n- Slug: \`${manifest.slug}\`\n- Destination: \`${manifest.destinationPath}\`\n- Canonical URL: ${manifest.canonicalUrl}\n- Repository check: \`${manifest.buildCommand}\`\n\n## Folder comparison\n\n${changeSummary}${retiredBaselineSummary}\n\n## Publisher controls\n\n- Complete package preflight passed before GitHub production blobs were created\n- Resolved legacy exceptions were staged atomically with the post repair\n- Unresolved and unsupported legacy exceptions were preserved\n- The uploaded drop-in folder was treated as authoritative for this destination only\n- Stale files were deleted only from \`${manifest.destinationPath}\`\n- Production assets were committed atomically through the GitHub API\n- GitHub Actions and Vercel must pass before merge\n- Production merge remains manual\n`;
    const pullRequest = session.existingPullRequest?.number
      ? await atStage('update-pull-request', () => repoRequest(
          manifest.repository,
          `/pulls/${session.existingPullRequest.number}`,
          { method: 'PATCH', body: { title: message, body: pullBody, base: baseBranch } },
        ))
      : await atStage('create-pull-request', () => repoRequest(manifest.repository, '/pulls', {
          method: 'POST',
          body: {
            title: message,
            head: branch,
            base: baseBranch,
            draft: true,
            body: pullBody,
          },
        }));

    return json(response, 200, {
      ok: true,
      result: {
        repository: manifest.repository,
        branch,
        commit: createdCommit.sha,
        prNumber: pullRequest.number,
        prUrl: pullRequest.html_url,
        baseBranch,
        canonicalUrl: manifest.canonicalUrl,
        title: manifest.title,
        operation,
        comparison,
        baselineRetirement: {
          retired: baselineRetirement.retired,
          retained: baselineRetirement.retained,
        },
      },
    });
  } catch (error) {
    console.error('[publish/finish] failed', {
      stage: error.stage || 'unknown',
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return json(response, error.status || 400, {
      error: error.message,
      stage: error.stage || 'unknown',
      code: error.code,
      details: error.details,
    });
  }
}
