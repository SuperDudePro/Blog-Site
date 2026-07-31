import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { findPublishingPullRequest } from '../../lib/publishingJobs.mjs';
import { listDestinationFiles } from '../../lib/repository.mjs';
import { branchFor, validatePackagePreflight } from '../../lib/validation.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const { manifest, preflight } = await readJson(request);
    validatePackagePreflight({ manifest, ...preflight });

    const desiredBranch = branchFor(manifest.slug);
    const [repository, openPullRequests] = await Promise.all([
      repoRequest(manifest.repository, ''),
      repoRequest(manifest.repository, '/pulls?state=open&sort=updated&direction=desc&per_page=100'),
    ]);
    const baseBranch = repository.default_branch || 'main';
    const reference = await repoRequest(manifest.repository, `/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const baseCommitSha = reference.object.sha;
    const commit = await repoRequest(manifest.repository, `/git/commits/${baseCommitSha}`);
    const existingFiles = await listDestinationFiles(manifest.repository, commit.tree.sha, manifest.destinationPath);
    const existingPullRequest = findPublishingPullRequest(openPullRequests, {
      slug: manifest.slug,
      branch: desiredBranch,
    });

    return json(response, 200, {
      ok: true,
      session: {
        repository: manifest.repository,
        slug: manifest.slug,
        title: manifest.title,
        destinationPath: manifest.destinationPath,
        canonicalUrl: manifest.canonicalUrl,
        baseBranch,
        baseCommitSha,
        baseTreeSha: commit.tree.sha,
        operation: existingFiles.length ? 'replace' : 'create',
        existingFiles,
        branch: existingPullRequest?.head?.ref || desiredBranch,
        existingPullRequest: existingPullRequest ? {
          number: existingPullRequest.number,
          url: existingPullRequest.html_url,
          commit: existingPullRequest.head?.sha || '',
        } : null,
        preflight: {
          productionPaths: preflight.productionPaths,
          imageMetadata: preflight.imageMetadata,
        },
      },
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
