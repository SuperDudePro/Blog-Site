# Our Old Dad Contact Page Handoff

This is a replacement-file bundle. No append-only CSS file. No partial patch fragments.

Copy these files into the repo at the exact paths shown:

```text
api/contact.js
src/App.tsx
src/routes.ts
src/metadata.ts
src/data/siteContent.ts
src/pages/ContactPage.tsx
scripts/generate-sitemap.mjs
```

There is no `src/styles.css` replacement because the contact page uses existing site classes plus local inline styles. There are no append steps or partial style fragments.

## What this adds

- `/contact` route
- `Contact` nav/footer item
- single-panel contact page
- basic contact form
- hidden honeypot field
- server-side `/api/contact` endpoint
- sitemap generation entry for `/contact`
- route metadata for `/contact`

## Email privacy

Your real email does not go into the frontend or repo. The API endpoint reads it from Vercel environment variables.

Set these in Vercel for Production and Preview:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
CONTACT_SUBJECT_PREFIX
```

Recommended values:

```text
CONTACT_TO_EMAIL=<your private real email>
CONTACT_FROM_EMAIL=contact@ourolddad.com
CONTACT_SUBJECT_PREFIX=Our Old Dad
```

`CONTACT_FROM_EMAIL` must be a sender/domain verified in Resend.

## Build check

Run from repo root:

```bash
npm run build
```

Then deploy and test:

1. Visit `/contact`.
2. Submit a real test message.
3. Confirm it reaches `CONTACT_TO_EMAIL`.
4. Confirm the real email never appears in page source.

## Post 2 CTA

Once `/contact` is live, use the replacement CTA in:

```text
notes/post-2-cta-replacement.md
```
