import { requirePublisher } from '../../lib/auth.mjs';
import { verifyDirectHandoff } from '../../lib/directHandoff.mjs';
import { json, method, readJson } from '../../lib/http.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) {
    return json(response, error.status || 401, { error: error.message });
  }
  try {
    const { repository, prNumber } = await readJson(request);
    const result = await verifyDirectHandoff({ repository, prNumber });
    return json(response, 200, result);
  } catch (error) {
    return json(response, error.status || 400, { ok: false, errors: [error.message], error: error.message });
  }
}
