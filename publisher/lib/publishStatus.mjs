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

const vercelUrls = (value) => (
  String(value || '').match(/https:\/\/[a-z0-9.-]+\.vercel\.app(?:\/[a-zA-Z0-9_./?=&%#-]*)?/gi) || []
).filter((candidate) => !candidate.includes('vercel.live'));

export function findVercelUrl(comments, deploymentProject = '') {
  const newestFirst = [...comments].reverse();
  if (deploymentProject) {
    const projectLink = `[${deploymentProject}](`.toLowerCase();
    for (const comment of newestFirst) {
      const rows = String(comment.body || '').split(/\r?\n/);
      const projectRow = rows.find((row) => row.toLowerCase().includes(projectLink));
      const url = vercelUrls(projectRow)[0];
      if (url) return url.replace(/[)>.,]+$/, '');
    }
  }
  for (const comment of newestFirst) {
    const url = vercelUrls(comment.body)[0];
    if (url) return url.replace(/[)>.,]+$/, '');
  }
  return null;
}

export async function inspectPublishedUrl({
  url,
  canonicalUrl,
  title,
  fetchText,
  attempts = 3,
  wait = () => Promise.resolve(),
}) {
  let last = { ok: false, status: 0, error: 'Preview verification did not run.' };
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const { result, body } = await fetchText(url);
      const inspection = inspectPublishedHtml(body, canonicalUrl, title);
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

export function inspectPublishedHtml(body, canonicalUrl, title) {
  const html = String(body || '');
  if (!/<html[\s>]/i.test(html)) return { ok: false, error: 'The route did not return an HTML document.' };

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
