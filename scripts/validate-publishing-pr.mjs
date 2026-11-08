import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseDirectManifest } from '../publisher/lib/directHandoff.mjs';
import { inspectImageBytes } from '../publisher/lib/imageMetadata.mjs';
import { jobFromPullRequest } from '../publisher/lib/publishingJobs.mjs';
import { getSiteProfile } from '../publisher/siteProfiles.mjs';
import { branchFor, collectManifestErrors, collectPackagePreflightErrors } from '../publisher/lib/validation.mjs';

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const unique = (errors) => [...new Set(errors.filter(Boolean))];

function listProductionFiles(dir, errors, relative = '') {
  const found = [];
  for (const entry of fs.readdirSync(path.join(dir, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push('Symlink not permitted in publishing destination: ' + name);
    } else if (entry.isDirectory()) {
      found.push(...listProductionFiles(dir, errors, name));
    } else if (entry.isFile()) {
      found.push(name);
    } else {
      errors.push('Unsupported publishing destination entry: ' + name);
    }
  }
  return found;
}

export function checkPublishingPullRequest(event, { root = process.cwd() } = {}) {
  const pr = event?.pull_request;
  if (!pr || !String(pr.head?.ref || '').startsWith('publisher/')) {
    return { skipped: true, mode: 'unrelated', errors: [] };
  }
  const body = String(pr.body || '');
  const direct = /^- Handoff method:\s*\*\*Direct GitHub\*\*\s*$/mi.test(body);
  // Only preserve historical ZIP-origin PRs created before this gate's release.
  // A new PR cannot bypass the direct contract by copying a legacy description.
  const creationTime = Date.parse(String(pr.created_at || ''));
  const legacy = Number.isFinite(creationTime)
    && creationTime < Date.parse('2026-11-08T00:00:00Z')
    && /^- Operation:\s*\*\*Publish new post\*\*\s*$/mi.test(body)
    && /Complete package preflight passed before GitHub production blobs were created/i.test(body);
  if (!direct && legacy) return { skipped: true, mode: 'legacy-package', errors: [] };
  if (!direct) {
    return { skipped: false, mode: 'direct-github', errors: [
      'Publishing PR needs the exact Handoff method: **Direct GitHub** marker and full Publisher manifest, or a verified legacy-package handoff.',
    ] };
  }

  const repository = String(event.repository?.full_name || '');
  const errors = [];
  const job = jobFromPullRequest(repository, pr);
  if (!job || job.handoffMethod !== 'direct-github') {
    errors.push('Publishing PR identity fields are incomplete. Include Site profile, Slug, Destination, Canonical URL and a Publish/Update title.');
  }

  let manifest;
  try { manifest = parseDirectManifest(body); }
  catch (error) {
    return { skipped: false, mode: 'direct-github', errors: unique([...errors, error.message]) };
  }
  errors.push(...collectManifestErrors(manifest));
  if (errors.length) return { skipped: false, mode: 'direct-github', errors: unique(errors) };

  if (manifest.repository !== repository) errors.push('Manifest repository does not match GitHub PR repository.');
  if (job && Object.entries({
    slug: manifest.slug, destinationPath: manifest.destinationPath,
    canonicalUrl: manifest.canonicalUrl, targetSite: manifest.targetSite, title: manifest.title,
  }).some(([field, value]) => job.manifest[field] !== value)) {
    errors.push('Publisher manifest conflicts with visible PR identity fields or title.');
  }
  if (pr.head?.ref !== branchFor(manifest.slug)
      || pr.base?.ref !== 'main'
      || (pr.head?.repo?.full_name && pr.head.repo.full_name !== repository)) {
    errors.push('The handoff must use the publisher/<slug> branch from the target repository into main.');
  }
  if (errors.length) return { skipped: false, mode: 'direct-github', errors: unique(errors) };

  const profile = getSiteProfile(manifest);
  // Direct-GitHub handoffs do not use the ZIP Publisher's automatic sitemap staging.
  // Fail with an actionable error before the site's early validate:sitemap build step.
  if (profile.id === 'our-old-dad') {
    const sitemapPath = path.join(root, 'public', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      errors.push('Direct OOD publishing PR is missing checked-in public/sitemap.xml.');
    } else {
      const sitemap = fs.readFileSync(sitemapPath, 'utf8');
      if (!sitemap.includes(`<loc>${manifest.canonicalUrl}</loc>`)) {
        errors.push(`Direct OOD publishing PR must include ${manifest.canonicalUrl} in checked-in public/sitemap.xml before validation.`);
      }
    }
  }
  const destination = path.join(root, 'src', 'content', 'posts', manifest.slug);
  if (!fs.existsSync(destination) || !fs.statSync(destination).isDirectory()) {
    return { skipped: false, mode: 'direct-github', errors: ['Missing production post directory: ' + manifest.destinationPath] };
  }

  const productionPaths = listProductionFiles(destination, errors);
  const sourceFiles = {};
  const imageMetadata = [];
  let totalBytes = 0;

  for (const file of profile.sourceFiles) {
    if (!productionPaths.includes(file)) continue;
    const fullPath = path.join(destination, file);
    const size = fs.statSync(fullPath).size;
    if (size > MAX_SOURCE_BYTES) {
      errors.push(file + ': source exceeds the size limit.');
      continue;
    }
    totalBytes += size;
    sourceFiles[file] = fs.readFileSync(fullPath, 'utf8');
  }

  for (const image of manifest.images) {
    if (!productionPaths.includes(image.file)) continue;
    const fullPath = path.join(destination, image.file);
    const size = fs.statSync(fullPath).size;
    if (size > MAX_IMAGE_BYTES || totalBytes + size > MAX_TOTAL_BYTES) {
      errors.push(image.file + ': image or total payload exceeds the size limit.');
      continue;
    }
    const bytes = fs.readFileSync(fullPath);
    totalBytes += bytes.length;
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (!/^[0-9a-f]{64}$/i.test(String(image.sha256 || '')) || image.sha256.toLowerCase() !== digest) {
      errors.push(image.file + ': SHA-256 differs from the approved PR manifest.');
    }
    try {
      imageMetadata.push({ file: image.file, role: image.role, readable: true, ...inspectImageBytes(bytes) });
    } catch {
      imageMetadata.push({ file: image.file, role: image.role, readable: false, width: 0, height: 0 });
    }
  }
  errors.push(...collectPackagePreflightErrors({ manifest, productionPaths, sourceFiles, imageMetadata }));
  return { skipped: false, mode: 'direct-github', errors: unique(errors), slug: manifest.slug, imageCount: manifest.images.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is required to check a publishing PR.');
    process.exitCode = 2;
  } else {
    try {
      const result = checkPublishingPullRequest(JSON.parse(fs.readFileSync(eventPath, 'utf8')));
      if (result.skipped) {
        console.log('Publishing PR check skipped: ' + result.mode);
      } else if (result.errors.length) {
        console.error('Publishing PR contract FAILED:\n' + result.errors.map(e => '- ' + e).join('\n'));
        process.exitCode = 1;
      } else {
        console.log('Publishing PR contract passed for ' + result.slug + ' (' + result.imageCount + ' image roles). Technical validation does not grant editorial approval.');
      }
    } catch (error) {
      console.error('Publishing PR contract check failed: ' + error.message);
      process.exitCode = 1;
    }
  }
}
