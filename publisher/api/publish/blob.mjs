import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { validateRepository } from '../../lib/validation.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    const body = await readJson(request);
    validateRepository(body.repository);
    if (body.encoding !== 'base64' || typeof body.content !== 'string' || !body.content) throw new Error('A base64 file payload is required.');
    if (body.content.length > 10 * 1024 * 1024) throw new Error('A production file exceeds the publisher upload limit.');
    const blob = await repoRequest(body.repository, '/git/blobs', {
      method: 'POST',
      body: { content: body.content, encoding: 'base64' },
    });
    return json(response, 200, { ok: true, sha: blob.sha, size: Math.floor(body.content.length * 0.75) });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
