// In-memory GitHub REST double for handler-level Publisher tests.
//
// It models the Git data the publishing handlers depend on: blobs, trees,
// commits with parents, branch references, and pull requests. Reference
// writes follow GitHub's documented rules, which is what the retry and
// concurrency regressions rely on:
//   - POST  /git/refs              fails with 422 when the reference exists.
//   - PATCH /git/refs/heads/<name> fails with 422 unless `force` is true or
//                                  the update is a fast-forward.
// Nothing here opens a socket. Hooks let a test act as "another writer" or
// drop a response after GitHub has already applied the request.
import { createHash } from 'node:crypto';

const sha1 = (value) => createHash('sha1').update(value).digest('hex');
const toBuffer = (value) => (Buffer.isBuffer(value) ? value : Buffer.from(value));

export const gitBlobSha = (bytes) => sha1(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), toBuffer(bytes)]));

const reply = (status, body) => ({ status, body });
const notFound = () => reply(404, { message: 'Not Found' });
const invalid = (message, errors) => reply(422, { message, ...(errors ? { errors } : {}) });

function malformedTreePath(path) {
  return typeof path !== 'string'
    || !path
    || path.startsWith('/')
    || path.includes('\\')
    || path.split('/').some((part) => !part || part === '.' || part === '..' || part === '.git');
}

export class FakeGitHub {
  constructor({ host = 'fake-github.test' } = {}) {
    this.host = host;
    this.repositories = new Map();
    this.requests = [];
    this.hooks = [];
    this.refusals = [];
    this.sequence = 0;
  }

  // ---- state setup and inspection -------------------------------------

  addRepository(fullName, { files = {}, defaultBranch = 'main' } = {}) {
    const repository = {
      fullName,
      defaultBranch,
      blobs: new Map(),
      trees: new Map(),
      commits: new Map(),
      refs: new Map(),
      pulls: [],
      comments: new Map(),
      deployments: [],
      checkRuns: new Map(),
    };
    this.repositories.set(fullName.toLowerCase(), repository);
    const commit = this.writeCommit(fullName, { files, parents: [], message: 'Initial commit' });
    repository.refs.set(defaultBranch, commit);
    return repository;
  }

  repository(fullName) {
    const repository = this.repositories.get(String(fullName).toLowerCase());
    if (!repository) throw new Error(`Fixture repository is not registered: ${fullName}`);
    return repository;
  }

  storeBlob(fullName, content) {
    const repository = this.repository(fullName);
    const bytes = toBuffer(content);
    const sha = gitBlobSha(bytes);
    repository.blobs.set(sha, bytes);
    return sha;
  }

  storeTree(repository, entries) {
    const sorted = [...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const sha = sha1(`tree\n${sorted.map(([path, blob]) => `${path}\0${blob}`).join('\n')}`);
    repository.trees.set(sha, new Map(sorted));
    return sha;
  }

  // Creates a commit object as "some other writer" would. `files` maps a
  // path to its new content, or to null to delete it. `baseTree` (a commit
  // SHA) supplies the starting tree; it defaults to the first parent.
  writeCommit(fullName, { files = {}, parents = [], baseTree, message = 'Fixture commit' } = {}) {
    const repository = this.repository(fullName);
    const startingCommit = baseTree || parents[0];
    const entries = new Map(startingCommit ? repository.trees.get(repository.commits.get(startingCommit).tree) : []);
    for (const [path, content] of Object.entries(files)) {
      if (content === null) entries.delete(path);
      else entries.set(path, this.storeBlob(fullName, content));
    }
    const tree = this.storeTree(repository, entries);
    return this.storeCommit(repository, { tree, parents, message });
  }

  storeCommit(repository, { tree, parents, message }) {
    this.sequence += 1;
    const sha = sha1(`commit ${this.sequence}\n${tree}\n${parents.join(',')}\n${message}`);
    repository.commits.set(sha, { tree, parents: [...parents], message });
    return sha;
  }

  // Moves a branch the way a plain `git push` from another writer would:
  // a new commit on top of the current head (or `parents` when given).
  push(fullName, branch, { files = {}, parents, baseTree, message } = {}) {
    const repository = this.repository(fullName);
    const current = repository.refs.get(branch);
    const commit = this.writeCommit(fullName, {
      files,
      parents: parents || (current ? [current] : [repository.refs.get(repository.defaultBranch)]),
      baseTree,
      message,
    });
    repository.refs.set(branch, commit);
    return commit;
  }

  openPullRequest(fullName, { head, base, title = 'Fixture pull request', body = '', headRepository, headSha } = {}) {
    const repository = this.repository(fullName);
    const number = 100 + repository.pulls.length + 1;
    const pull = {
      number,
      title,
      body,
      state: 'open',
      draft: true,
      merged: false,
      mergedAt: null,
      mergeCommitSha: null,
      headRef: head,
      // undefined: same repository. A string: an existing fork. null: the
      // fork was deleted, which GitHub reports as `head.repo: null`.
      headRepository: headRepository === undefined ? repository.fullName : headRepository,
      headSha: headSha || null,
      baseRef: base || repository.defaultBranch,
      createdAt: new Date(Date.UTC(2026, 10, 12, 12, 0, this.sequence)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 10, 12, 12, 0, this.sequence += 1)).toISOString(),
    };
    repository.pulls.push(pull);
    return this.pullJson(repository, pull);
  }

  // Squash-merges a pull request the way the GitHub merge button would.
  mergePullRequest(fullName, number) {
    const repository = this.repository(fullName);
    const pull = repository.pulls.find((candidate) => candidate.number === number);
    const head = repository.refs.get(pull.headRef);
    const merge = this.storeCommit(repository, {
      tree: repository.commits.get(head).tree,
      parents: [repository.refs.get(pull.baseRef)],
      message: `${pull.title} (#${number})`,
    });
    repository.refs.set(pull.baseRef, merge);
    Object.assign(pull, { state: 'closed', merged: true, mergedAt: '2026-11-12T13:00:00Z', mergeCommitSha: merge });
    return merge;
  }

  // An issue comment. Anyone who can see a public repository can post one.
  addComment(fullName, number, { body, login = 'outside-commenter', type = 'User' }) {
    const repository = this.repository(fullName);
    const comments = repository.comments.get(number) || [];
    comments.push({ id: 9000 + comments.length, body, user: { login, type }, created_at: '2026-11-12T12:30:00Z' });
    repository.comments.set(number, comments);
  }

  // A GitHub deployment record with its statuses (oldest first). Only an
  // actor with write access, or an installed app, can create these; the
  // default actor is the Vercel GitHub App.
  addDeployment(fullName, {
    sha,
    environment,
    production = false,
    creator = { login: 'vercel[bot]', type: 'Bot' },
    statuses = [],
  }) {
    const repository = this.repository(fullName);
    const id = 7000 + repository.deployments.length + 1;
    repository.deployments.push({
      id,
      sha,
      ref: sha,
      task: 'deploy',
      environment,
      original_environment: environment,
      production_environment: production,
      transient_environment: false,
      creator,
      created_at: new Date(Date.UTC(2026, 10, 12, 12, 10, repository.deployments.length)).toISOString(),
      statuses: statuses.map((status, index) => ({
        id: id * 10 + index,
        environment,
        creator,
        target_url: status.environment_url,
        log_url: status.environment_url,
        created_at: new Date(Date.UTC(2026, 10, 12, 12, 11, index)).toISOString(),
        ...status,
      })),
    });
    return id;
  }

  setCheckRuns(fullName, sha, runs) {
    this.repository(fullName).checkRuns.set(sha, runs);
  }

  pullJson(repository, pull) {
    const sameRepository = pull.headRepository === repository.fullName;
    return {
      number: pull.number,
      html_url: `https://github.com/${repository.fullName}/pull/${pull.number}`,
      title: pull.title,
      body: pull.body,
      state: pull.state,
      draft: pull.draft,
      merged: pull.merged,
      merged_at: pull.mergedAt,
      merge_commit_sha: pull.mergeCommitSha,
      created_at: pull.createdAt,
      updated_at: pull.updatedAt,
      head: {
        ref: pull.headRef,
        sha: sameRepository ? (repository.refs.get(pull.headRef) || pull.headSha) : pull.headSha,
        repo: pull.headRepository ? { full_name: pull.headRepository } : null,
      },
      base: { ref: pull.baseRef, repo: { full_name: repository.fullName } },
    };
  }

  head(fullName, branch) {
    return this.repository(fullName).refs.get(branch) || null;
  }

  commit(fullName, sha) {
    return this.repository(fullName).commits.get(sha) || null;
  }

  // Returns a path -> text map of the tree at a commit.
  files(fullName, commitSha) {
    const repository = this.repository(fullName);
    const tree = repository.trees.get(repository.commits.get(commitSha).tree);
    return Object.fromEntries([...tree].map(([path, blob]) => [path, repository.blobs.get(blob).toString('utf8')]));
  }

  pulls(fullName) {
    const repository = this.repository(fullName);
    return repository.pulls.map((pull) => this.pullJson(repository, pull));
  }

  isAncestor(repository, ancestor, descendant) {
    const pending = [descendant];
    const seen = new Set();
    while (pending.length) {
      const sha = pending.pop();
      if (sha === ancestor) return true;
      if (seen.has(sha)) continue;
      seen.add(sha);
      pending.push(...(repository.commits.get(sha)?.parents || []));
    }
    return false;
  }

  // Requests that change GitHub state.
  writes() {
    return this.requests.filter((request) => request.method !== 'GET');
  }

  // ---- hooks -----------------------------------------------------------

  // `when` is 'before' (GitHub has not applied the request) or 'after'
  // (GitHub applied it, the caller has not seen the response yet).
  once(when, matcher, action) {
    this.hooks.push({ when, matcher, action });
  }

  // GitHub answers every matching request with an error instead of acting,
  // for example a 403 when the token lacks a permission.
  refuse(matcher, status, message) {
    this.refusals.push({ matcher, status, message });
  }

  // GitHub applies the matching request, then the response never arrives.
  loseResponse(matcher) {
    this.once('after', matcher, () => {
      throw new TypeError('fetch failed');
    });
  }

  async runHooks(when, request) {
    for (const hook of [...this.hooks]) {
      if (hook.when !== when || !hook.matcher(request)) continue;
      this.hooks.splice(this.hooks.indexOf(hook), 1);
      await hook.action(request, this);
    }
  }

  // ---- HTTP ------------------------------------------------------------

  async fetch(input, options = {}) {
    const url = new URL(String(input));
    const request = {
      method: String(options.method || 'GET').toUpperCase(),
      host: url.host,
      path: decodeURIComponent(url.pathname),
      query: url.searchParams,
      body: options.body ? JSON.parse(options.body) : null,
      headers: options.headers || {},
    };
    this.requests.push(request);
    await this.runHooks('before', request);
    const refusal = this.refusals.find((candidate) => candidate.matcher(request));
    const { status, body } = refusal ? reply(refusal.status, { message: refusal.message }) : this.route(request);
    request.status = status;
    await this.runHooks('after', request);
    return new Response(body === undefined ? '' : JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  route(request) {
    if (request.host !== this.host) return reply(502, { message: `Unexpected fixture host: ${request.host}` });
    const match = request.path.match(/^\/repos\/([^/]+)\/([^/]+)(\/.*)?$/);
    const repository = match && this.repositories.get(`${match[1]}/${match[2]}`.toLowerCase());
    if (!repository) return notFound();
    request.repository = repository.fullName;
    const rest = match[3] || '';
    const { method, body, query } = request;
    let parts;

    if (rest === '' && method === 'GET') {
      return reply(200, { full_name: repository.fullName, default_branch: repository.defaultBranch });
    }

    if (rest === '/pulls' && method === 'GET') {
      const state = query.get('state') || 'open';
      const pulls = repository.pulls
        .filter((pull) => state === 'all' || pull.state === state)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
      return reply(200, pulls.map((pull) => this.pullJson(repository, pull)));
    }
    if (rest === '/pulls' && method === 'POST') {
      if (!repository.refs.has(body.head)) return invalid('Validation Failed', [{ field: 'head', code: 'invalid' }]);
      if (!repository.refs.has(body.base)) return invalid('Validation Failed', [{ field: 'base', code: 'invalid' }]);
      const duplicate = repository.pulls.find((pull) => (
        pull.state === 'open'
        && pull.headRepository === repository.fullName
        && pull.headRef === body.head
        && pull.baseRef === body.base
      ));
      if (duplicate) {
        return invalid('Validation Failed', [{ message: `A pull request already exists for ${repository.fullName.split('/')[0]}:${body.head}.` }]);
      }
      const created = this.openPullRequest(repository.fullName, { head: body.head, base: body.base, title: body.title, body: body.body });
      return reply(201, created);
    }
    if ((parts = rest.match(/^\/pulls\/(\d+)$/))) {
      const pull = repository.pulls.find((candidate) => candidate.number === Number(parts[1]));
      if (!pull) return notFound();
      if (method === 'PATCH') {
        if (typeof body.title === 'string') pull.title = body.title;
        if (typeof body.body === 'string') pull.body = body.body;
        if (typeof body.base === 'string') pull.baseRef = body.base;
        if (typeof body.state === 'string') pull.state = body.state;
        pull.updatedAt = new Date(Date.parse(pull.updatedAt) + 60_000).toISOString();
      }
      return reply(200, this.pullJson(repository, pull));
    }

    if ((parts = rest.match(/^\/git\/ref\/heads\/(.+)$/)) && method === 'GET') {
      const sha = repository.refs.get(parts[1]);
      return sha ? reply(200, { ref: `refs/heads/${parts[1]}`, object: { type: 'commit', sha } }) : notFound();
    }
    if (rest === '/git/refs' && method === 'POST') {
      const branch = String(body.ref || '').replace(/^refs\/heads\//, '');
      if (!String(body.ref || '').startsWith('refs/heads/') || !branch) return invalid('Reference name is invalid');
      if (repository.refs.has(branch)) return invalid('Reference already exists');
      if (!repository.commits.has(body.sha)) return invalid('Object does not exist');
      repository.refs.set(branch, body.sha);
      return reply(201, { ref: body.ref, object: { type: 'commit', sha: body.sha } });
    }
    if ((parts = rest.match(/^\/git\/refs\/heads\/(.+)$/)) && method === 'PATCH') {
      const current = repository.refs.get(parts[1]);
      if (!current) return invalid('Reference does not exist');
      if (!repository.commits.has(body.sha)) return invalid('Object does not exist');
      if (body.force !== true && !this.isAncestor(repository, current, body.sha)) return invalid('Update is not a fast forward');
      repository.refs.set(parts[1], body.sha);
      return reply(200, { ref: `refs/heads/${parts[1]}`, object: { type: 'commit', sha: body.sha } });
    }

    if ((parts = rest.match(/^\/git\/commits\/([0-9a-f]{40})$/)) && method === 'GET') {
      const commit = repository.commits.get(parts[1]);
      return commit
        ? reply(200, { sha: parts[1], tree: { sha: commit.tree }, parents: commit.parents.map((sha) => ({ sha })), message: commit.message })
        : notFound();
    }
    if (rest === '/git/commits' && method === 'POST') {
      if (!repository.trees.has(body.tree)) return invalid('Tree SHA does not exist');
      if (!Array.isArray(body.parents) || body.parents.some((sha) => !repository.commits.has(sha))) return invalid('Parent SHA does not exist or is not a commit object');
      return reply(201, { sha: this.storeCommit(repository, body) });
    }

    if ((parts = rest.match(/^\/git\/trees\/([0-9a-f]{40})$/)) && method === 'GET') {
      const tree = repository.trees.get(parts[1]);
      if (!tree) return notFound();
      return reply(200, {
        sha: parts[1],
        truncated: false,
        tree: [...tree].map(([path, sha]) => ({ path, mode: '100644', type: 'blob', sha, size: repository.blobs.get(sha).length })),
      });
    }
    if (rest === '/git/trees' && method === 'POST') {
      const base = body.base_tree ? repository.trees.get(body.base_tree) : new Map();
      if (!base) return invalid('base_tree is not a valid tree oid');
      const entries = new Map(base);
      for (const entry of Array.isArray(body.tree) ? body.tree : []) {
        if (malformedTreePath(entry.path)) return invalid('tree.path contains a malformed path component');
        if (entry.sha === null) entries.delete(entry.path);
        else if (!repository.blobs.has(entry.sha)) return invalid(`tree.sha ${entry.sha} is not a valid blob`);
        else entries.set(entry.path, entry.sha);
      }
      return reply(201, { sha: this.storeTree(repository, entries) });
    }

    if (rest === '/git/blobs' && method === 'POST') {
      const bytes = body.encoding === 'base64' ? Buffer.from(body.content, 'base64') : Buffer.from(String(body.content));
      return reply(201, { sha: this.storeBlob(repository.fullName, bytes) });
    }
    if ((parts = rest.match(/^\/git\/blobs\/([0-9a-f]{40})$/)) && method === 'GET') {
      const bytes = repository.blobs.get(parts[1]);
      return bytes
        ? reply(200, { sha: parts[1], size: bytes.length, encoding: 'base64', content: bytes.toString('base64') })
        : notFound();
    }

    if ((parts = rest.match(/^\/contents\/(.+)$/)) && method === 'GET') {
      const ref = query.get('ref') || repository.defaultBranch;
      const commit = repository.commits.get(repository.commits.has(ref) ? ref : repository.refs.get(ref));
      const blob = commit && repository.trees.get(commit.tree).get(parts[1]);
      if (!blob) return notFound();
      const bytes = repository.blobs.get(blob);
      return reply(200, { path: parts[1], sha: blob, size: bytes.length, encoding: 'base64', content: bytes.toString('base64') });
    }

    if ((parts = rest.match(/^\/commits\/([0-9a-f]{40})\/check-runs$/))) {
      return reply(200, { check_runs: repository.checkRuns.get(parts[1]) || [] });
    }
    if (/^\/commits\/[0-9a-f]{40}\/status$/.test(rest)) return reply(200, { statuses: [] });
    if ((parts = rest.match(/^\/issues\/(\d+)\/comments$/))) {
      return reply(200, repository.comments.get(Number(parts[1])) || []);
    }

    if (rest === '/deployments' && method === 'GET') {
      const sha = query.get('sha');
      const records = repository.deployments
        .filter((deployment) => !sha || deployment.sha === sha)
        .map(({ statuses, ...deployment }) => deployment)
        .reverse();
      return reply(200, records);
    }
    if ((parts = rest.match(/^\/deployments\/(\d+)\/statuses$/)) && method === 'GET') {
      const deployment = repository.deployments.find((candidate) => candidate.id === Number(parts[1]));
      return deployment ? reply(200, [...deployment.statuses].reverse()) : notFound();
    }
    if ((parts = rest.match(/^\/compare\/([0-9a-f]{40})\.\.\.([0-9a-f]{40})$/)) && method === 'GET') {
      const status = parts[1] === parts[2] ? 'identical' : this.isAncestor(repository, parts[1], parts[2]) ? 'ahead' : 'diverged';
      return reply(200, { status });
    }

    return reply(404, { message: `Unhandled fixture route: ${method} ${rest}` });
  }
}

// ---- handler harness ------------------------------------------------------

export function captureResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    status(value) { this.statusCode = value; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(value) { this.body = value; },
  };
}

// Calls a Vercel-style handler directly, bypassing the browser client.
export async function invoke(handler, { key, headers, body, method = 'POST' } = {}) {
  const response = captureResponse();
  await handler({
    method,
    headers: headers === undefined ? (key === undefined ? {} : { 'x-publisher-key': key }) : headers,
    body,
  }, response);
  let payload = null;
  try { payload = JSON.parse(response.body); } catch { /* leave null */ }
  return { status: response.statusCode, payload, text: String(response.body) };
}

// Points the handlers at a fixture boundary with dummy credentials, then
// restores the process environment and global fetch.
export async function withPublisherEnvironment({ fetch, environment = {} }, operation) {
  const names = ['PUBLISHER_ACCESS_KEY', 'GITHUB_TOKEN', 'GITHUB_API_URL', 'PUBLISHER_REPOSITORIES', 'PUBLISHER_REPOSITORY', 'VERCEL_AUTOMATION_BYPASS_SECRET'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  for (const name of names) delete process.env[name];
  Object.assign(process.env, { GITHUB_API_URL: 'https://fake-github.test' });
  for (const [name, value] of Object.entries(environment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  globalThis.fetch = fetch;
  try {
    return await operation();
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}
