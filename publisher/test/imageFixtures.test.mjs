import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectImageBytes } from '../lib/imageMetadata.mjs';
import { imageFixture } from '../test-support/fixtures.mjs';

test('all real WebP publishing fixtures have complete RIFF payloads and correct dimensions', () => {
  for (const [role, width, height] of [
    ['card', 960, 720],
    ['hero', 1600, 900],
    ['body-1', 1200, 900],
    ['body-4', 1200, 900],
  ]) {
    const bytes = imageFixture(role);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, role + ' must not be truncated');
    const inspected = inspectImageBytes(bytes);
    assert.deepEqual({ width: inspected.width, height: inspected.height }, { width, height });
  }
});
