import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method, readJson } from '../../lib/http.mjs';
import { jobFromPullRequest, publishingJobKey, selectRecoverableJob } from '../../lib/publishingJobs.mjs';
import { SITE_PROFILES } from '../../siteProfiles.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const { job: requestedJob = '' } = await readJson(request);
    const results = await Promise.all(SITE_PROFILES.map(async ({ repository }) => {
      const pulls = await repoRequest(repository, '/pulls?state=all&sort=updated&direction=desc&per_page=20');
      return pulls.map((pullRequest) => jobFromPullRequest(repository, pullRequest)).filter(Boolean);
    }));
    const jobs = results.flat();
    const activeJobs = jobs.filter((candidate) => candidate.state === 'open');
    const job = selectRecoverableJob(jobs, requestedJob);
    const recoveryError = !requestedJob && activeJobs.length > 1
      ? 'Multiple active publishing jobs exist. Resume from the job-specific Publisher URL instead of guessing which site or post is active.'
      : '';
    return json(response, 200, {
      ok: true,
      job,
      jobKey: publishingJobKey(job),
      recoveryError,
      recoverableJobs: jobs.map((candidate) => ({
        jobKey: publishingJobKey(candidate),
        title: candidate.manifest.title,
        repository: candidate.handoff.repository,
        prNumber: candidate.handoff.prNumber,
        state: candidate.state,
        updatedAt: candidate.updatedAt,
      })),
    });
  } catch (error) {
    console.error('[publish/resume] failed', { message: error.message, code: error.code, details: error.details });
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
