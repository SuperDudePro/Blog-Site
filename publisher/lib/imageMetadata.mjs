const ascii = (bytes, start, end) => String.fromCharCode(...bytes.slice(start, end));

const uint16be = (bytes, offset) => (bytes[offset] << 8) | bytes[offset + 1];
const uint16le = (bytes, offset) => bytes[offset] | (bytes[offset + 1] << 8);
const uint24le = (bytes, offset) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
const uint32le = (bytes, offset) => (
  bytes[offset]
  | (bytes[offset + 1] << 8)
  | (bytes[offset + 2] << 16)
  | (bytes[offset + 3] << 24)
) >>> 0;

function readPng(bytes) {
  if (
    bytes.length < 24
    || bytes[0] !== 0x89
    || ascii(bytes, 1, 4) !== 'PNG'
    || bytes[4] !== 0x0d
    || bytes[5] !== 0x0a
    || bytes[6] !== 0x1a
    || bytes[7] !== 0x0a
  ) return null;
  const width = (
    (bytes[16] << 24)
    | (bytes[17] << 16)
    | (bytes[18] << 8)
    | bytes[19]
  ) >>> 0;
  const height = (
    (bytes[20] << 24)
    | (bytes[21] << 16)
    | (bytes[22] << 8)
    | bytes[23]
  ) >>> 0;
  return { format: 'png', width, height };
}

function readJpeg(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  const frames = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) break;
    const size = uint16be(bytes, offset);
    if (size < 2 || offset + size > bytes.length) break;
    if (frames.has(marker)) {
      return {
        format: 'jpeg',
        width: uint16be(bytes, offset + 5),
        height: uint16be(bytes, offset + 3),
      };
    }
    offset += size;
  }
  return null;
}

function readWebp(bytes) {
  if (bytes.length < 25 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 12) !== 'WEBP') return null;
  const chunk = ascii(bytes, 12, 16);
  if (chunk === 'VP8X' && bytes.length >= 30) {
    return {
      format: 'webp',
      width: 1 + uint24le(bytes, 24),
      height: 1 + uint24le(bytes, 27),
    };
  }
  if (chunk === 'VP8 ' && bytes.length >= 30) {
    return {
      format: 'webp',
      width: uint16le(bytes, 26) & 0x3fff,
      height: uint16le(bytes, 28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits = uint32le(bytes, 21);
    return {
      format: 'webp',
      width: (bits & 0x3fff) + 1,
      height: ((bits >>> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

export function inspectImageBytes(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
  const metadata = readPng(bytes) ?? readJpeg(bytes) ?? readWebp(bytes);
  if (!metadata?.width || !metadata?.height) {
    throw new Error('unrecognized or corrupt PNG/JPEG/WebP data');
  }
  return { ...metadata, bytes: bytes.length };
}

export const IMAGE_GEOMETRY = Object.freeze({
  card: Object.freeze({ width: 960, height: 720 }),
  hero: Object.freeze({ width: 1600, height: 900 }),
  body: Object.freeze({ width: 1200, height: 900 }),
});

export function expectedGeometry(role) {
  if (role === 'card' || role === 'hero') return IMAGE_GEOMETRY[role];
  if (/^body-\d+$/.test(String(role || ''))) return IMAGE_GEOMETRY.body;
  return null;
}
