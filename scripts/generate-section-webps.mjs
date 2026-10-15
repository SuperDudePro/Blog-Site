#!/usr/bin/env node
// Generate native WebP section artwork from the exact approved raster payloads.
// The text-only GitHub connector cannot upload binary source files directly.
// Runtime/browser assets are REAL WebP files, not SVG wrappers.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTION_KEYS, unwrapWebp, sha256 } from './raster-art-transport.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'section-sketches');
fs.mkdirSync(output, { recursive: true });
for (const key of SECTION_KEYS) {
  const source = path.join(root, 'src', 'assets', `section-sketch-${key}.svg`);
  const target = path.join(output, `${key}.webp`);
  if (fs.existsSync(target)) {
    const existing = fs.readFileSync(target);
    if (existing.toString('ascii', 0, 4) !== 'RIFF' || existing.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`Invalid section WebP: ${key}`);
    console.log(`${key}: using uploaded WebP, ${existing.length} bytes, SHA-256 ${sha256(existing)}`);
    continue;
  }
  const bytes = unwrapWebp(fs.readFileSync(source, 'utf8'));
  fs.writeFileSync(target, bytes);
  if (!fs.readFileSync(target).equals(bytes)) throw new Error(`WebP fidelity mismatch: ${key}`);
  console.log(`${key}: native WebP, ${bytes.length} bytes, SHA-256 ${sha256(bytes)}`);
}
