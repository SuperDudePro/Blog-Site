import { json, method } from '../lib/http.mjs';
export default async function handler(request, response) {
  if (!method(request, response, 'GET')) return;
  return json(response, 200, { ok: true, service: 'wilbert-publisher' });
}
