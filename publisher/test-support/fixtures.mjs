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

export function imageFixture(role) {
  if (role === 'card') return webpFixture(960, 720);
  if (role === 'hero') return webpFixture(1600, 900);
  return webpFixture(1200, 900);
}
