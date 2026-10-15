import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { validateSiteArtwork } from '../../lib/siteArtwork.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    const body = await readJson(request);
    const { repository, path, content, sha256 } = body || {};
    const { bytes, digest, meta } = validateSiteArtwork({ repository, path, content, sha256 });
    const base = await repoRequest(repository, '/git/ref/heads/main');
    const baseSha = base.object.sha;
    const commit = await repoRequest(repository, `/git/commits/${baseSha}`);
    const blob = await repoRequest(repository, '/git/blobs', { method: 'POST', body: { content, encoding: 'base64' } });
    // A Git blob SHA is calculated over the exact original file bytes, not an SVG wrapper.
    const tree = await repoRequest(repository, '/git/trees', { method: 'POST', body: { base_tree: commit.tree.sha, tree: [{ path, mode: '100644', type: 'blob', sha: blob.sha }] } });
    const revision = await repoRequest(repository, '/git/commits', { method: 'POST', body: { message: `Add original site artwork: ${path}`, tree: tree.sha, parents: [baseSha] } });
    const branch = `site-art/${digest.slice(0,16)}`;
    try {
      await repoRequest(repository, '/git/refs', { method: 'POST', body: { ref: `refs/heads/${branch}`, sha: revision.sha } });
    } catch (error) {
      // Never force-push over another editor's branch. If same content already staged, surface it explicitly.
      if (error.status === 422) throw new Error(`The artwork branch ${branch} already exists. Review its existing PR or use a different image.`);
      throw error;
    }
    const pr = await repoRequest(repository, '/pulls', { method: 'POST', body: { title: `Add original image: ${path}`, head: branch, base: 'main', draft: true, body: `Original bytes uploaded through Wilbert Publisher.\n\n- Path: \`${path}\`\n- SHA-256: \`${digest}\`\n- Format: ${meta.format}\n- Size: ${bytes.length} bytes\n- Dimensions: ${meta.width} x ${meta.height}\n\nVerify the image at preview before merging.` } });
    return json(response, 200, { ok: true, repository, path, sha256: digest, bytes: bytes.length, width: meta.width, height: meta.height, blobSha: blob.sha, commit: revision.sha, prUrl: pr.html_url, prNumber: pr.number });
  } catch (error) { return json(response, error.status || 400, { error: error.message, code: error.code }); }
}