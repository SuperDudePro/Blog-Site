import { requirePublisher } from '../../lib/auth.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { collectPackagePreflightErrors } from '../../lib/validation.mjs';

// Read-only. The existing publish/start endpoint remains the authoritative gate
// and repeats validation immediately before any GitHub operation.
export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) {
    return json(response, error.status || 401, { error: error.message });
  }
  try {
    const { manifest, preflight } = await readJson(request);
    // `manifest` goes last so a manifest nested in the preflight record can
    // never replace the one being reported on.
    const errors = collectPackagePreflightErrors({ ...preflight, manifest });
    return json(response, 200, { ok: errors.length === 0, errors });
  } catch (error) {
    return json(response, 400, { ok: false, errors: [error.message || 'Preflight failed.'] });
  }
}
