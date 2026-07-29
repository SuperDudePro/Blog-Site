import assert from 'node:assert/strict';
import test from 'node:test';
import { clearPublisherJob, loadPublisherJob, savePublisherJob } from '../src/jobPersistence.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test('restores an active publishing handoff after a browser refresh', () => {
  const storage = memoryStorage();
  const handoff = {
    repository: 'SuperDudePro/LifeEducationOrg',
    branch: 'publisher/domain-10',
    commit: 'a'.repeat(40),
    prNumber: 26,
    prUrl: 'https://github.com/SuperDudePro/LifeEducationOrg/pull/26',
    baseBranch: 'main',
  };
  const inspection = {
    manifest: {
      canonicalUrl: 'https://www.lifeeducation.org/posts/domain-10-life-skills-project-execution',
      title: 'Domain 10: Life Skills & Project Execution',
    },
    images: [{ file: 'hero-image.webp', url: 'blob:temporary-preview' }],
  };

  savePublisherJob(storage, handoff, inspection);
  const restored = loadPublisherJob(storage);
  assert.equal(restored.handoff.prNumber, 26);
  assert.equal(restored.inspection.manifest.canonicalUrl, inspection.manifest.canonicalUrl);
  assert.equal(restored.inspection.images[0].url, '');

  clearPublisherJob(storage);
  assert.equal(loadPublisherJob(storage), null);
});
