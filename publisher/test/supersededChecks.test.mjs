import assert from 'node:assert/strict';
import test from 'node:test';
import statusHandler from '../api/publish/status.mjs';
import { FakeGitHub, invoke, withPublisherEnvironment } from '../test-support/fakeGitHub.mjs';
import { FakeWeb, routeFetch } from '../test-support/fakeWeb.mjs';

const repository = 'SuperDudePro/Blog-Site';
const key = 'dummy-publisher-key';
const check = (id, conclusion, overrides = {}) => ({
  id, name: 'validate', app: { id: 15368, name: 'GitHub Actions' },
  status: conclusion ? 'completed' : 'in_progress', conclusion, ...overrides,
});

async function inspect(checks) {
  const github = new FakeGitHub();
  github.addRepository(repository);
  const commit = github.push(repository, 'publisher/check-recovery');
  const pull = github.openPullRequest(repository, { head: 'publisher/check-recovery' });
  github.setCheckRuns(repository, commit, checks);
  const canonicalUrl = 'https://ourolddad.com/post/check-recovery';
  const origin = 'https://blog-site-check-recovery.vercel.app';
  github.addDeployment(repository, {
    sha: commit, environment: 'Preview – blog-site',
    statuses: [{ state: 'success', environment_url: origin }],
  });
  const web = new FakeWeb().site(origin, {
    '/post/check-recovery': `<html><head><title>Check recovery</title><link rel="canonical" href="${canonicalUrl}"></head></html>`,
  });
  return withPublisherEnvironment({
    fetch: routeFetch(github, web),
    environment: { PUBLISHER_ACCESS_KEY: key, GITHUB_TOKEN: 'dummy-token' },
  }, async () => {
    const result = await invoke(statusHandler, {
      key, body: { repository, prNumber: pull.number, commit, canonicalUrl, title: 'Check recovery' },
    });
    assert.equal(result.status, 200, result.text);
    return result.payload;
  });
}

test('successful replacement checks supersede cancelled runs in either API order', async () => {
  for (const runs of [[check(10, 'cancelled'), check(20, 'success')], [check(20, 'success'), check(10, 'cancelled')]]) {
    const result = await inspect(runs);
    assert.equal(result.checks.state, 'success');
    assert.equal(result.readyToMerge, true);
    assert.equal(result.checks.items.length, 1);
  }
});

test('replacement still running leaves readiness pending rather than failed', async () => {
  const result = await inspect([check(10, 'cancelled'), check(20, null)]);
  assert.equal(result.checks.state, 'pending');
  assert.equal(result.readyToMerge, false);
});

test('a newer failed replacement still blocks readiness', async () => {
  const result = await inspect([check(10, 'success'), check(20, 'failure')]);
  assert.equal(result.checks.state, 'failed');
  assert.equal(result.readyToMerge, false);
});

test('cancelled checks without a replacement still block readiness', async () => {
  const result = await inspect([check(10, 'cancelled')]);
  assert.equal(result.checks.state, 'failed');
  assert.equal(result.readyToMerge, false);
});

test('a successful check from another app cannot supersede a failure', async () => {
  const result = await inspect([check(10, 'failure'), check(20, 'success', { app: { id: 999, name: 'Other app' } })]);
  assert.equal(result.checks.state, 'failed');
  assert.equal(result.readyToMerge, false);
});

test('a differently named successful check cannot supersede a failure', async () => {
  const result = await inspect([check(10, 'failure'), check(20, 'success', { name: 'publisher' })]);
  assert.equal(result.checks.state, 'failed');
  assert.equal(result.readyToMerge, false);
});

test('missing check or app identity does not suppress an ambiguous failure', async () => {
  for (const broken of [{ id: undefined }, { app: { name: 'GitHub Actions' } }]) {
    const result = await inspect([check(10, 'failure', broken), check(20, 'success')]);
    assert.equal(result.checks.state, 'failed');
    assert.equal(result.readyToMerge, false);
  }
});
