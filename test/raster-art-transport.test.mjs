import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { SECTION_KEYS, auditSectionSketches, sha256, unwrapWebp, verifyWrapper, wrapWebp } from '../scripts/raster-art-transport.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every homepage sketch contains an embedded WebP, never traced vector paths', () => {
  const results = auditSectionSketches(root);
  assert.equal(results.length, SECTION_KEYS.length);
  for (const item of results) assert.match(item.sha256, /^[0-9a-f]{64}$/);
});

test('WebP wrapper transfer is reversible and source-hash exact', () => {
  const sourceFile = path.join(root, 'src/assets/section-sketch-diary.svg');
  const originalBytes = unwrapWebp(fs.readFileSync(sourceFile, 'utf8'));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ood-art-transport-'));
  try {
    const webpFile = path.join(temp, 'approved.webp');
    const svgFile = path.join(temp, 'transfer.svg');
    fs.writeFileSync(webpFile, originalBytes);
    fs.writeFileSync(svgFile, wrapWebp(originalBytes));
    const receipt = verifyWrapper(svgFile, webpFile);
    assert.equal(receipt.sha256, sha256(originalBytes));
    const wrongFile = path.join(temp, 'wrong.webp');
    fs.writeFileSync(wrongFile, Buffer.concat([originalBytes, Buffer.from('tampered')]));
    assert.throws(() => verifyWrapper(svgFile, wrongFile), /SHA-256 mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('rejects vector traces and altered SVG viewports rather than accepting degraded art', () => {
  assert.throws(() => unwrapWebp('<svg><path d="M0 0 L5 5"/></svg>'), /traced\/vector artwork is prohibited/);
  const sourceFile = path.join(root, 'src/assets/section-sketch-diary.svg');
  const sourceSvg = fs.readFileSync(sourceFile, 'utf8');
  assert.throws(() => unwrapWebp(sourceSvg.replace('viewBox="0 0 320 320"', 'viewBox="0 0 280 280"')), /viewport differs/);
});