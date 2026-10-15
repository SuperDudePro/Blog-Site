import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/resend-inbound.js';

test('oversized inbound webhook is rejected before any outbound request', async () => {
  const before = {
    key: process.env.RESEND_API_KEY,
    secret: process.env.RESEND_WEBHOOK_SECRET,
    forward: process.env.INBOUND_FORWARD_TO,
    fetch: globalThis.fetch,
  };
  process.env.RESEND_API_KEY = 'test-not-real';
  process.env.RESEND_WEBHOOK_SECRET = 'whsec_dGVzdA==';
  process.env.INBOUND_FORWARD_TO = 'audit@example.com';
  let requested = false;
  globalThis.fetch = async () => { requested = true; throw new Error('Network request should not occur'); };
  try {
    const request = {
      method: 'POST',
      headers: {},
      async *[Symbol.asyncIterator]() { yield Buffer.alloc(1_048_577, 'x'); },
    };
    const response = {
      code: 200,
      setHeader() {},
      status(code) { this.code = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await handler(request, response);
    assert.equal(response.code, 413);
    assert.equal(response.body.ok, false);
    assert.equal(requested, false);
  } finally {
    for (const [key, value] of [['RESEND_API_KEY', before.key], ['RESEND_WEBHOOK_SECRET', before.secret], ['INBOUND_FORWARD_TO', before.forward]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    globalThis.fetch = before.fetch;
  }
});
