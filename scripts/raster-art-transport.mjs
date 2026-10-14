#!/usr/bin/env node
/**
 * Transport a WebP through text-only GitHub file APIs without redrawing it.
 * This is ONLY for decorative/site SVG slots. Publisher post-image slots
 * require real WebP files and must never use an SVG wrapper.
 *
 * Usage:
 *   node scripts/raster-art-transport.mjs wrap image.webp image.svg
 *   node scripts/raster-art-transport.mjs verify image.svg [image.webp]
 *   node scripts/raster-art-transport.mjs extract image.svg image.webp
 *   node scripts/raster-art-transport.mjs audit
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const SECTION_KEYS = Object.freeze([
  'everything', 'diary', 'life-education', 'music-playlists', 'slow-travel', 'advice',
]);

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function webpGeometry(bytes) {
  if (bytes.length < 30 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Expected actual RIFF/WebP bytes, not a different image or SVG trace');
  }
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L' && bytes[20] === 0x2f) {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error('Unsupported or corrupt WebP header');
}

export function wrapWebp(bytes) {
  const { width, height } = webpGeometry(bytes);
  const base64 = bytes.toString('base64');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:image/webp;base64,${base64}"/></svg>\n`;
}

// Strictly accept a single embedded raster and no vector outlines, paths,
// scripts, external URLs, effects, or content that could alter appearance.
export function unwrapWebp(svg) {
  const pattern = /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="(\d+)" height="(\d+)" viewBox="0 0 (\d+) (\d+)"><image width="(\d+)" height="(\d+)" href="data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})"\/><\/svg>\s*$/;
  const match = svg.match(pattern);
  if (!match) throw new Error('Not a single-image, raster-preserving WebP-in-SVG wrapper; traced/vector artwork is prohibited');
  const dims = match.slice(1, 7).map(Number);
  if (dims[0] !== dims[2] || dims[0] !== dims[4] || dims[1] !== dims[3] || dims[1] !== dims[5]) {
    throw new Error('SVG viewport differs from embedded raster geometry');
  }
  const bytes = Buffer.from(match[7], 'base64');
  if (bytes.toString('base64') !== match[7]) throw new Error('Non-canonical or invalid WebP base64 payload');
  const geometry = webpGeometry(bytes);
  if (geometry.width !== dims[0] || geometry.height !== dims[1]) throw new Error('Embedded WebP geometry mismatch');
  return bytes;
}

export function verifyWrapper(svgPath, sourcePath) {
  const bytes = unwrapWebp(fs.readFileSync(svgPath, 'utf8'));
  if (sourcePath) {
    const original = fs.readFileSync(sourcePath);
    if (!bytes.equals(original)) throw new Error(`SHA-256 mismatch: wrapper=${sha256(bytes)} source=${sha256(original)}`);
  }
  return { ...webpGeometry(bytes), bytes: bytes.length, sha256: sha256(bytes) };
}

export function auditSectionSketches(root) {
  const css = fs.readFileSync(path.join(root, 'src/components/SectionCard.css'), 'utf8');
  const output = [];
  for (const key of SECTION_KEYS) {
    const filename = `section-sketch-${key}.svg`;
    const file = path.join(root, 'src/assets', filename);
    const metadata = verifyWrapper(file);
    if (metadata.width < 160 || metadata.height < 160 || metadata.width !== metadata.height) {
      throw new Error(`${filename}: expected square raster illustration at least 160px on each side`);
    }
    if (!css.includes(`url('../assets/${filename}')`)) throw new Error(`${filename}: section card is not using the verified asset`);
    output.push({ file: filename, ...metadata });
  }
  return output;
}

const thisScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (thisScript) {
  const [action, first, second] = process.argv.slice(2);
  try {
    if (action === 'wrap' && first && second) {
      const input = fs.readFileSync(first);
      fs.writeFileSync(second, wrapWebp(input));
      console.log(`Wrote lossless wrapper: ${second}; embedded WebP sha256 ${sha256(input)}`);
    } else if (action === 'verify' && first) {
      console.log(JSON.stringify(verifyWrapper(first, second), null, 2));
    } else if (action === 'extract' && first && second) {
      const bytes = unwrapWebp(fs.readFileSync(first, 'utf8'));
      fs.writeFileSync(second, bytes);
      console.log(`Recovered original WebP bytes: ${second} sha256 ${sha256(bytes)}`);
    } else if (action === 'audit' && !first && !second) {
      const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
      console.log(JSON.stringify(auditSectionSketches(root), null, 2));
    } else {
      throw new Error('Usage: wrap image.webp image.svg | verify image.svg [image.webp] | extract image.svg image.webp | audit');
    }
  } catch (error) {
    console.error(`Raster art transport failed: ${error.message}`);
    process.exitCode = 1;
  }
}