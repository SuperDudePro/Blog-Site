// A publishing pull request belongs to a site only when its head branch
// lives in that site's repository. A fork can copy the branch name, the
// description, and the files; GitHub reports a deleted fork as
// `head.repo: null`. Neither may become a Publisher job or pass as a
// same-repository handoff, in the Publisher or in the CI gate.
import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublishingPullRequest } from '../../scripts/validate-publishing-pr.mjs';
import directVerifyHandler from '../api/publish/direct-verify.mjs';
import resumeHandler from '../api/publish/resume.mjs';
import { jobFromPullRequest, pullRequestIsFromRepository } from '../lib/publishingJobs.mjs';
import { FakeGitHub, checkoutCommit, invoke, withPublisherEnvironment } from '../test-support/fakeGitHub.mjs';
import { LIFE, OOD, directHandoffBody, directHandoffFiles, publishingFixture, siteRepositoryFiles } from '../test-support/publishingFixture.mjs';

const KEY = 'dummy-publisher-key';
const environment = { PUBLISHER_ACCESS_KEY: KEY, GITHUB_TOKEN: 'dummy-github-token' };
const post = (handler, body) => invoke(handler, { key: KEY, body });
const run = (github, operation) => withPublisherEnvironment({ fetch: github.fetch.bind(github), environment }, operation);

// Who a pull request's head can belong to. `undefined` is the site
// repository itself; the others are a live fork and a deleted fork.
const FORKS = [['a live fork', 'outsider/Blog-Site'], ['a deleted fork', null]];

function world() {
  const github = new FakeGitHub();
  github.addRepository(OOD, { files: siteRepositoryFiles(OOD) });
  github.addRepository(LIFE, { files: siteRepositoryFiles(LIFE) });
  return github;
}

// Stages a complete, valid direct handoff. With `headRepository` set, the
// identical commit and description are offered from a fork instead.
function directHandoff(github, kind, slug, { headRepository } = {}) {
  const fixture = publishingFixture(kind, slug);
  const { manifest } = fixture;
  const repository = manifest.repository;
  const branch = `publisher/${slug}`;
  const main = github.head(repository, 'main');
  const files = directHandoffFiles(fixture, github.files(repository, main)['public/sitemap.xml']);
  const commit = headRepository === undefined
    ? github.push(repository, branch, { files })
    : github.writeCommit(repository, { files, parents: [main] });
  const pull = github.openPullRequest(repository, {
    head: branch,
    headRepository,
    headSha: commit,
    title: `Publish ${manifest.title}`,
    body: directHandoffBody(fixture),
  });
  return { fixture, repository, commit, pull };
}

test('only a head branch in the site repository makes a Publisher job', () => {
  for (const kind of ['ood', 'life']) {
    const github = world();
    const { repository, pull } = directHandoff(github, kind, 'identity-check');
    const head = (repo) => ({ ...pull, head: { ...pull.head, repo } });

    const job = jobFromPullRequest(repository, pull);
    assert.equal(job?.handoff.prNumber, pull.number, `${kind}: a genuine job is preserved`);
    assert.equal(job.handoffMethod, 'direct-github');
    // GitHub repository names are case-insensitive.
    assert.equal(jobFromPullRequest(repository, head({ full_name: repository.toUpperCase() }))?.handoff.prNumber, pull.number);

    const foreign = {
      'a live fork': { full_name: 'outsider/Blog-Site' },
      'a deleted fork': null,
      'no head repository reported': undefined,
      'a head repository without a name': {},
      'the other site repository': { full_name: repository === OOD ? LIFE : OOD },
      'a name that only starts like the site repository': { full_name: `${repository}-fork` },
    };
    for (const [label, repo] of Object.entries(foreign)) {
      assert.equal(pullRequestIsFromRepository(head(repo), repository), false, `${kind}: ${label}`);
      assert.equal(jobFromPullRequest(repository, head(repo)), null, `${kind}: ${label} became a job`);
    }
  }
});

test('resume lists the site\'s own jobs and never a fork\'s pull request', async () => {
  const github = world();
  const result = await run(github, async () => {
    const ood = directHandoff(github, 'ood', 'genuine-ood');
    const life = directHandoff(github, 'life', 'genuine-life');
    for (const [, headRepository] of FORKS) {
      directHandoff(github, 'ood', `forked-${headRepository ? 'live' : 'deleted'}`, { headRepository });
      directHandoff(github, 'life', `forked-${headRepository ? 'live' : 'deleted'}`, { headRepository: headRepository && 'outsider/LifeEducationOrg' });
    }
    const resumed = await post(resumeHandler, {});
    assert.equal(resumed.status, 200, resumed.text);
    assert.deepEqual(
      resumed.payload.recoverableJobs.map((job) => job.jobKey).sort(),
      [`${OOD}#${ood.pull.number}`, `${LIFE}#${life.pull.number}`].sort(),
    );
    // A fork's pull request cannot be requested by key either.
    const forked = github.pulls(OOD).find((pull) => pull.head.repo === null);
    const requested = await post(resumeHandler, { job: `${OOD}#${forked.number}` });
    assert.equal(requested.payload.job, null);
    return resumed;
  });
  assert.match(result.payload.recoveryError, /Multiple active publishing jobs/);
});

test('a fork\'s pull request is never restored as the single active job', async () => {
  for (const [label, headRepository] of FORKS) {
    const github = world();
    const resumed = await run(github, async () => {
      directHandoff(github, 'ood', 'only-a-fork', { headRepository });
      return post(resumeHandler, {});
    });
    assert.equal(resumed.status, 200, resumed.text);
    assert.equal(resumed.payload.job, null, `${label} was restored as the owner's job`);
    assert.deepEqual(resumed.payload.recoverableJobs, [], label);
  }
});

test('the direct-handoff verifier accepts the site\'s own branch and refuses the same content from a fork', async () => {
  for (const kind of ['ood', 'life']) {
    const github = world();
    const verified = await run(github, async () => {
      const { repository, pull } = directHandoff(github, kind, 'verified-handoff');
      return post(directVerifyHandler, { repository, prNumber: pull.number });
    });
    assert.equal(verified.status, 200, verified.text);
    assert.equal(verified.payload.ok, true, verified.text);
    assert.deepEqual(verified.payload.errors, []);
  }
  for (const [label, headRepository] of [...FORKS].reverse()) {
    const github = world();
    const refused = await run(github, async () => {
      const { repository, pull } = directHandoff(github, 'ood', 'forked-handoff', { headRepository });
      return post(directVerifyHandler, { repository, prNumber: pull.number });
    });
    assert.equal(refused.status, 400, `${label}: ${refused.text}`);
    assert.notEqual(refused.payload.ok, true, label);
    assert.match(refused.payload.error, /does not come from SuperDudePro\/Blog-Site/, label);
    assert.deepEqual(github.requests.filter((request) => request.path.includes('/git/')), [], `${label}: fork content was read`);
  }
});

test('the CI gate passes the site\'s own handoff and fails the same pull request from a fork', (t) => {
  for (const kind of ['ood', 'life']) {
    const github = world();
    const { repository, commit, pull } = directHandoff(github, kind, 'gated-handoff');
    const root = checkoutCommit(t, github, repository, commit);
    const event = github.pullRequestEvent(repository, pull.number);
    const genuine = checkPublishingPullRequest(event, { root });
    assert.equal(genuine.skipped, false);
    assert.deepEqual(genuine.errors, [], `${kind}: a genuine handoff is preserved`);

    const heads = {
      'a live fork': { full_name: `outsider/${repository.split('/')[1]}` },
      'a deleted fork': null,
      'no head repository reported': undefined,
    };
    for (const [label, repo] of Object.entries(heads)) {
      const forked = structuredClone(event);
      forked.pull_request.head.repo = repo;
      const result = checkPublishingPullRequest(forked, { root });
      assert.equal(result.skipped, false, `${kind} / ${label}`);
      assert.match(result.errors.join('\n'), /branch (?:in|from) the target repository/, `${kind} / ${label} passed the gate`);
    }
  }
});
