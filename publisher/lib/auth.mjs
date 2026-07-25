import { timingSafeEqual } from 'node:crypto';

function equal(left, right) {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requirePublisher(request) {
  const configured = process.env.PUBLISHER_ACCESS_KEY || '';
  const supplied = request.headers['x-publisher-key'] || '';
  if (!configured) throw Object.assign(new Error('PUBLISHER_ACCESS_KEY is not configured.'), { status: 503 });
  if (!equal(String(supplied), configured)) throw Object.assign(new Error('Invalid publisher access key.'), { status: 401 });
}

export function githubToken() {
  const token = process.env.GITHUB_TOKEN || '';
  if (!token) throw Object.assign(new Error('GITHUB_TOKEN is not configured.'), { status: 503 });
  return token;
}
