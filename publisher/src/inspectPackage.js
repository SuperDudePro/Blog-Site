import JSZip from 'jszip';
import { allowedProductionPaths, getSiteProfile, imageManifestErrors } from '../siteProfiles.mjs';
import { expectedGeometry, inspectImageBytes } from '../lib/imageMetadata.mjs';
import { captionMatchesSource } from './inspectionText.js';
import { extractField, normalizePackageManifest } from './packageManifest.js';

const normalize = (value) => value.replace(/\\/g, '/').replace(/^\.\//, '');
const escapeRx = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const find = (zip, test) => Object.values(zip.files).find((entry) => !entry.dir && test(normalize(entry.name)));

export function hasRequiredContactCta(profileId, source) {
  const hosts = {
    lifeeducation: 'https://www\\.lifeeducation\\.org',
    'our-old-dad': 'https://ourolddad\\.com',
  };
  const host = hosts[profileId];
  if (!host) return false;
  return new RegExp(
    `<a\\b[^>]*\\bhref\\s*=\\s*(?:["'](?:${host})?\\/contact(?:[?#][^"']*)?["']|\\{\\s*["'](?:${host})?\\/contact(?:[?#][^"']*)?["']\\s*\\})[^>]*>`,
    'i',
  ).test(source);
}

export async function inspectPackage(file) {
  const zip = await JSZip.loadAsync(file);
  const files = Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => normalize(entry.name)).sort();
  const manifestEntry = find(zip, (name) => name.endsWith('/source/package-manifest.json'));
  if (!manifestEntry) throw new Error('No source/package-manifest.json was found.');

  const rawManifest = JSON.parse(await manifestEntry.async('text'));
  const initialManifest = normalizePackageManifest(rawManifest);
  const profile = getSiteProfile(initialManifest);
  const root = normalize(manifestEntry.name).replace(/\/source\/package-manifest\.json$/, '');
  const dropPrefix = `${root}/drop-in/${initialManifest.slug}/`;
  const sourceEntries = profile.sourceFiles.map((name) => zip.file(`${dropPrefix}${name}`));
  const sourceTexts = await Promise.all(sourceEntries.map((entry) => entry ? entry.async('text') : ''));
  const sourceFiles = Object.fromEntries(profile.sourceFiles.map((name, index) => [name, sourceTexts[index]]));
  const source = sourceTexts.join('\n');
  const manifest = normalizePackageManifest(rawManifest, source);
  const checks = [];
  const add = (group, label, ok, detail) => checks.push({ group, label, ok, detail });

  add('Package', 'Site profile', manifest.targetSite === profile.targetSite, manifest.targetSite || 'Missing');
  add('Package', 'Repository', manifest.repository === profile.repository, manifest.repository || 'Missing');
  add('Package', 'Destination', manifest.destinationPath === `src/content/posts/${manifest.slug}/`, manifest.destinationPath || 'Missing');
  add('Package', 'Canonical URL', manifest.canonicalUrl === `${profile.canonicalPrefix}${manifest.slug}`, manifest.canonicalUrl || 'Missing');
  add('Package', 'Build command', manifest.buildCommand === profile.buildCommand, manifest.buildCommand || 'Missing');
  profile.sourceFiles.forEach((name, index) => add('Package', `Production ${name}`, Boolean(sourceEntries[index]), sourceEntries[index] ? 'Found' : `Missing ${name}`));
  for (const name of ['README-HANDOFF.md', 'source/post.md', 'source/image-notes.md']) {
    const present = files.includes(`${root}/${name}`);
    add('Package', name, present, present ? 'Found' : 'Missing');
  }

  for (const field of profile.metadataFields) {
    const actual = extractField(source, field);
    const expected = String(manifest[field] ?? '');
    add('Metadata', field, actual === expected, actual === expected ? expected : `Manifest: ${expected}; source: ${actual || 'missing'}`);
  }
  if (profile.id === 'lifeeducation') {
    const tags = Array.isArray(manifest.tags) ? manifest.tags : [];
    const tagsMatch = tags.length > 0 && tags.every((tag) => source.includes(`"${tag}"`) || source.includes(`'${tag}'`));
    add('Metadata', 'tags', tagsMatch, tagsMatch ? tags.join(', ') : 'Manifest tags are missing or do not match meta.ts');
  }
  const contactCta = hasRequiredContactCta(profile.id, source);
  add(
    'Editorial',
    'Reader CTA and contact path',
    contactCta,
    contactCta ? 'Linked to the site contact page' : `${profile.targetSite} posts must include a reader-facing CTA linked to the site contact page`,
  );

  const roleErrors = imageManifestErrors(profile, manifest.images);
  for (const message of roleErrors) add('Images', 'Role contract', false, message);
  if (!roleErrors.length) add('Images', 'Role contract', true, `${manifest.images.length - 2} approved body images`);

  const imageMetadata = [];
  const images = await Promise.all((manifest.images || []).map(async (image) => {
    const entry = zip.file(`${dropPrefix}${image.file}`);
    const bytes = entry ? await entry.async('uint8array') : null;
    const blob = bytes ? new Blob([bytes]) : null;
    let metadata = { file: image.file, role: image.role, readable: false, width: 0, height: 0, bytes: bytes?.length || 0 };
    if (bytes) {
      try {
        metadata = { file: image.file, role: image.role, readable: true, ...inspectImageBytes(bytes) };
      } catch {
        // The validation result below reports unreadable image data.
      }
    }
    imageMetadata.push(metadata);
    const view = {
      ...image,
      url: blob ? URL.createObjectURL(blob) : '',
      present: Boolean(blob),
      imported: new RegExp(`["']\\./${escapeRx(image.file)}["']`).test(source),
      altMatches: Boolean(image.alt && source.includes(image.alt)),
      captionMatches: captionMatchesSource(source, image.caption),
    };
    add('Images', `${image.file}: file`, view.present, view.present ? 'Found' : 'Missing');
    add('Images', `${image.file}: import`, view.imported, view.imported ? 'Referenced' : 'Not referenced');
    add('Images', `${image.file}: alt`, view.altMatches, view.altMatches ? 'Matches' : 'Does not match');
    if (image.caption) add('Images', `${image.file}: caption`, view.captionMatches, view.captionMatches ? 'Matches' : 'Does not match');
    const expected = expectedGeometry(image.role);
    const geometryOk = Boolean(metadata.readable && expected && metadata.width === expected.width && metadata.height === expected.height);
    add(
      'Images',
      `${image.file}: geometry`,
      geometryOk,
      !metadata.readable
        ? 'Unreadable PNG, JPEG, or WebP data'
        : expected
          ? `${metadata.width}x${metadata.height}; expected ${expected.width}x${expected.height}`
          : `Unsupported image role: ${image.role}`,
    );
    return view;
  }));

  const productionFiles = files.filter((name) => name.startsWith(dropPrefix));
  const relativeProductionFiles = productionFiles.map((name) => name.slice(dropPrefix.length));
  imageMetadata.sort((a, b) => a.file.localeCompare(b.file));
  const allowed = allowedProductionPaths(profile, manifest.images);
  const unexpected = relativeProductionFiles.filter((name) => !allowed.has(name));
  add('Package', 'Production file allowlist', unexpected.length === 0, unexpected.length ? `Unexpected: ${unexpected.join(', ')}` : 'Only intended production files found');

  if (manifest.playlistLinks) {
    const playlist = manifest.playlistLinks;
    add('Playlist', 'YouTube URL', playlist.youtube.includes(`list=${playlist.playlistId}`), playlist.youtube);
    add('Playlist', 'YouTube Music URL', playlist.youtubeMusic.includes(`list=${playlist.playlistId}`), playlist.youtubeMusic);
    add('Playlist', 'Links rendered', source.includes(playlist.youtube) && source.includes(playlist.youtubeMusic), playlist.playlistId);
  }

  return {
    root,
    dropPrefix,
    manifest,
    profile,
    files,
    productionFiles,
    checks,
    images,
    preflight: {
      productionPaths: relativeProductionFiles,
      sourceFiles,
      imageMetadata,
    },
  };
}
