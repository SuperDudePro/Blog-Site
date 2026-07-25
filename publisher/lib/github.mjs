import { githubToken } from './auth.mjs';

const API = 'https://api.github.com';

export async function github(path, options = {}) {
  const body = options.body && typeof options.body === 'object' && !(options.body instanceof Uint8Array)
    ? JSON.stringify(options.body)
    : options.body;
  const response = await fetch(`${API}${path}`, {
    ...options,
    body,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken()}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'wilbert-publisher',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw Object.assign(new Error(data?.message || `GitHub returned HTTP ${response.status}.`), {
      status: response.status,
      details: data,
    });
  }
  return data;
}

export function splitRepo(repository) {
  const [owner, repo, extra] = String(repository || '').split('/');
  if (!owner || !repo || extra) throw Object.assign(new Error('Invalid repository.'), { status: 400 });
  return { owner, repo };
}

export async function repoRequest(repository, suffix, options) {
  const { owner, repo } = splitRepo(repository);
  return github(`/repos/${owner}/${repo}${suffix}`, options);
}
