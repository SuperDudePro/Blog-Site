import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findPublishingPullRequest,
  jobFromPullRequest,
  newestPublishingJob,
  publishingJobKey,
  selectRecoverableJob,
  selectPublishingJob,
} from '../lib/publishingJobs.mjs';

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
  assert.equal(publishingJobKey(merged), 'SuperDudePro/LifeEducationOrg#26');
  assert.equal(selectPublishingJob([open, merged], 'SuperDudePro/LifeEducationOrg#26').handoff.prNumber, 26);
});

test('recovers one existing open pull request by deterministic branch or legacy slug', () => {
  const pulls = [
    {
      number: 10,
      state: 'open',
      head: { ref: 'publisher/adaptive-test' },
      body: '- Slug: `adaptive-test`',
    },
    {
      number: 9,
      state: 'open',
      head: { ref: 'publisher/adaptive-test-1785000000000' },
      body: '- Slug: `adaptive-test`',
    },
  ];
  assert.equal(findPublishingPullRequest(pulls, {
    slug: 'adaptive-test',
    branch: 'publisher/adaptive-test',
  })?.number, 10);
  assert.equal(findPublishingPullRequest(pulls.slice(1), {
    slug: 'adaptive-test',
    branch: 'publisher/adaptive-test',
  })?.number, 9);
});

test('does not recover closed or non-Publisher pull requests', () => {
  assert.equal(findPublishingPullRequest([
    { state: 'closed', head: { ref: 'publisher/adaptive-test' }, body: '- Slug: `adaptive-test`' },
    { state: 'open', head: { ref: 'fix/adaptive-test' }, body: '- Slug: `adaptive-test`' },
  ], { slug: 'adaptive-test', branch: 'publisher/adaptive-test' }), null);
});

test('refresh recovery never guesses between active jobs from different sites', () => {
  const life = jobFromPullRequest('SuperDudePro/LifeEducationOrg', pull({
    state: 'open',
    merged_at: null,
  }));
  const ood = jobFromPullRequest('SuperDudePro/Blog-Site', pull({
    number: 70,
    state: 'open',
    merged_at: null,
    head: { ref: 'publisher/ood-post', sha: 'b'.repeat(40) },
  }));
  assert.equal(selectRecoverableJob([life, ood], ''), null);
  assert.equal(
    selectRecoverableJob([life, ood], 'SuperDudePro/Blog-Site#70')?.handoff.repository,
    'SuperDudePro/Blog-Site',
  );
});
