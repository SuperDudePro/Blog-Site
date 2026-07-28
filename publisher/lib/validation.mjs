import { allowedProductionPaths, getSiteProfile, imageManifestErrors, SITE_PROFILES } from '../siteProfiles.mjs';

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

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') fail('Manifest is missing.');
  const required = ['targetSite', 'repository', 'title', 'slug', 'excerpt', 'publishedAt', 'status', 'destinationPath', 'canonicalUrl', 'buildCommand', 'images'];
  for (const field of required) if (!manifest[field]) fail(`Manifest is missing ${field}.`);

  validateRepository(manifest.repository);
  let profile;
  try {
    profile = getSiteProfile(manifest);
  } catch (error) {
    fail(error.message);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)) fail('Slug must be lowercase kebab-case.');
  if (!validIsoDate(manifest.publishedAt)) fail('Published date must be a real YYYY-MM-DD date.');
  const destination = `src/content/posts/${manifest.slug}/`;
  if (manifest.destinationPath !== destination) fail(`Destination must be ${destination}`);
  if (manifest.canonicalUrl !== `${profile.canonicalPrefix}${manifest.slug}`) fail('Canonical URL does not match the selected site profile and slug.');
  if (manifest.buildCommand !== profile.buildCommand) fail(`Build command must be ${profile.buildCommand}.`);
  if (!profile.statuses.includes(manifest.status)) fail(`Unsupported ${profile.targetSite} status: ${manifest.status}`);

  if (profile.id === 'our-old-dad') {
    if (!profile.sections.includes(manifest.section)) fail(`Unsupported Our Old Dad section: ${manifest.section || 'missing'}`);
  } else if (profile.id === 'lifeeducation') {
    if (typeof manifest.topic !== 'string' || !manifest.topic.trim()) fail('LifeEducation topic is required.');
    if (!Array.isArray(manifest.tags) || !manifest.tags.length || manifest.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
      fail('LifeEducation tags must be a non-empty string array.');
    }
  }

  const imageErrors = imageManifestErrors(profile, manifest.images);
  if (imageErrors.length) fail(imageErrors[0]);
  return manifest;
}

export function safeRelative(path) {
  const value = String(path || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!value || value.includes('../') || value.startsWith('..')) fail(`Unsafe path: ${path}`);
  return value;
}

export function validateProductionPaths(manifest, paths) {
  validateManifest(manifest);
  const profile = getSiteProfile(manifest);
  const allowed = allowedProductionPaths(profile, manifest.images);
  const normalized = paths.map(safeRelative);
  if (new Set(normalized).size !== normalized.length) fail('The package contains duplicate production paths.');
  const unexpected = normalized.filter((path) => !allowed.has(path));
  if (unexpected.length) fail(`Unexpected production file: ${unexpected[0]}`);
  const missing = [...allowed].filter((path) => !normalized.includes(path));
  if (missing.length) fail(`Missing production file: ${missing[0]}`);
  return normalized;
}

export function branchFor(slug) {
  return `publisher/${slug}-${Date.now()}`;
}
