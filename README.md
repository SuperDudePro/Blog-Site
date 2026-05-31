# Our Old Dad

Deployable Vite + React repo for the Our Old Dad site.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build regenerates `public/sitemap.xml`, validates the post catalog, runs TypeScript checks, and creates the Vite production bundle.

## Posts

Each post lives in `src/content/posts/<slug>/index.ts` with its local images in the same folder.

Post URLs are clean paths such as `/post/the-math-isnt-good`. Old hash URLs still resolve and are replaced with the canonical clean URL in the browser.
