import assert from 'node:assert/strict';
import test from 'node:test';
import { jobFromPullRequest, newestPublishingJob } from '../lib/publishingJobs.mjs';

const pull = (overrides = {}) => ({
  number: 26,
  html_url: 'https://github.com/SuperDudePro/LifeEducationOrg/pull/26',
  title: 'Update Domain 10: Life Skills & Project Execution',
  body: `- Site profile: **LifeEducation**
- Slug: \`domain-10-life-skills-project-execution\`
- Destination: \`src/content/posts/domain-10-life-skills-project-execution\`
- Canonical URL: https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution`,
  state: 'closed',
  merged_at: '2026-07-29T18:00:00Z',
  updated_at: '2026-07-29T18:01:00Z',
  head: { ref: 'publisher/domain-10-life-skills-project-execution-1785360813309', sha: 'a'.repeat(40) },
  base: { ref: 'main' },
  ...overrides,
});

test('reconstructs a durable publisher job from its GitHub pull request', () => {
  const job = jobFromPullRequest('SuperDudePro/LifeEducationOrg', pull());
  assert.equal(job.handoff.prNumber, 26);
  assert.equal(job.handoff.title, 'Domain 10: Life Skills & Project Execution');
  assert.equal(job.manifest.canonicalUrl, 'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution');
  assert.equal(job.state, 'merged');
});

test('ignores pull requests that were not created by Publisher', () => {
  assert.equal(jobFromPullRequest('SuperDudePro/LifeEducationOrg', pull({ head: { ref: 'feature/domain-10', sha: 'a'.repeat(40) } })), null);
});

test('prefers an open job before a more recently updated merged job', () => {
  const merged = jobFromPullRequest('SuperDudePro/LifeEducationOrg', pull());
  const open = jobFromPullRequest('SuperDudePro/Blog-Site', pull({
    number: 70,
    state: 'open',
    merged_at: null,
    updated_at: '2026-07-28T18:01:00Z',
    head: { ref: 'publisher/another-post-1', sha: 'b'.repeat(40) },
  }));
  assert.equal(newestPublishingJob([merged, open]).handoff.prNumber, 70);
});
