import { createHash } from 'node:crypto';
import { inspectImageBytes } from './imageMetadata.mjs';

const targets = Object.freeze({
  'SuperDudePro/Blog-Site': ['src/assets/site-art/', 'public/site-art/'],
  'SuperDudePro/LifeEducationOrg': ['src/assets/site-art/', 'public/site-art/'],
});

export function validateSiteArtwork({ repository, path, content, sha256 }) {
  if (!Object.hasOwn(targets, repository)) throw new Error('Site artwork repository is not permitted.');
  if (typeof path !== 'string' || !/^[a-zA-Z0-9_./-]+$/.test(path) || path.includes('..') || path.startsWith('/')) throw new Error('Unsafe artwork path.');
  if (!targets[repository].some(prefix => path.startsWith(prefix))) throw new Error('Artwork path must be in an approved site-art directory.');
  const extension = path.match(/\.(png|jpe?g|webp)$/i)?.[1]?.toLowerCase();
  if (!extension) throw new Error('Artwork must be PNG, JPEG, or WebP.');
  if (typeof content !== 'string' || content.length > 8_000_000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(content)) throw new Error('Invalid or oversized base64 image.');
  const bytes = Buffer.from(content, 'base64');
  if (!bytes.length || bytes.length > 6_000_000 || bytes.toString('base64') !== content) throw new Error('Noncanonical or oversized image data.');
  const meta = inspectImageBytes(bytes);
  const format = extension === 'jpg' ? 'jpeg' : extension;
  if (meta.format !== format || meta.width < 1 || meta.height < 1 || meta.width > 6000 || meta.height > 6000) throw new Error('Image format or dimensions invalid.');
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== digest) throw new Error('Image SHA-256 mismatch; refusing altered artwork.');
  return { bytes, digest, meta };
}