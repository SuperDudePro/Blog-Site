import { requirePublisher } from '../../lib/auth.mjs';
import { decodeGithubBlob, encodeBaseline, retireValidatedBaselineEntries } from '../../lib/baselineRetirement.mjs';
import { inspectProductionBlobs } from '../../lib/directHandoff.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { buildTreeEntries, compareDestination, listDestinationFiles, publishingBranchHead } from '../../lib/repository.mjs';
import { includeOurOldDadPostInSitemap } from '../../lib/sitemap.mjs';
import { branchFor, preflightFailure, safeRelative, validateManifest, validateProductionPaths } from '../../lib/validation.mjs';
import { getSiteProfile } from '../../siteProfiles.mjs';

const summaryLine = (label, files) => `- ${label}: ${files.length}${files.length ? ` — ${files.map((file) => `\`${file}\``).join(', ')}` : ''}`;

function stageError(stage, error) {
  const wrapped = new Error(`${stage}: ${error.message}`);
  wrapped.status = error.status || 400;
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.stage = stage;
  return wrapped;
}

// The manifest published in the draft's description, where the CI gate reads
// it: the validated package fields in a fixed order, with each image's
// SHA-256 taken from the uploaded bytes rather than from the request.
function manifestForPullRequest(manifest, digests) {
  const fields = ['targetSite', 'repository', ...getSiteProfile(manifest).metadataFields, 'tags', 'format', 'destinationPath', 'canonicalUrl', 'buildCommand'];
  return {
    ...Object.fromEntries(fields.filter((field) => manifest[field] !== undefined).map((field) => [field, manifest[field]])),
    images: manifest.images.map((image) => ({
      file: image.file,
      role: image.role,
      alt: image.alt,
      caption: image.caption ?? null,
      sha256: digests.get(image.file),
    })),
  };
}

async function atStage(stage, operation) {
  try {
    return await operation();
  } catch (error) {
    throw stageError(stage, error);
  }
}

function branchChanged(branch, detail) {
  const error = new Error(`The publishing branch ${branch} changed after this submission started, so nothing was overwritten. Start the submission again to work from the current draft.${detail ? ` (GitHub: ${detail})` : ''}`);
  error.status = 409;
  error.code = 'PUBLISHING_BRANCH_CHANGED';
  return error;
}

// Moves the publishing branch only if it is still where this submission
// found it. `expectedHead` is null when the branch must not exist yet.
//
// GitHub makes the decision, in the same request that writes: creating a
// reference fails if it already exists, and an update without `force` fails
// unless it is a fast-forward. The new commit lists `expectedHead` as a
// parent, so the update fast-forwards only while nobody else has added to
// the branch. Checking the branch first and then forcing it would leave a
// gap in which a newer commit could be discarded without anyone noticing.
async function setBranch(repository, branch, commitSha, expectedHead) {
  try {
    if (!expectedHead) {
      await repoRequest(repository, '/git/refs', {
        method: 'POST',
        body: { ref: `refs/heads/${branch}`, sha: commitSha },
      });
      return 'created';
    }
    await repoRequest(repository, `/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH',
      body: { sha: commitSha, force: false },
    });
    return 'updated';
  } catch (error) {
    if (error.status === 409 || error.status === 422) throw branchChanged(branch, error.message);
    throw error;
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

    // The session's preflight is the browser's account of the package. Before
    // anything is written, hold the uploaded bytes themselves to the same
    // contract the CI gate applies to the pull request, and take each image's
    // SHA-256 from those bytes.
    const inspection = await atStage('verify-uploaded-package', () => inspectProductionBlobs({
      repository: manifest.repository,
      manifest,
      files: uploadedFiles,
    }));
    const packageErrors = [...inspection.errors];
    for (const image of manifest.images) {
      // A package may state its own digests. When it does, they must be right.
      if (image.sha256 && String(image.sha256).toLowerCase() !== inspection.digests.get(image.file)) {
        packageErrors.push(`${image.file}: SHA-256 in the package manifest does not match the uploaded image bytes.`);
      }
    }
    if (packageErrors.length) throw preflightFailure(packageErrors);
    const publishedManifest = manifestForPullRequest(manifest, inspection.digests);

    const comparison = compareDestination(existingFiles, uploadedFiles);
    const operation = existingFiles.length ? 'replace' : 'create';
    const branch = branchFor(manifest.slug);
    if (session.branch !== branch) throw new Error('The publishing session branch does not match this package.');
    let verifiedPullRequest = null;
    if (session.existingPullRequest?.number) {
      verifiedPullRequest = await atStage('verify-existing-pull-request', () => repoRequest(
        manifest.repository, `/pulls/${Number(session.existingPullRequest.number)}`,
      ));
      if (
        verifiedPullRequest.state !== 'open'
        || verifiedPullRequest.head?.ref !== branch
        || verifiedPullRequest.head?.sha !== session.existingPullRequest.commit
        || verifiedPullRequest.base?.ref !== baseBranch
        // Strict: a deleted fork is reported as `head.repo: null`, and a pull
        // request without a head repository cannot be this job's draft.
        || verifiedPullRequest.head?.repo?.full_name !== manifest.repository
      ) throw new Error('The existing pull request does not belong to this publishing job.');
    }

    if (verifiedPullRequest) {
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

    // Refuse a stale submission before anything is written: the branch must
    // still be exactly what this session was created against. setBranch
    // repeats the condition atomically for a change that lands after this.
    const expectedHead = verifiedPullRequest ? session.existingPullRequest.commit : (session.branchHead || null);
    const currentHead = await atStage('load-publishing-branch', () => publishingBranchHead(manifest.repository, branch));
    if (currentHead !== expectedHead) throw branchChanged(branch);

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

    // The site build compares its committed sitemap with regenerated routes. Stage
    // the new post route atomically with its source and image files.
    if (manifest.repository === 'SuperDudePro/Blog-Site') {
      const sitemapFile = await atStage('load-committed-sitemap', () => repoRequest(
        manifest.repository,
        `/contents/public/sitemap.xml?ref=${encodeURIComponent(baseCommitSha)}`,
      ));
      const currentSitemap = decodeGithubBlob(sitemapFile);
      const nextSitemap = includeOurOldDadPostInSitemap(currentSitemap, manifest);
      if (nextSitemap.changed) {
        const sitemapBlob = await atStage('create-updated-sitemap', () => repoRequest(manifest.repository, '/git/blobs', {
          method: 'POST',
          body: { content: nextSitemap.content, encoding: 'utf-8' },
        }));
        tree.push({
          path: 'public/sitemap.xml',
          mode: '100644',
          type: 'blob',
          sha: sitemapBlob.sha,
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
    // The tree is still the live default branch plus this post. The branch's
    // current commit is added as a second parent only so that moving the
    // branch is a fast-forward GitHub can verify (see setBranch).
    const parents = expectedHead && expectedHead !== baseCommitSha ? [baseCommitSha, expectedHead] : [baseCommitSha];
    const createdCommit = await atStage('create-commit', () => repoRequest(manifest.repository, '/git/commits', {
      method: 'POST',
      body: { message, tree: createdTree.sha, parents },
    }));
    if (!createdCommit?.sha) throw new Error('create-commit: GitHub returned no commit SHA.');

    await atStage('create-or-update-branch', () => setBranch(manifest.repository, branch, createdCommit.sha, expectedHead));

    const changeSummary = [
      summaryLine('Added', comparison.added),
      summaryLine('Replaced', comparison.replaced),
      summaryLine('Unchanged', comparison.unchanged),
      summaryLine('Deleted', comparison.deleted),
    ].join('\n');
    const retiredBaselineSummary = baselineRetirement.retired.length
      ? `\n\n## Retired legacy exceptions\n\n${baselineRetirement.retired.map((entry) => `- \`${entry.ruleId}\` — \`${entry.signature}\``).join('\n')}\n`
      : '';

    const pullBody = `## What changed\n\n${operation === 'replace' ? 'Replaces the complete existing post folder' : 'Publishes a new post folder'} for **${manifest.title}** from an approved Wilbert Publisher package.\n\n- Site profile: **${manifest.targetSite}**\n- Operation: **${operation === 'replace' ? 'Update existing post' : 'Publish new post'}**\n- Handoff method: **Publisher package**\n- Slug: \`${manifest.slug}\`\n- Destination: \`${manifest.destinationPath}\`\n- Canonical URL: ${manifest.canonicalUrl}\n- Repository check: \`${manifest.buildCommand}\`\n\n## Publisher manifest\n\n\`\`\`json\n${JSON.stringify(publishedManifest, null, 2)}\n\`\`\`\n\n## Folder comparison\n\n${changeSummary}${retiredBaselineSummary}\n\n## Publisher controls\n\n- Complete package preflight passed before GitHub production blobs were created\n- The uploaded source and image bytes were checked against the manifest above, and its image SHA-256 values were computed from those bytes\n- Resolved legacy exceptions were staged atomically with the post repair\n- Unresolved and unsupported legacy exceptions were preserved\n- The uploaded drop-in folder was treated as authoritative for this destination only\n- Stale files were deleted only from \`${manifest.destinationPath}\`\n- Production assets were committed atomically through the GitHub API\n- GitHub Actions and Vercel must pass before merge\n- Production merge remains manual\n`;
    const pullRequest = verifiedPullRequest
      ? await atStage('update-pull-request', () => repoRequest(
          manifest.repository,
          `/pulls/${verifiedPullRequest.number}`,
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
