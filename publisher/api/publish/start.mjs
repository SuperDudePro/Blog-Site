import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { listDestinationFiles } from '../../lib/repository.mjs';
import { validateManifest } from '../../lib/validation.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const { manifest } = await readJson(request);
    validateManifest(manifest);

    const repository = await repoRequest(manifest.repository, '');
    const baseBranch = repository.default_branch || 'main';
    const reference = await repoRequest(manifest.repository, `/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const baseCommitSha = reference.object.sha;
    const commit = await repoRequest(manifest.repository, `/git/commits/${baseCommitSha}`);
    const existingFiles = await listDestinationFiles(manifest.repository, commit.tree.sha, manifest.destinationPath);

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
      },
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
