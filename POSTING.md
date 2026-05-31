# Our Old Dad Post Workflow

Use this when adding or updating posts.

## Create A Post

From the repo root:

```bash
npm run create:post -- --title "Post Title" --section diary --excerpt "Short summary."
```

Sections:

- `diary`
- `life-education`
- `music-playlists`
- `slow-travel`
- `advice`

The script creates:

```text
src/content/posts/<slug>/index.ts
```

Post URLs use clean paths:

```text
https://www.ourolddad.com/post/<slug>
```

Old hash URLs such as `/#/post/<slug>` still work, but new links should use the clean URL.

## Add Images

Put post images in the same folder as `index.ts`, then import them:

```ts
import heroImage from './hero.webp';
```

Use `heroImage`/`heroAlt` for the top image and `cardImage`/`cardAlt` when the card needs a different crop. Body images should include:

```html
loading="lazy" decoding="async"
```

## Build And Publish

Run:

```bash
npm run build
```

The build automatically:

- regenerates `public/sitemap.xml`
- validates post fields, slugs, dates, sections, image imports, alt text, and unsafe HTML
- type-checks the app
- builds the Vite bundle

Do not hand-edit `public/sitemap.xml` for normal post updates. Update the post folder and let the build regenerate it.
