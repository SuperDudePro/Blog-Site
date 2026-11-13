// In-memory stand-in for every non-GitHub host a handler might fetch:
// previews, production sites, and hosts an attacker controls.
//
// It records each request with its headers, and it follows redirects the
// way `fetch` really does. That matters for credential tests: with
// `redirect: 'follow'` (the default) a custom request header is re-sent to
// the redirect target, even on another origin; only `authorization` is
// dropped. With `redirect: 'manual'` the 3xx response is returned as is.
const REDIRECTS = new Set([301, 302, 303, 307, 308]);

export class FakeWeb {
  constructor() {
    this.sites = new Map();
    this.requests = [];
  }

  // `routes` maps a pathname to a response: a string body (HTTP 200), an
  // object `{ status, body, location }`, or a function of the request URL.
  // The '*' route answers any other path on that origin.
  site(origin, routes) {
    this.sites.set(new URL(origin).origin, routes);
    return this;
  }

  respond(url) {
    const routes = this.sites.get(url.origin);
    if (!routes) return null;
    const route = routes[url.pathname] ?? routes['*'];
    if (route === undefined) return { status: 404, body: 'Not found' };
    const value = typeof route === 'function' ? route(url) : route;
    return typeof value === 'string' ? { status: 200, body: value } : value;
  }

  async fetch(input, options = {}) {
    let url = new URL(String(input));
    let headers = Object.fromEntries(Object.entries(options.headers || {}).map(([name, value]) => [name.toLowerCase(), value]));
    for (let hop = 0; hop <= 20; hop += 1) {
      this.requests.push({ url: url.toString(), origin: url.origin, headers: { ...headers } });
      const answer = this.respond(url);
      if (!answer) throw new TypeError('fetch failed');
      const response = new Response(REDIRECTS.has(answer.status) ? null : (answer.body ?? ''), {
        status: answer.status || 200,
        headers: answer.location ? { location: answer.location } : {},
      });
      if (!REDIRECTS.has(response.status) || !answer.location || options.redirect === 'manual') return response;
      if (options.redirect === 'error') throw new TypeError('fetch failed');
      const next = new URL(answer.location, url);
      if (next.origin !== url.origin) {
        const { authorization, ...forwarded } = headers;
        headers = forwarded;
      }
      url = next;
    }
    throw new TypeError('fetch failed');
  }

  // Origins that were contacted at all.
  contacted() {
    return [...new Set(this.requests.map((request) => request.origin))];
  }

  // Origins that received the given header value.
  received(header, value) {
    return [...new Set(this.requests.filter((request) => request.headers[header] === value).map((request) => request.origin))];
  }
}

// One fetch for a handler under test: the GitHub double answers its own
// host, the web double answers everything else.
export function routeFetch(github, web) {
  return (input, options) => (
    new URL(String(input)).host === github.host ? github.fetch(input, options) : web.fetch(input, options)
  );
}
