const ALLOWED_REPOSITORY = process.env.PUBLISHER_REPOSITORY || 'SuperDudePro/Blog-Site';

export function validateRepository(repository) {
  if (repository !== ALLOWED_REPOSITORY) throw Object.assign(new Error(`Unsupported repository: ${repository}`), { status: 400 });
  return repository;
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw Object.assign(new Error('Manifest is missing.'), { status: 400 });
  const required = ['repository', 'title', 'slug', 'destinationPath', 'canonicalUrl', 'buildCommand'];
  for (const field of required) if (!manifest[field]) throw Object.assign(new Error(`Manifest is missing ${field}.`), { status: 400 });
  validateRepository(manifest.repository);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)) throw Object.assign(new Error('Slug must be lowercase kebab-case.'), { status: 400 });
  const destination = `src/content/posts/${manifest.slug}/`;
  if (manifest.destinationPath !== destination) throw Object.assign(new Error(`Destination must be ${destination}`), { status: 400 });
  if (manifest.canonicalUrl !== `https://ourolddad.com/post/${manifest.slug}`) throw Object.assign(new Error('Canonical URL does not match the slug.'), { status: 400 });
  if (manifest.buildCommand !== 'npm run build') throw Object.assign(new Error('Unsupported build command.'), { status: 400 });
  return manifest;
}

export function safeRelative(path) {
  const value = String(path || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!value || value.includes('../') || value.startsWith('..')) throw Object.assign(new Error(`Unsafe path: ${path}`), { status: 400 });
  return value;
}

export function branchFor(slug) {
  return `publisher/${slug}-${Date.now()}`;
}
