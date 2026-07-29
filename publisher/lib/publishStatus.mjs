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

export function findVercelUrl(comments) {
  for (const comment of comments) {
    const matches = String(comment.body || '').match(/https:\/\/[a-z0-9.-]+\.vercel\.app(?:\/[a-zA-Z0-9_./?=&%#-]*)?/gi) || [];
    const url = matches.find((candidate) => !candidate.includes('vercel.live'));
    if (url) return url.replace(/[)>.,]+$/, '');
  }
  return null;
}

export function inspectPublishedHtml(body, canonicalUrl, title) {
  const html = String(body || '');
  if (!/<html[\s>]/i.test(html)) return { ok: false, error: 'The route did not return an HTML document.' };

  const normalizedHtml = normalizeText(html);
  const normalizedTitle = normalizeText(title);
  if (normalizedTitle && !normalizedHtml.includes(normalizedTitle)) {
    return { ok: false, error: 'The route does not contain the expected post title.' };
  }

  const canonicalPattern = /<link\b[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/gi;
  const canonicalTags = html.match(canonicalPattern) || [];
  const canonicalMatches = canonicalTags.some((tag) => {
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    return href && decodeHtml(href) === canonicalUrl;
  });
  if (!canonicalMatches) return { ok: false, error: 'The route does not declare the expected canonical URL.' };

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
