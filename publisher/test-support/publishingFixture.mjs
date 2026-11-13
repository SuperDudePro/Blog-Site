// A minimal valid Publisher package (card + hero, no body images) for each
// registered site profile, in the shape the browser sends to the handlers.
import { createHash } from 'node:crypto';
import { inspectImageBytes } from '../lib/imageMetadata.mjs';
import { imageFixture } from './fixtures.mjs';

export const OOD = 'SuperDudePro/Blog-Site';
export const LIFE = 'SuperDudePro/LifeEducationOrg';

const sites = {
  ood: {
    targetSite: 'Our Old Dad',
    repository: OOD,
    canonicalPrefix: 'https://ourolddad.com/post/',
    buildCommand: 'npm run build',
    imagePrefix: '',
    extra: { section: 'diary' },
  },
  life: {
    targetSite: 'LifeEducation',
    repository: LIFE,
    canonicalPrefix: 'https://www.lifeeducation.org/posts/',
    buildCommand: 'npm run check',
    imagePrefix: 'images/',
    extra: { topic: 'Founding Notes', tags: ['LifeEducation'] },
  },
};

function sources(kind, slug, note, bodyImages) {
  const cta = '<p><a href="/contact">Tell us what we missed.</a></p>';
  const bodies = Array.from({ length: bodyImages }, (_, index) => index + 1);
  if (kind === 'ood') {
    return {
      'index.ts': `import cardImage from "./card-image.webp";
import heroImage from "./hero-image.webp";
${bodies.map((n) => `import body${n} from "./body-image-${n}.webp";\n`).join('')}const post = {
  title: "Fixture ${slug}",
  slug: "${slug}",
  excerpt: "Deterministic publishing fixture.",
  section: "diary",
  publishedAt: "2026-07-30",
  status: "Recent",
  cardImage,
  cardAlt: "Card image.",
  heroImage,
  heroAlt: "Hero image.",
  bodyHtml: \`<p>${note}</p>${bodies.map((n) => `<img src="\${body${n}}" alt="Body image ${n}." />`).join('')}${cta}\`,
};
export default post;
`,
    };
  }
  return {
    'meta.ts': `import cardImage from "./images/card-image.webp";
import heroImage from "./images/hero-image.webp";
export const metadata = {
  title: "Fixture ${slug}",
  slug: "${slug}",
  excerpt: "Deterministic publishing fixture.",
  publishedAt: "2026-07-30",
  status: "Recent",
  topic: "Founding Notes",
  tags: ["LifeEducation"],
  cardImage,
  cardAlt: "Card image.",
  heroImage,
  heroAlt: "Hero image.",
};
`,
    'index.tsx': `import { metadata } from "./meta";
${bodies.map((n) => `import body${n} from "./images/body-image-${n}.webp";\n`).join('')}const post = { ...metadata, body: <><p>${note}</p>${bodies.map((n) => `<PostFigure src={body${n}} alt="Body image ${n}." />`).join('')}${cta}</> };
export default post;
`,
  };
}

// `note` changes the production source, so two fixtures with different
// notes are two different versions of the same post. `bodyImages` adds that
// many body images after the card and hero (zero is a valid post).
export function publishingFixture(kind, slug, { note = 'First version.', bodyImages = 0 } = {}) {
  const site = sites[kind];
  const images = [
    ...['card', 'hero'].map((role) => ({
      file: `${site.imagePrefix}${role}-image.webp`,
      role,
      alt: `${role[0].toUpperCase()}${role.slice(1)} image.`,
      caption: null,
    })),
    ...Array.from({ length: bodyImages }, (_, index) => ({
      file: `${site.imagePrefix}body-image-${index + 1}.webp`,
      role: `body-${index + 1}`,
      alt: `Body image ${index + 1}.`,
      caption: null,
    })),
  ];
  const sourceFiles = sources(kind, slug, note, bodyImages);
  const production = Object.fromEntries([
    ...Object.entries(sourceFiles).map(([name, text]) => [name, Buffer.from(text)]),
    ...images.map((image) => [image.file, Buffer.from(imageFixture(image.role))]),
  ]);
  return {
    manifest: {
      targetSite: site.targetSite,
      repository: site.repository,
      title: `Fixture ${slug}`,
      slug,
      excerpt: 'Deterministic publishing fixture.',
      publishedAt: '2026-07-30',
      status: 'Recent',
      ...site.extra,
      destinationPath: `src/content/posts/${slug}/`,
      canonicalUrl: `${site.canonicalPrefix}${slug}`,
      buildCommand: site.buildCommand,
      images,
    },
    preflight: {
      productionPaths: Object.keys(production),
      sourceFiles,
      imageMetadata: images.map((image) => ({
        file: image.file,
        role: image.role,
        readable: true,
        bytes: production[image.file].length,
        ...inspectImageBytes(production[image.file]),
      })),
    },
    production,
  };
}

// Files a registered site repository needs for the handlers' own reads.
export function siteRepositoryFiles(repository, extra = {}) {
  return {
    'README.md': '# Fixture site\n',
    'package.json': '{ "name": "fixture-site" }\n',
    'post-contract-baseline.json': `${JSON.stringify({ schemaVersion: 1, repository, status: 'reviewed', entries: {} }, null, 2)}\n`,
    'public/sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ourolddad.com/</loc>\n  </url>\n</urlset>\n',
    'src/content/posts/untouched-neighbor/index.ts': 'export default { slug: "untouched-neighbor" };\n',
    ...extra,
  };
}

// ---- direct GitHub handoff -------------------------------------------------

// The manifest an assistant publishes for a direct handoff: the package
// manifest plus the SHA-256 of each image's exact bytes.
export function manifestWithDigests({ manifest, production }) {
  return {
    ...manifest,
    images: manifest.images.map((image) => ({
      ...image,
      sha256: createHash('sha256').update(production[image.file]).digest('hex'),
    })),
  };
}

export function directHandoffBody(fixture) {
  const { manifest } = fixture;
  return [
    `- Site profile: **${manifest.targetSite}**`,
    '- Handoff method: **Direct GitHub**',
    `- Slug: \`${manifest.slug}\``,
    `- Destination: \`${manifest.destinationPath}\``,
    `- Canonical URL: ${manifest.canonicalUrl}`,
    '',
    '## Publisher manifest',
    '',
    '```json',
    JSON.stringify(manifestWithDigests(fixture), null, 2),
    '```',
  ].join('\n');
}

// What a direct handoff stages on its branch: the post folder and, for Our
// Old Dad, the new route in the checked-in sitemap.
export function directHandoffFiles({ manifest, production }, currentSitemap) {
  const files = Object.fromEntries(Object.entries(production).map(([file, bytes]) => [`${manifest.destinationPath}${file}`, bytes]));
  if (manifest.repository === OOD) {
    files['public/sitemap.xml'] = String(currentSitemap).replace('</urlset>', `  <url>\n    <loc>${manifest.canonicalUrl}</loc>\n  </url>\n</urlset>`);
  }
  return files;
}
