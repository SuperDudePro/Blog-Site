import assert from 'node:assert/strict';
import test from 'node:test';
import JSZip from 'jszip';
import { inspectPackage } from '../src/inspectPackage.js';

test('browser inspection selects and validates the LifeEducation profile', async () => {
  const root = '2026-07-28--adaptive-test--lifeeducation';
  const drop = `${root}/drop-in/adaptive-test/`;
  const images = [
    { file: 'images/card-image.webp', role: 'card', alt: 'Card image.', caption: null },
    { file: 'images/hero-image.webp', role: 'hero', alt: 'Hero image.', caption: null },
    ...Array.from({ length: 6 }, (_, index) => ({
      file: `images/body-image-${index + 1}.webp`,
      role: `body-${index + 1}`,
      alt: `Body image ${index + 1}.`,
      caption: null,
    })),
  ];
  const manifest = {
    targetSite: 'LifeEducation',
    repository: 'SuperDudePro/LifeEducationOrg',
    title: 'Adaptive Test',
    slug: 'adaptive-test',
    excerpt: 'Publisher profile fixture.',
    publishedAt: '2026-07-28',
    status: 'Draft',
    topic: 'Founding Notes',
    tags: ['LifeEducation', 'Education'],
    destinationPath: 'src/content/posts/adaptive-test/',
    canonicalUrl: 'https://www.lifeeducation.org/posts/adaptive-test',
    buildCommand: 'npm run check',
    images,
  };
  const meta = `
export const metadata = {
  title: "Adaptive Test",
  slug: "adaptive-test",
  excerpt: "Publisher profile fixture.",
  publishedAt: "2026-07-28",
  status: "Draft",
  topic: "Founding Notes",
  tags: ["LifeEducation", "Education"],
  heroImage,
  heroAlt: "Hero image.",
  cardImage,
  cardAlt: "Card image.",
};
import cardImage from "./images/card-image.webp";
import heroImage from "./images/hero-image.webp";
`;
  const bodyImports = images.slice(2).map((image, index) => `import body${index + 1} from "./${image.file}";`).join('\n');
  const figures = images.slice(2).map((image, index) => `<PostFigure src={body${index + 1}} alt="${image.alt}" />`).join('\n');
  const index = `${bodyImports}\nconst post = { ...metadata, body: <>${figures}</> };`;

  const zip = new JSZip();
  zip.file(`${root}/README-HANDOFF.md`, '# Handoff');
  zip.file(`${root}/source/post.md`, '# Post');
  zip.file(`${root}/source/image-notes.md`, '# Images');
  zip.file(`${root}/source/package-manifest.json`, JSON.stringify(manifest));
  zip.file(`${drop}meta.ts`, meta);
  zip.file(`${drop}index.tsx`, index);
  images.forEach((image) => zip.file(`${drop}${image.file}`, new Uint8Array([1, 2, 3])));

  const inspection = await inspectPackage(await zip.generateAsync({ type: 'uint8array' }));
  assert.equal(inspection.profile.id, 'lifeeducation');
  assert.equal(inspection.manifest.images.length, 8);
  assert.equal(inspection.checks.filter((check) => !check.ok).length, 0);
});
