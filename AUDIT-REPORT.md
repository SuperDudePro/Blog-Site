# Our Old Dad (Blog-Site) audit — 2026-09-30

Scope: `main` at `7ae1dfd` (Sep 28, 2026). Checked: code/build, SEO, AI-search visibility (AIO), accessibility, security, performance.

Method: `npm ci` + full `npm run build` (all validators), `npm audit` / `npm outdated` (root and `publisher/`), axe-core WCAG 2.0–2.2 A/AA on 11 built routes with Playwright/Chromium, layout-shift attribution, and a read of `api/`, `publisher/api` + `publisher/lib`, the route prerenderer, metadata code, forms, and `vercel.json`.

**Limits:** I could not reach the live site from the sandbox; the network policy blocked `ourolddad.com`. Live response headers, redirects, and field Core Web Vitals are **not verified**. Lab timings come from a local preview.

**Bottom line:** The codebase is in good shape. The build is green, there are no serious or critical axe findings, no secrets are committed, and the API routes are hardened. The biggest real problems were:

1. A large layout shift on every post page (fixed).
2. Social and AI crawlers saw no share image (fixed).
3. Non-post pages are empty for crawlers that don't run JavaScript (open, recommended next).

Status legend: **FIXED** = in this PR · **OPEN** = recommended, not changed (risky or subjective) · **INFO** = no action.

---

## High

| # | Area | Finding | Status |
|---|---|---|---|
| H1 | Performance / CWV | **Post pages had CLS ≈ 0.79** (good is < 0.10) on desktop lab runs, on all 3 posts tested. Cause: `PostPage` rendered a small "Loading post…" block, then swapped in the full hero once the post chunk loaded. That pushed the hero and footer down. Fix: render the hero from the already-loaded post metadata while the body chunk loads. Measured CLS after the fix: **0**. | FIXED |
| H2 | SEO / social | **Static post HTML had no `og:image` / `twitter:image`.** It also always used `twitter:card=summary`. Facebook, X, LinkedIn, iMessage, Slack and most AI crawlers don't run JS, so shared links showed no image. Fix: the prerenderer now reads Vite's build manifest and adds `og:image`, `og:image:alt`, `twitter:image`, `twitter:image:alt` and `summary_large_image` for every post. It deletes the manifest afterwards so it isn't deployed. | FIXED |
| H3 | AIO / SEO | **Non-post pages ship an empty `<div id="root">`** (home, sections, archive, categories, about). Crawlers that don't run JS see a title and description but **no content and no internal links**. That includes GPTBot, ClaudeBot, PerplexityBot and most social scrapers. Posts are fine: they already get static article markup. Recommendation: extend `scripts/generate-route-pages.mjs` to prerender a simple `<main>` with the page H1, intro, and a list of post links for each section, archive and category page. The pattern would match `staticPostMarkup`. | FIXED (follow-up PR) |

## Medium

| # | Area | Finding | Status |
|---|---|---|---|
| M1 | Security | **No Content-Security-Policy.** `vercel.json` sets nosniff, frame DENY, referrer and permissions headers, but no CSP. A CSP needs allowances for the inline gtag bootstrap (hash it), `googletagmanager.com`/`google-analytics.com`, inline `style=` attributes (heavily used), and `data:`/self images. Roll it out as `Content-Security-Policy-Report-Only` first, then enforce. | FIXED: report-only CSP plus a `/api/csp-report` log endpoint (follow-up PR). Enforce after about 2 weeks of clean logs. |
| M2 | Security / config | **`vercel.json` combines legacy `routes` with `redirects` and `headers`.** Vercel has historically documented `routes` as not combinable with `redirects`/`headers`/`rewrites`. Deploys evidently succeed, but **verify on production** that the security headers and the www→apex 301 are actually served: `curl -sI https://ourolddad.com/archive` and `curl -sI https://www.ourolddad.com/archive`. If headers are missing, drop the `routes` block. Vercel serves `404.html` for unmatched static paths by default. **Verified on 2026-09-30: production served none of the `vercel.json` security headers.** Only Vercel's default HSTS was present. | FIXED: `routes` removed (follow-up PR) |
| M3 | Security (publisher) | Publisher auth is **one shared static key** (`PUBLISHER_ACCESS_KEY`) with no rate limiting, lockout or expiry. It is compared in constant time, which is good. Anyone holding the key can also (a) force-update any `publisher/*` branch via client-supplied `session.branch`, and (b) PATCH title/body/base of **any** PR number via client-supplied `session.existingPullRequest.number`. Recommendations: re-derive the branch server-side, confirm that the PR's head ref is `publisher/<slug>` before patching, and add a durable rate limit on failed key checks. Consider Vercel Deployment Protection on the publisher project. | OPEN |
| M4 | Accessibility | **Form status messages weren't announced** to screen readers (WCAG 4.1.3). This affected the contact form and both subscribe forms. Fix: they now sit in a persistent `aria-live="polite"` region. | FIXED |
| M5 | Accessibility | **The Music Playlists gallery auto-rotates every 6 s with no pause control** (WCAG 2.2.2 Pause, Stop, Hide). It only stops under `prefers-reduced-motion`. Add a pause/play button, or stop rotation on hover/focus and after a few cycles. | FIXED: pause/play button (follow-up PR) |
| M6 | Performance | Images come in one size only, with no `srcset`/`sizes`. Post heroes are 1600×900 at about 450–530 KB. Some body images are 1200×1500 at up to 784 KB (`we-werent-going-to-tell-her-so-soon`). The home skull is 340 KB. On mobile the hero is the LCP element. Recommendations: publish 800w/1200w/1600w variants at lower quality (about 150–250 KB for the hero) and add `fetchpriority="high"` to the post hero. This touches the post contract's image geometry rules and the publisher, so it needs a deliberate change. | OPEN |
| M7 | Dependencies | `nanoid <3.3.18` (high, GHSA-2v37-7h3g-55p8) came in through vite → postcss. It is build-time only, so the real risk is low. Fix: `npm audit fix` changed only the lockfile, and the root now shows 0 vulnerabilities. `publisher/` already had 0. | FIXED |
| M8 | AIO | **No `llms.txt`.** Fix: `scripts/generate-llms.mjs` now runs in `npm run build` and writes `public/llms.txt`: a site summary plus every post, grouped by section, with its excerpt. It is generated like `rss.xml`, not committed. | FIXED |
| M9 | AIO policy | `robots.txt` is `Allow: /` for everyone, so **all AI crawlers are allowed**, for both training (GPTBot, ClaudeBot, Google-Extended, CCBot) and answer engines. That's fine if intended. If you want AI search citations but not model training, disallow `GPTBot`, `Google-Extended`, `CCBot` and `anthropic-ai`/`ClaudeBot`. Keep `OAI-SearchBot`, `PerplexityBot` and `Claude-SearchBot` allowed. | DECIDED: keep allowing all |

## Low

| # | Area | Finding | Status |
|---|---|---|---|
| L1 | A11y / SEO | The site title in the header was an `<h2>` on every page, so an h2 came before each page's h1. Changed it to a `<span>` with the same class; `line-height` was added so it looks the same. | FIXED |
| L2 | SEO | Static post JSON-LD had no `image` or `dateModified`, and `articleSection` used the slug (`music-playlists`). The static `WebSite` node had no description. All are added now, and the section uses its display name. | FIXED |
| L3 | Security | `api/resend-inbound.js` returned the **names of missing env vars** in a public 500 response. They are now logged only. | FIXED |
| L4 | Security | `api/contact.js` didn't check name/email/subject length on the server; only the browser's `maxLength` did. It now enforces 120/180/160. | FIXED |
| L5 | Security | `api/resend-inbound.js` uses bare `fetch`, with no timeout, for the Resend API and the raw-message download. It also has no explicit raw-body size cap; Vercel's 4.5 MB request limit still applies. Switch to `fetchWithTimeout` from `_security.mjs`. | OPEN |
| L6 | Security | `clientIp()` uses the first `x-forwarded-for` value. On Vercel that header is set by the edge, so this is OK. Prefer `x-real-ip`/`x-vercel-forwarded-for` if the site ever moves off Vercel. | INFO |
| L7 | Repo hygiene | The checked-in `public/sitemap.xml` and `src/content/postMetadata.generated.ts` were stale. The sitemap was missing the Pink Floyd post, and the metadata was missing the handcuffs post. The build regenerates them, so production wasn't affected. Both are refreshed now. | FIXED |
| L8 | Repo hygiene | The build writes `public/rss.xml`, `public/deployment.json` and now `public/llms.txt`, but they weren't in `.gitignore`. Added. | FIXED |
| L9 | Dead code | 3 unused assets (about 390 KB) removed: `src/assets/everything-page-girl.jpg`, `playlists-headphones.jpg`, `playlists-skull-hero.webp`. Nothing referenced them. | FIXED |
| L10 | SEO | The home page and other non-post pages have no `og:image`, and there is no site default. Add a 1200×630 default share image to `public/` and to `index.html`. It needs artwork. | OPEN |
| L11 | Schema / AIO | The `Person` node has only a name and URL. Add `description`, `image`, and `sameAs` for any public profiles, so AI engines can resolve the author entity. An FAQ schema doesn't fit first-person essays; don't add one. | OPEN |
| L12 | Internal linking | 23 of 52 posts have **no links in the body**. The related-posts block helps, but a couple of contextual links per post, especially inside series such as Straight Greats and Three Straight, would help crawl depth and topical clustering. This is editorial work. | OPEN |
| L13 | Coverage | The CI axe audit covered only `/`, `/archive` and `/contact`. I added a section page and a post page to `scripts/quality-routes.json`; both pass. | FIXED |
| L14 | Privacy | GA4 (`G-YJHTMZDY5P`) loads before any consent. That's fine for a US audience. If you ever target the EU/UK, add consent mode. | INFO |
| L15 | Tooling | There's no ESLint. `tsc` in strict mode and the custom validators cover most of the gap. Optional: add `eslint` with `jsx-a11y` for render-time a11y checks. | OPEN |
| L16 | Dependencies | Major upgrades are available: React 19, `@types/react` 19, TypeScript 7. Minor updates are available for vite 8.3 and plugin-react 6.1. None are security fixes. Do the major upgrades as a separate PR. | OPEN |

## Info / verified OK

- **Build:** `npm run build` passes end to end: redirect, sitemap, content, post-contract, tsc, bundle-size, site and discovery validators. The publisher build and tests run in CI; the publisher code is unchanged here.
- **Redirects:** `redirects.json` matches `vercel.json` (`validate:redirects`). The www→apex 301 is configured, and old `/#/post/...` hash URLs are canonicalized client-side.
- **Canonical/sitemap/robots:** Every sitemap route has a built page with a matching canonical, `og:url`, title, description and one JSON-LD block (`validate:discovery`). `robots.txt` declares the sitemap. The 404 page is `noindex`.
- **Secrets:** None committed. The API keys are env-only. The IndexNow key in `.github/workflows/indexnow.yml` and `public/*.txt` is public by design.
- **API routes:** same-origin check, body-size caps, durable Redis rate limits (fail-closed), honeypots, request timeouts, and constant-time Svix signature verification on the inbound webhook.
- **XSS:** `bodyHtml` is rendered with `dangerouslySetInnerHTML`, but it is author-controlled static content. `validate-content` blocks unsafe HTML at build time. Publisher uploads go through the same build gate before merge. No user input reaches the DOM unescaped.
- **"Protected post":** `README-DAD-PROTECT-POST.txt` is the package README for the post *"Dad, Do You Love Me Enough to Protect Me?"*. It is **not** an access-control mechanism, and the site has no password-protected or private posts. Nothing to audit there. Consider moving that file and the other package READMEs into `notes/`.
- **Accessibility:** 0 axe violations of any impact on 11 routes: home, archive, contact, about, categories, 2 sections, 3 posts, and the not-found page. There is a skip link, one `main` and one `h1` per page, the first Tab stop is visible, all images have alt text (enforced by the validator), and forms have labels.
- **Render-blocking:** a single CSS bundle, system fonts (no webfont requests), async gtag, and code-split post chunks. Initial JS is 223 KB raw / 73 KB gzip, within the 300 KB budget.

## What this PR changes

- `src/pages/PostPage.tsx`: renders the hero from metadata during chunk load (H1).
- `scripts/generate-route-pages.mjs` and `vite.config.ts` (`build.manifest`): add share image tags and richer JSON-LD to static post pages (H2, L2).
- `src/metadata.ts`: keeps `og:image:alt`/`twitter:image:alt` in sync on client-side navigation.
- `scripts/generate-llms.mjs` and the `generate:llms` step in `build` (M8).
- `src/pages/ContactPage.tsx` and `src/components/SubscribeForm.tsx`: add live regions (M4).
- `src/components/SiteShell.tsx` and `src/styles.css`: header title h2 → span (L1).
- `api/contact.js`: server-side length limits (L4). `api/resend-inbound.js`: no env names in the response (L3).
- `package-lock.json`: nanoid fix (M7). `.gitignore`: ignores the generated files (L8). Unused assets removed (L9). The generated snapshots are refreshed (L7). `scripts/quality-routes.json`: wider axe coverage (L13). README and quality docs updated to match.

The posting/publisher workflow is untouched. The post contract, `create:post`, the publisher API and validation all behave as before.

## Suggested next steps (in order)

1. Verify the live headers (M2). This takes 2 minutes.
2. Prerender non-post pages with post link lists (H3). This is the biggest remaining SEO/AIO gain.
3. Decide the AI-crawler policy (M9) and add author `sameAs` (L11).
4. CSP in report-only mode (M1), then publisher hardening (M3).
5. Responsive images and hero `fetchpriority` (M6); gallery pause control (M5).
