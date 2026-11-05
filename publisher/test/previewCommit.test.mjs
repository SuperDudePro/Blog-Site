import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectPreviewCommit, directTechnicalReadiness } from '../lib/previewCommit.mjs';

const sha = 'a'.repeat(40);
const host = 'https://blog-site-test-branch.vercel.app';

test('direct preview confirms deployment marker equals current PR commit', async () => {
  const calls = [];
  const result = await inspectPreviewCommit({
    deploymentUrl: host,
    commitSha: sha,
    fetchText: async (url) => {
      calls.push(url);
      return { result: { ok: true, status: 200 }, body: JSON.stringify({ commit: sha }) };
    },
  });
  assert.equal(result.state, 'success');
  assert.equal(calls.length, 1);
  assert.match(calls[0], /deployment\.json\?publisher_verify=/);
});

test('stale preview, protected login page, and non-Vercel host cannot authorize a direct handoff', async () => {
  for (const [url, body] of [
    [host, JSON.stringify({ commit: 'b'.repeat(40) })],
    [host, '<html>Vercel Authentication</html>'],
    ['https://untrusted.example.org', JSON.stringify({ commit: sha })],
  ]) {
    const r = await inspectPreviewCommit({
      deploymentUrl: url,
      commitSha: sha,
      fetchText: async () => ({ result: { ok: true, status: 200 }, body }),
    });
    assert.equal(r.state, 'failed');
  }
});

test('pending preview or failed byte verification keeps direct publishing technical readiness false', () => {
  assert.equal(directTechnicalReadiness(true, { state: 'success' }, { state: 'pending' }), false);
  assert.equal(directTechnicalReadiness(true, { state: 'failed' }, { state: 'success' }), false);
  assert.equal(directTechnicalReadiness(true, { state: 'success' }, { state: 'success' }), true);
  assert.equal(directTechnicalReadiness(false), true);
});
