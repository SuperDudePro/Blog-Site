export function json(response, status, body) {
  response.status(status);
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.send(JSON.stringify(body));
}

export async function readJson(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

export function method(request, response, allowed = 'POST') {
  if (request.method === allowed) return true;
  json(response, 405, { error: `Expected ${allowed}.` });
  return false;
}
