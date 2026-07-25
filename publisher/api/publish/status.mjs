import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { validateRepository } from '../../lib/validation.mjs';

const failedConclusions = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'stale', 'startup_failure']);
function findVercelUrl(comments) {
  for (const comment of comments) {
    const matches = String(comment.body || '').match(/https:\/\/[a-z0-9.-]+\.vercel\.app(?:\/[a-zA-Z0-9_./?=&%#-]*)?/gi) || [];
    const url = matches.find((candidate) => !candidate.includes('vercel.live'));
    if (url) return url.replace(/[)>.,]+$/, '');
  }
  return null;
}

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    const { repository, prNumber, commit, canonicalUrl } = await readJson(request);
    validateRepository(repository);
    if (!prNumber || !commit || !canonicalUrl) throw new Error('Pull request, commit, and canonical URL are required.');
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
        const result = await fetch(smokeUrl, { redirect: 'follow', signal: AbortSignal.timeout(25000) });
        const body = await result.text();
        smoke = result.ok && /<html/i.test(body)
          ? { state: 'success', ok: true, status: result.status, smokeUrl }
          : { state: checks.state === 'success' ? 'failed' : 'pending', ok: false, status: result.status, smokeUrl, error: `Preview route returned HTTP ${result.status}.` };
      } catch (error) {
        smoke = { state: checks.state === 'success' ? 'failed' : 'pending', ok: false, smokeUrl, error: error.message };
      }
    }
    const merged = Boolean(pullRequest.merged || pullRequest.merged_at);
    return json(response, 200, {
      ok: true,
      checks,
      deploymentUrl,
      smoke,
      readyToMerge: !merged && checks.state === 'success' && Boolean(deploymentUrl) && smoke.state === 'success',
      merged,
      mergedAt: pullRequest.merged_at || null,
      prState: pullRequest.state || null,
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
