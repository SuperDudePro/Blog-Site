const HTML_ENTITIES = new Map([
  ['amp', '&'],
  ['apos', "'"],
  ['#39', "'"],
  ['#x27', "'"],
  ['quot', '"'],
  ['lt', '<'],
  ['gt', '>'],
]);

function decodeHtml(value) {
  return String(value || '').replace(/&([a-z]+|#\d+|#x[0-9a-f]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (HTML_ENTITIES.has(normalized)) return HTML_ENTITIES.get(normalized);
    if (normalized.startsWith('#x')) return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    if (normalized.startsWith('#')) return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    return match;
  });
}

const normalizeText = (value) => decodeHtml(value).replace(/\s+/g, ' ').trim().toLowerCase();

export function canonicalUrlsMatch(actual, expected) {
  try {
    const normalize = (value) => {
      const url = new URL(decodeHtml(value));
      url.hash = '';
      url.hostname = url.hostname.toLowerCase();
      url.protocol = url.protocol.toLowerCase();
      if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
      return url.toString();
    };
    return normalize(actual) === normalize(expected);
  } catch {
    return false;
  }
}

// ---- Which preview may receive the deployment-protection bypass credential --
//
// Only one that GitHub's deployment records tie to the intended Vercel project
// and to the pull request's head commit. Those records can be written only by
// an actor with write access to the repository, and the ones accepted here
// must come from the Vercel GitHub App itself. A pull-request comment, which
// anyone can post on a public repository, and the shape of a hostname
// establish nothing.
const fromVercelApp = (record) => record?.creator?.login === 'vercel[bot]' && record?.creator?.type === 'Bot';
const newestFirst = (a, b) => Date.parse(b?.created_at || 0) - Date.parse(a?.created_at || 0);

// Vercel labels a preview "Preview – <project>" when several projects deploy
// from one repository, and plain "Preview" when only one does.
function previewScope(environment, project) {
  if (environment === `Preview – ${project}`) return 'project';
  if (environment === 'Preview') return 'repository';
  return '';
}

function previewOrigin(value, project, scope) {
  let url;
  try {
    url = new URL(String(value || ''));
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  // Necessary, never sufficient: anyone can deploy to a vercel.app name.
  if (!url.hostname.endsWith('.vercel.app')) return null;
  // The plain label does not name a project, so the deployment hostname must.
  if (scope === 'repository' && !url.hostname.startsWith(`${project}-`)) return null;
  return url.origin;
}

// Returns the origin of the verified preview for `commit`, or null while the
// evidence is missing. `request` reads the target repository's GitHub API.
export async function findVerifiedPreview({ commit, project, request }) {
  if (!/^[0-9a-f]{40}$/i.test(String(commit || '')) || !project) return null;
  const deployments = await request(`/deployments?sha=${commit}&per_page=100`);
  const candidates = (Array.isArray(deployments) ? deployments : [])
    .filter((deployment) => (
      deployment?.sha === commit
      && Number.isSafeInteger(deployment.id)
      && deployment.production_environment !== true
      && fromVercelApp(deployment)
      && previewScope(deployment.environment, project)
    ))
    .sort(newestFirst);
  for (const deployment of candidates) {
    const statuses = await request(`/deployments/${deployment.id}/statuses?per_page=100`);
    // GitHub marks a superseded deployment inactive; the preview itself stays up.
    const current = (Array.isArray(statuses) ? statuses : [])
      .filter(fromVercelApp)
      .sort(newestFirst)
      .find((status) => status.state !== 'inactive');
    if (current?.state !== 'success') continue;
    const origin = previewOrigin(current.environment_url, project, previewScope(deployment.environment, project));
    if (origin) return origin;
  }
  return null;
}

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

// Returns a fetchText(url) bound to one verified preview origin. It refuses
// any other origin without sending anything, and it follows redirects itself:
// an automatically followed redirect re-sends custom request headers, so the
// preview could otherwise hand the credential to any host it names.
export function createPreviewFetcher(origin, { secret = '', send = (url, options) => fetch(url, options), maxRedirects = 5 } = {}) {
  return async function fetchText(url) {
    let target = new URL(url);
    for (let hop = 0; hop <= maxRedirects; hop += 1) {
      if (target.origin !== origin) {
        throw new Error(`Refused to contact ${target.host}: it is not the verified preview deployment.`);
      }
      const result = await send(target.toString(), {
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(25000),
        headers: {
          'cache-control': 'no-cache',
          ...(secret ? { 'x-vercel-protection-bypass': secret } : {}),
        },
      });
      const location = REDIRECT_STATUS.has(result.status) ? result.headers.get('location') : null;
      if (!location) return { result, body: await result.text() };
      target = new URL(location, target);
    }
    throw new Error('The verified preview redirected too many times.');
  };
}

export async function inspectPublishedUrl({
  url,
  canonicalUrl,
  title,
  fetchText,
  attempts = 3,
  wait = () => Promise.resolve(),
  requireStaticMetadata = true,
}) {
  let last = { ok: false, status: 0, error: 'Preview verification did not run.' };
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const { result, body } = await fetchText(url);
      const inspection = inspectPublishedHtml(body, canonicalUrl, title, { requireStaticMetadata });
      last = result.ok && inspection.ok
        ? { ok: true, status: result.status }
        : {
            ok: false,
            status: result.status,
            error: result.ok ? inspection.error : `Preview route returned HTTP ${result.status}.`,
          };
    } catch (error) {
      last = { ok: false, status: 0, error: error.message };
    }
    if (last.ok) return last;
    if (attempt < attempts - 1) await wait();
  }
  return last;
}

export function inspectPublishedHtml(body, canonicalUrl, title, { requireStaticMetadata = true } = {}) {
  const html = String(body || '');
  if (!/<html[\s>]/i.test(html)) return { ok: false, error: 'The route did not return an HTML document.' };

  if (!requireStaticMetadata) return { ok: true };

  const canonicalPattern = /<link\b[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/gi;
  const canonicalTags = html.match(canonicalPattern) || [];
  const canonicalMatches = canonicalTags.some((tag) => {
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    return href && canonicalUrlsMatch(href, canonicalUrl);
  });
  if (!canonicalMatches) return { ok: false, error: 'The route does not declare the expected canonical URL.' };

  const normalizedTitle = normalizeText(title);
  const declaredTitles = [
    decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim(),
    decodeHtml(html.match(/["']headline["']\s*:\s*["']([^"']+)["']/i)?.[1] || '').trim(),
    decodeHtml(html.match(/<meta\b[^>]*(?:property|name)=["'](?:og|twitter):title["'][^>]*content=["']([^"']+)["']/i)?.[1] || '').trim(),
  ].filter(Boolean);
  if (!declaredTitles.length) {
    return { ok: false, error: 'The canonical post route does not declare a page title.' };
  }
  if (normalizedTitle && !declaredTitles.some((candidate) => normalizeText(candidate).includes(normalizedTitle))) {
    return { ok: false, error: 'The route does not declare the expected post title.' };
  }

  return { ok: true };
}

export function deployedCommitIsReady(mergeCommit, deployedCommit, comparisonStatus) {
  if (!/^[0-9a-f]{40}$/i.test(String(mergeCommit)) || !/^[0-9a-f]{40}$/i.test(String(deployedCommit))) return false;
  if (mergeCommit === deployedCommit) return true;
  return comparisonStatus === 'ahead' || comparisonStatus === 'identical';
}

const text = (value) => String(value ?? '').trim();

function pullRequestNumber(value) {
  const direct = Number(value);
  if (Number.isInteger(direct) && direct > 0) return direct;
  const match = text(value).match(/\/pull\/(\d+)(?:\/|$)/);
  return match ? Number(match[1]) : 0;
}

export function normalizeStatusRequest(payload = {}) {
  const handoff = payload.handoff && typeof payload.handoff === 'object' ? payload.handoff : {};
  const manifest = payload.manifest && typeof payload.manifest === 'object' ? payload.manifest : {};
  return {
    repository: text(payload.repository || handoff.repository || manifest.repository),
    prNumber: pullRequestNumber(
      payload.prNumber
      || payload.pullRequest
      || payload.pullRequestNumber
      || payload.prUrl
      || handoff.prNumber
      || handoff.pullRequest
      || handoff.pullRequestNumber
      || handoff.prUrl,
    ),
    commit: text(
      payload.commit
      || payload.commitSha
      || payload.sha
      || handoff.commit
      || handoff.commitSha
      || handoff.sha,
    ),
    canonicalUrl: text(
      payload.canonicalUrl
      || payload.canonicalURL
      || handoff.canonicalUrl
      || handoff.canonicalURL
      || manifest.canonicalUrl
      || manifest.canonicalURL,
    ),
    title: text(payload.title || handoff.title || manifest.title),
  };
}

export function missingStatusFields(request) {
  return [
    !request.prNumber && 'pull request',
    !request.commit && 'commit',
    !request.canonicalUrl && 'canonical URL',
    !request.title && 'title',
  ].filter(Boolean);
}

export function activePullRequestCommit(pullRequest, handoffCommit) {
  return String(pullRequest?.head?.sha || handoffCommit || '');
}
