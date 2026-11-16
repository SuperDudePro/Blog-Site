import test from 'node:test';
import assert from 'node:assert/strict';
import subscribeHandler from '../api/subscribe.js';
import contactHandler from '../api/contact.js';

function responseMock() {
  return {
    code: 200, body: null, headers: {},
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.code = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('existing contacts retain opt-out status on signup and optional contact subscription', async () => {
  const keys = ['NODE_ENV', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'RESEND_API_KEY', 'RESEND_OOD_SEGMENT_ID', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'];
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  try {
    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 'test-only';
    process.env.RESEND_OOD_SEGMENT_ID = 'test-segment';
    process.env.CONTACT_TO_EMAIL = 'owner@example.invalid';
    process.env.CONTACT_FROM_EMAIL = 'form@example.invalid';
    const calls = [];
    globalThis.fetch = async (url, options) => {
      const pathname = new URL(url).pathname;
      calls.push({ pathname, method: options.method, body: options.body });
      if (pathname === '/contacts') return { ok: false, status: 409 };
      if (pathname.endsWith('/segments/test-segment')) return { ok: true, status: 200 };
      if (pathname === '/emails') return { ok: true, status: 200 };
      throw new Error('Unexpected outbound endpoint ' + pathname);
    };
    const request = body => ({ method: 'POST', headers: { host: 'ourolddad.com', origin: 'https://ourolddad.com' }, body, socket: { remoteAddress: '127.0.0.1' } });
    let response = responseMock();
    await subscribeHandler(request({ email: 'reader@example.invalid' }), response);
    assert.equal(response.code, 200);
    assert.equal(response.body.ok, true);
    response = responseMock();
    await contactHandler(request({ name: 'Reader', email: 'reader@example.invalid', message: 'Hello', subscribe: 'yes' }), response);
    assert.equal(response.code, 200);
    assert.equal(response.body.ok, true);
    assert.equal(calls.filter(call => call.pathname.endsWith('/segments/test-segment')).length, 2);
    assert.equal(calls.filter(call => call.method === 'PATCH').length, 0, 'Existing contacts must never be reactivated');
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of keys) before[key] === undefined ? delete process.env[key] : process.env[key] = before[key];
  }
});
