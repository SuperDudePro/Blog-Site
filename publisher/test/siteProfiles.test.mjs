import assert from 'node:assert/strict';
import test from 'node:test';
import { getSiteProfile, imageManifestErrors } from '../siteProfiles.mjs';

const records = (prefix = '', count = 4) => [
  { file: `${prefix}card-image.webp`, role: 'card', alt: 'Card.', caption: null },
  { file: `${prefix}hero-image.webp`, role: 'hero', alt: 'Hero.', caption: null },
  ...Array.from({ length: count }, (_, index) => ({
    file: `${prefix}body-image-${index + 1}.webp`,
    role: `body-${index + 1}`,
    alt: `Body ${index + 1}.`,
    caption: null,
  })),
];

test('selects both registered site profiles', () => {
  assert.equal(getSiteProfile({ repository: 'SuperDudePro/Blog-Site' }).id, 'our-old-dad');
  assert.equal(getSiteProfile({ repository: 'SuperDudePro/LifeEducationOrg' }).id, 'lifeeducation');
});

test('accepts explicitly approved additional body roles', () => {
  const profile = getSiteProfile({ targetSite: 'LifeEducation' });
  assert.deepEqual(imageManifestErrors(profile, records('images/', 6)), []);
});

test('rejects gaps and target-specific path drift', () => {
  const profile = getSiteProfile({ targetSite: 'LifeEducation' });
  const images = records('images/', 4);
  images[4] = { ...images[4], file: 'images/body-image-9.webp' };
  assert.match(imageManifestErrors(profile, images).join(' '), /body-image-3/);
});
