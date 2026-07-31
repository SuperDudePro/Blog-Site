import { allowedProductionPaths, getSiteProfile, imageManifestErrors, SITE_PROFILES } from '../siteProfiles.mjs';
import { extractField } from '../src/packageManifest.js';
import { expectedGeometry } from './imageMetadata.mjs';

const configuredRepositories = () => {
  const registered = SITE_PROFILES.map((profile) => profile.repository);
  const configured = [
    process.env.PUBLISHER_REPOSITORIES,
    process.env.PUBLISHER_REPOSITORY,
  ].filter(Boolean).flatMap((value) => value.split(','));
  return new Set([...registered, ...configured].map((value) => value.trim()).filter(Boolean));
};

const fail = (message) => {
  throw Object.assign(new Error(message), { status: 400 });
};

const unique = (values) => [...new Set(values.filter(Boolean))];

function preflightFailure(errors) {
  const values = unique(errors);
  const error = new Error(values.length === 1
    ? values[0]
    : `Package preflight found ${values.length} defects:\n${values.map((value) => `- ${value}`).join('\n')}`);
  error.status = 400;
  error.code = 'PACKAGE_PREFLIGHT_FAILED';
  error.details = { errors: values };
  return error;
}

function contactCta(profile, source) {
  const hosts = {
    lifeeducation: 'https://www\\.lifeeducation\\.org',
    'our-old-dad': 'https://(?:www\\.)?ourolddad\\.com',
  };
  const host = hosts[profile.id];
  if (!host) return false;
  return new RegExp(
    `<a\\b[^>]*\\bhref\\s*=\\s*(?:["'](?:${host})?\\/contact(?:[?#][^"']*)?["']|\\{\\s*["'](?:${host})?\\/contact(?:[?#][^"']*)?["']\\s*\\})[^>]*>`,
    'i',
  ).test(source);
}

export function validateRepository(repository) {
  try {
    getSiteProfile({ repository });
  } catch (error) {
    fail(error.message);
  }
  if (!configuredRepositories().has(repository)) fail(`Unsupported repository: ${repository}`);
  return repository;
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function collectManifestErrors(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['Manifest is missing.'];
  const errors = [];
  const required = ['targetSite', 'repository', 'title', 'slug', 'excerpt', 'publishedAt', 'status', 'destinationPath', 'canonicalUrl', 'buildCommand', 'images'];
  for (const field of required) if (!manifest[field]) errors.push(`Manifest is missing ${field}.`);

  let profile;
  try {
    validateRepository(manifest.repository);
    profile = getSiteProfile(manifest);
  } catch (error) {
    errors.push(error.message);
  }

  if (manifest.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)) errors.push('Slug must be lowercase kebab-case.');
  if (manifest.publishedAt && !validIsoDate(manifest.publishedAt)) errors.push('Published date must be a real YYYY-MM-DD date.');
  if (manifest.slug) {
    const destination = `src/content/posts/${manifest.slug}/`;
    if (manifest.destinationPath !== destination) errors.push(`Destination must be ${destination}`);
  }
  if (profile) {
    if (manifest.slug && manifest.canonicalUrl !== `${profile.canonicalPrefix}${manifest.slug}`) {
      errors.push('Canonical URL does not match the selected site profile and slug.');
    }
    if (manifest.buildCommand !== profile.buildCommand) errors.push(`Build command must be ${profile.buildCommand}.`);
    if (manifest.status && !profile.statuses.includes(manifest.status)) errors.push(`Unsupported ${profile.targetSite} status: ${manifest.status}`);
  }

  if (profile?.id === 'our-old-dad') {
    if (!profile.sections.includes(manifest.section)) errors.push(`Unsupported Our Old Dad section: ${manifest.section || 'missing'}`);
  } else if (profile?.id === 'lifeeducation') {
    if (typeof manifest.topic !== 'string' || !manifest.topic.trim()) errors.push('LifeEducation topic is required.');
    if (!Array.isArray(manifest.tags) || !manifest.tags.length || manifest.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
      errors.push('LifeEducation tags must be a non-empty string array.');
    }
  }

  if (profile) errors.push(...imageManifestErrors(profile, manifest.images));
  return unique(errors);
}

export function validateManifest(manifest) {
  const errors = collectManifestErrors(manifest);
  if (errors.length) throw preflightFailure(errors);
  return manifest;
}

export function safeRelative(path) {
  const value = String(path || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!value || value.includes('../') || value.startsWith('..')) fail(`Unsafe path: ${path}`);
  return value;
}

export function collectProductionPathErrors(manifest, paths) {
  const errors = [];
  let profile;
  try {
    profile = getSiteProfile(manifest);
  } catch (error) {
    return [error.message];
  }
  const allowed = allowedProductionPaths(profile, manifest.images);
  const normalized = [];
  for (const path of Array.isArray(paths) ? paths : []) {
    try {
      normalized.push(safeRelative(path));
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (new Set(normalized).size !== normalized.length) errors.push('The package contains duplicate production paths.');
  for (const path of normalized.filter((value) => !allowed.has(value))) errors.push(`Unexpected production file: ${path}`);
  for (const path of [...allowed].filter((value) => !normalized.includes(value))) errors.push(`Missing production file: ${path}`);
  return unique(errors);
}

export function validateProductionPaths(manifest, paths) {
  const errors = [...collectManifestErrors(manifest), ...collectProductionPathErrors(manifest, paths)];
  if (errors.length) throw preflightFailure(errors);
  return paths.map(safeRelative);
}

export function collectPackagePreflightErrors({ manifest, productionPaths = [], sourceFiles = {}, imageMetadata = [] }) {
  const errors = [
    ...collectManifestErrors(manifest),
    ...collectProductionPathErrors(manifest, productionPaths),
  ];
  let profile;
  try {
    profile = getSiteProfile(manifest);
  } catch {
    return unique(errors);
  }

  const source = profile.sourceFiles.map((name) => String(sourceFiles?.[name] || '')).join('\n');
  for (const name of profile.sourceFiles) {
    if (!String(sourceFiles?.[name] || '').trim()) errors.push(`Production ${name} is missing or empty.`);
  }
  for (const field of profile.metadataFields) {
    const expected = String(manifest?.[field] ?? '');
    const actual = extractField(source, field);
    if (actual !== expected) errors.push(`${field} does not match source (manifest: ${expected || 'missing'}; source: ${actual || 'missing'}).`);
  }
  if (profile.id === 'lifeeducation') {
    for (const tag of Array.isArray(manifest.tags) ? manifest.tags : []) {
      if (!source.includes(`"${tag}"`) && !source.includes(`'${tag}'`)) errors.push(`LifeEducation tag is missing from meta.ts: ${tag}`);
    }
  }
  if (!contactCta(profile, source)) errors.push(`${profile.targetSite} source is missing a reader CTA linked to /contact.`);

  const importIdentifiers = new Map();
  for (const match of source.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+["']\.\/([^"']+\.(?:png|jpe?g|webp))["']/gi)) {
    const values = importIdentifiers.get(match[2]) || [];
    values.push(match[1]);
    importIdentifiers.set(match[2], values);
  }
  const metadataByFile = new Map((Array.isArray(imageMetadata) ? imageMetadata : []).map((value) => [value?.file, value]));
  for (const image of Array.isArray(manifest.images) ? manifest.images : []) {
    const metadata = metadataByFile.get(image.file);
    if (!metadata) {
      errors.push(`${image.file} is missing image metadata.`);
      continue;
    }
    if (!metadata.readable) {
      errors.push(`${image.file} does not contain readable PNG, JPEG, or WebP data.`);
      continue;
    }
    const expected = expectedGeometry(image.role);
    if (expected && (metadata.width !== expected.width || metadata.height !== expected.height)) {
      errors.push(`${image.file} is ${metadata.width}x${metadata.height}; ${image.role} requires ${expected.width}x${expected.height}.`);
    }
    const identifiers = importIdentifiers.get(image.file) || [];
    if (!identifiers.length) {
      errors.push(`${image.file} is not imported by the production source.`);
    } else {
      const rendered = identifiers.some((identifier) => {
        if (image.role === 'card') {
          return new RegExp(`\\bcardImage\\s*:\\s*${identifier}\\b`).test(source)
            || (identifier === 'cardImage' && /\bcardImage\s*[,}]/.test(source));
        }
        if (image.role === 'hero') {
          return new RegExp(`\\bheroImage\\s*:\\s*${identifier}\\b`).test(source)
            || (identifier === 'heroImage' && /\bheroImage\s*[,}]/.test(source));
        }
        return new RegExp(
          profile.id === 'lifeeducation'
            ? `<PostFigure\\b[^>]*\\bsrc\\s*=\\s*\\{${identifier}\\}`
            : `<img\\b[^>]*\\bsrc\\s*=\\s*["']\\$\\{${identifier}\\}["']`,
          'i',
        ).test(source);
      });
      if (!rendered) errors.push(`${image.file} is imported but not rendered in its declared ${image.role} role.`);
    }
    if (!image.alt || !source.includes(image.alt)) errors.push(`${image.file} alt text does not match the production source.`);
  }
  return unique(errors);
}

export function validatePackagePreflight(packageData) {
  const errors = collectPackagePreflightErrors(packageData);
  if (errors.length) throw preflightFailure(errors);
  return packageData;
}

export function branchFor(slug) {
  return `publisher/${slug}`;
}
