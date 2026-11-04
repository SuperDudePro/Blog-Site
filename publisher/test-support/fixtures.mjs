export function webpFixture(width, height) {
  const bytes = new Uint8Array(30);
  bytes.set([...Buffer.from('RIFF')], 0);
  bytes.set([...Buffer.from('WEBP')], 8);
  bytes.set([...Buffer.from('VP8X')], 12);
  bytes[16] = 10;
  const encodedWidth = width - 1;
  const encodedHeight = height - 1;
  bytes[24] = encodedWidth & 0xff;
  bytes[25] = (encodedWidth >>> 8) & 0xff;
  bytes[26] = (encodedWidth >>> 16) & 0xff;
  bytes[27] = encodedHeight & 0xff;
  bytes[28] = (encodedHeight >>> 8) & 0xff;
  bytes[29] = (encodedHeight >>> 16) & 0xff;
  return bytes;
}

// Genuine lossless WebP images encoded at each role's target dimensions.
// These exercise the actual byte stream, not just a mocked 30-byte WebP header.
const REAL_WEBP_BASE64 = {
  card: 'UklGRkIAAABXRUJQVlA4TDUAAAAvv8OzAAfQ//73v/8BIUHi//cmIvqf8Z///Oc///nPf/7zn//85z//+c9//vOf//znP/+fAAA=',
  hero: 'UklGRl4AAABXRUJQVlA4TFIAAAAvP8bgAAfQ//73v/8BAEX6/58i+p/63//+97///e9///vf//73v//973//+9///ve///3vf//73//+97///e9///vf//73v//973//+9///k8a',
  body: 'UklGRlAAAABXRUJQVlA4TEMAAAAvr8TgAAfQ//73v/8BAEX6/58i+p/63//+97///e9///vf//73v//973//+9///ve///3vf//73//+97///e9//9sNAA==',
};

export function imageFixture(role) {
  const kind = role === 'card' || role === 'hero' ? role : 'body';
  return Buffer.from(REAL_WEBP_BASE64[kind], 'base64');
}

