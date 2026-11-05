import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/publish/preflight.mjs';

const oldKey = process.env.PUBLISHER_ACCESS_KEY;
test.after(() => {
  if (oldKey === undefined) delete process.env.PUBLISHER_ACCESS_KEY;
  else process.env.PUBLISHER_ACCESS_KEY = oldKey;
});

async function request(body, key = 'fixture-key') {
  const response = {
    statusCode: 0,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(value) { this.body = JSON.parse(value); },
  };
  await handler({ method: 'POST', headers: { 'x-publisher-key': key }, body }, response);
  return response;
}

test('rejects unauthenticated preflight', async () => {
  process.env.PUBLISHER_ACCESS_KEY = 'fixture-key';
  const result = await request({}, 'wrong-key');
  assert.equal(result.statusCode, 401);
});

test('collects multiple defects without touching GitHub', async () => {
  process.env.PUBLISHER_ACCESS_KEY = 'fixture-key';
  const oldToken = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;
  try {
    const result = await request({
      manifest: { repository: 'SuperDudePro/Blog-Site', slug: 'Valid-But-Uppercase', images: [] },
      preflight: { productionPaths: [], sourceFiles: {}, imageMetadata: [] },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.ok, false);
    assert.ok(result.body.errors.length > 2);
    assert.ok(result.body.errors.some(error => /Slug must be lowercase/.test(error)));
  } finally {
    if (oldToken !== undefined) process.env.GITHUB_TOKEN = oldToken;
  }
});

test('does not mistake malformed preflight for an approval', async () => {
  process.env.PUBLISHER_ACCESS_KEY = 'fixture-key';
  const result = await request({});
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ok, false);
  assert.ok(result.body.errors.length > 0);
});
