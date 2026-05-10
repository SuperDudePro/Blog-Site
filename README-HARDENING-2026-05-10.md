# Our Old Dad Maintenance Pass

Date: 2026-05-10

## What Changed

- Added automated sitemap generation: `npm run generate:sitemap`.
- Added content validation: `npm run validate:content`.
- Updated `npm run build` so it regenerates the sitemap, validates content, type-checks, and builds.
- Added `package-lock.json` for stable installs and deploys.
- Removed generated artifacts from the source package: `.git`, `dist`, `node_modules`, `*.tsbuildinfo`, `vite.config.js`, and `vite.config.d.ts`.
- Updated `.gitignore` so local generated files stay out of future handoff bundles.
- Compressed large generated PNG images to WebP where it made the files much smaller.
- Kept remaining images under the validation warning limit.
- Made Latest post, Recent posts, and section cards fully clickable.
- Restored compact section-page header behavior and kept Music Playlists in its custom header-plus-gallery layout.
- Updated the Advice section title to `An Old Dad's Advice`.

## Current Build Workflow

From the `Blog-Site` root:

```bash
npm install
npm run build
```

The build command now runs:

```bash
npm run generate:sitemap
npm run validate:content
tsc --noEmit -p tsconfig.app.json
tsc --noEmit -p tsconfig.node.json
vite build
```

## New Maintenance Commands

```bash
npm run generate:sitemap
npm run validate:content
```

## Notes

- `public/sitemap.xml` is now generated from the actual post folders.
- The validation script checks post slugs, sections, dates, required fields, imported images, image alt text, sitemap coverage, and oversized images.
- Production build was tested successfully before packaging.
