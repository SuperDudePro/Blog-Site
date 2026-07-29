import { requirePublisher } from '../../lib/auth.mjs';
import { repoRequest } from '../../lib/github.mjs';
import { json, method } from '../../lib/http.mjs';
import { jobFromPullRequest, newestPublishingJob } from '../../lib/publishingJobs.mjs';
import { SITE_PROFILES } from '../../siteProfiles.mjs';

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }

  try {
    const results = await Promise.all(SITE_PROFILES.map(async ({ repository }) => {
      const pulls = await repoRequest(repository, '/pulls?state=all&sort=updated&direction=desc&per_page=20');
      return pulls.map((pullRequest) => jobFromPullRequest(repository, pullRequest)).filter(Boolean);
    }));
    return json(response, 200, { ok: true, job: newestPublishingJob(results.flat()) });
  } catch (error) {
    console.error('[publish/resume] failed', { message: error.message, code: error.code, details: error.details });
    return json(response, error.status || 400, { error: error.message, code: error.code, details: error.details });
  }
}
