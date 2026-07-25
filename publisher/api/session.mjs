import { requirePublisher } from '../lib/auth.mjs';
import { json, method } from '../lib/http.mjs';
export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  return json(response, 200, { ok: true });
}
