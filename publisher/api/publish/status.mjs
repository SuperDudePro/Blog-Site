import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { validateRepository } from '../../lib/validation.mjs';
import { getSiteProfile } from '../../siteProfiles.mjs';
import { deployedCommitIsReady, findVercelUrl, inspectPublishedHtml } from '../../lib/publishStatus.mjs';

const failedConclusions = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'stale', 'startup_failure']);

async function fetchText(url) {
  const result = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
    headers: { 'cache-control': 'no-cache' },
  });
  return { result, body: await result.text() };
}

async function productionStatus(repository, canonicalUrl, title, mergeCommit) {
  const marker = new URL('/deployment.json', canonicalUrl);
  marker.searchParams.set('publisher_verify', mergeCommit || 'pending');
  const markerUrl = marker.toString();
  try {
    const markerResponse = await fetch(markerUrl, {
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
      headers: { 'cache-control': 'no-cache' },
    });
    if (!markerResponse.ok) {
      return { state: 'pending', ok: false, markerUrl, status: markerResponse.status, error: 'Waiting for the production deployment marker.' };
    }
    const marker = await markerResponse.json();
    const deployedCommit = String(marker?.commit || '');
    let comparisonStatus = null;
    if (/^[0-9a-f]{40}$/i.test(mergeCommit) && /^[0-9a-f]{40}$/i.test(deployedCommit) && mergeCommit !== deployedCommit) {
      try {
        const comparison = await repoRequest(repository, `/compare/${mergeCommit}...${deployedCommit}`);
        comparisonStatus = comparison.status || null;
      } catch {
        comparisonStatus = null;
      }
    }
    if (!deployedCommitIsReady(mergeCommit, deployedCommit, comparisonStatus)) {
      return { state: 'pending', ok: false, markerUrl, deployedCommit, mergeCommit, error: 'Waiting for the merged commit to reach production.' };
    }

    const separator = canonicalUrl.includes('?') ? '&' : '?';
    const smokeUrl = `${canonicalUrl}${separator}publisher_verify=${encodeURIComponent(mergeCommit)}`;
    const { result, body } = await fetchText(smokeUrl);
    if (!result.ok) {
      return { state: 'failed', ok: false, markerUrl, deployedCommit, mergeCommit, smokeUrl, status: result.status, error: `Production route returned HTTP ${result.status}.` };
    }
    const inspection = inspectPublishedHtml(body, canonicalUrl, title);
    return inspection.ok
      ? { state: 'success', ok: true, markerUrl, deployedCommit, mergeCommit, smokeUrl: canonicalUrl, status: result.status }
      : { state: 'failed', ok: false, markerUrl, deployedCommit, mergeCommit, smokeUrl: canonicalUrl, status: result.status, error: inspection.error };
  } catch (error) {
    return { state: 'pending', ok: false, markerUrl, mergeCommit, error: error.message };
  }
}

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    const { repository, prNumber, commit, canonicalUrl, title } = await readJson(request);
    validateRepository(repository);
    const profile = getSiteProfile({ repository });
    if (!prNumber || !commit || !canonicalUrl || !title) throw new Error('Pull request, commit, canonical URL, and title are required.');
    if (!canonicalUrl.startsWith(profile.canonicalPrefix)) throw new Error('Canonical URL does not match the selected site profile.');
    const [checkRuns, combinedStatus, comments, pullRequest] = await Promise.all([
      repoRequest(repository, `/commits/${commit}/check-runs?per_page=100`, { headers: { accept: 'application/vnd.github+json' } }),
      repoRequest(repository, `/commits/${commit}/status`),
      repoRequest(repository, `/issues/${prNumber}/comments?per_page=100`),
      repoRequest(repository, `/pulls/${prNumber}`),
    ]);
    const items = [
      ...(checkRuns.check_runs || []).map((item) => ({ name: item.name, source: item.app?.name || 'GitHub', status: item.status, conclusion: item.conclusion, url: item.html_url })),
      ...(combinedStatus.statuses || []).map((item) => ({ name: item.context, source: 'Commit status', status: item.state, conclusion: item.state === 'success' ? 'success' : item.state === 'pending' ? null : item.state, url: item.target_url })),
    ];
    const failed = items.some((item) => failedConclusions.has(item.conclusion) || ['failure', 'error'].includes(item.status));
    const complete = items.length > 0 && items.every((item) => item.conclusion === 'success' || item.status === 'success');
    const checks = { state: failed ? 'failed' : complete ? 'success' : 'pending', items };
    const deploymentUrl = findVercelUrl(comments);
    let smoke = { state: 'pending', ok: false };
    if (deploymentUrl) {
      const pathname = new URL(canonicalUrl).pathname;
      const smokeUrl = new URL(pathname, deploymentUrl).toString();
      try {
        const { result, body } = await fetchText(smokeUrl);
        const inspection = inspectPublishedHtml(body, canonicalUrl, title);
        smoke = result.ok && inspection.ok
          ? { state: 'success', ok: true, status: result.status, smokeUrl }
          : { state: checks.state === 'success' ? 'failed' : 'pending', ok: false, status: result.status, smokeUrl, error: result.ok ? inspection.error : `Preview route returned HTTP ${result.status}.` };
      } catch (error) {
        smoke = { state: checks.state === 'success' ? 'failed' : 'pending', ok: false, smokeUrl, error: error.message };
      }
    }
    const merged = Boolean(pullRequest.merged || pullRequest.merged_at);
    const mergeCommit = pullRequest.merge_commit_sha || null;
    const production = merged
      ? await productionStatus(repository, canonicalUrl, title, mergeCommit)
      : { state: 'pending', ok: false };
    return json(response, 200, {
      ok: true,
      checks,
      deploymentUrl,
      smoke,
      readyToMerge: !merged && checks.state === 'success' && Boolean(deploymentUrl) && smoke.state === 'success',
      merged,
      mergedAt: pullRequest.merged_at || null,
      mergeCommit,
      production,
      publishingComplete: merged && production.state === 'success',
      prState: pullRequest.state || null,
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
