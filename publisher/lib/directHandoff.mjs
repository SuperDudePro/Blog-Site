import { createHash } from 'node:crypto';
import { repoRequest } from './github.mjs';
import { inspectImageBytes } from './imageMetadata.mjs';
import { jobFromPullRequest, pullRequestIsFromRepository } from './publishingJobs.mjs';
import { listDestinationFiles } from './repository.mjs';
import { branchFor, collectPackagePreflightErrors, validateManifest, validateRepository } from './validation.mjs';
import { getSiteProfile } from '../siteProfiles.mjs';

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

export function parseDirectManifest(body) {
  const match = String(body || '').match(/(?:^|\n)## Publisher manifest[^\n]*\r?\n+\x60{3}json[ \t]*\r?\n([\s\S]*?)\r?\n\x60{3}/i);
  if (!match) throw new Error('A publishing handoff must include a Publisher manifest JSON block in the draft PR.');
  try {
    const manifest = JSON.parse(match[1]);
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Manifest must be an object.');
    return manifest;
  } catch (error) {
    throw new Error('The Publisher manifest is invalid JSON: ' + error.message);
  }
}

function decodedGitBlob(blob, file) {
  if (!blob || blob.encoding !== 'base64' || !blob.content || !/^[0-9a-f]{40}$/i.test(file.sha)) {
    throw new Error(file.path + ': GitHub did not return a valid base64 blob.');
  }
  if (blob.sha && blob.sha !== file.sha) throw new Error(file.path + ': GitHub blob SHA does not match the requested file.');
  const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
  if (file.size && file.size !== bytes.length) throw new Error(file.path + ': blob length differs from its recorded size.');
  return bytes;
}

// Reads one post's production files from GitHub blobs and holds them to the
// package contract: paths, source metadata, reader CTA, image roles, alt text
// and geometry. `files` are `{ path, sha, size }` records relative to the
// post folder. Returns the defects found and the SHA-256 of each image's
// exact bytes.
//
// The direct-handoff verifier runs this on a pull request's head, and the
// Publisher runs it on an uploaded package before writing its draft, so both
// handoff paths answer to one set of checks.
export async function inspectProductionBlobs({ repository, manifest, files, request = repoRequest }) {
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const preflight = { productionPaths: files.map((file) => file.path), sourceFiles: {}, imageMetadata: [] };
  const errors = [];
  const digests = new Map();
  const profile = getSiteProfile(manifest);
  let bytesSeen = 0;

  const read = async (file) => {
    if (!/^[0-9a-f]{40}$/i.test(String(file.sha || ''))) {
      errors.push(file.path + ': the blob SHA is not valid.');
      return null;
    }
    try {
      return decodedGitBlob(await request(repository, '/git/blobs/' + encodeURIComponent(file.sha)), file);
    } catch (error) {
      if (error.status !== 404) throw error;
      errors.push(file.path + ': the blob was not found in the repository.');
      return null;
    }
  };

  for (const sourceName of profile.sourceFiles) {
    const file = filesByPath.get(sourceName);
    if (!file) continue;
    if (file.size > MAX_SOURCE_BYTES) {
      errors.push(sourceName + ': production source exceeds the safe size limit.');
      continue;
    }
    const content = await read(file);
    if (!content) continue;
    bytesSeen += content.length;
    preflight.sourceFiles[sourceName] = content.toString('utf8');
  }

  for (const image of manifest.images) {
    const file = filesByPath.get(image.file);
    if (!file) continue;
    if (file.size > MAX_IMAGE_BYTES || bytesSeen + file.size > MAX_TOTAL_BYTES) {
      errors.push(image.file + ': the image or total handoff payload exceeds the safe size limit.');
      continue;
    }
    const bytes = await read(file);
    if (!bytes) continue;
    bytesSeen += bytes.length;
    digests.set(image.file, createHash('sha256').update(bytes).digest('hex'));
    let metadata = { file: image.file, role: image.role, readable: false, width: 0, height: 0, bytes: bytes.length };
    try {
      metadata = { file: image.file, role: image.role, readable: true, ...inspectImageBytes(bytes) };
    } catch {
      // The shared preflight emits the actual unreadable-image error.
    }
    preflight.imageMetadata.push(metadata);
  }

  errors.push(...collectPackagePreflightErrors({ manifest, ...preflight }));
  return { errors: [...new Set(errors)], digests, imageCount: preflight.imageMetadata.length };
}

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function verifyDirectHandoff({ repository, prNumber }, dependencies = {}) {
  validateRepository(repository);
  if (!Number.isSafeInteger(prNumber) || prNumber < 1) throw invalid('A numeric GitHub PR number is required.');
  const request = dependencies.request || repoRequest;
  const listFiles = dependencies.listFiles || listDestinationFiles;
  const pull = await request(repository, '/pulls/' + prNumber);
  // Checked first and strictly: a fork can reproduce the branch name, the
  // description, and the files, and a deleted fork reports no head repository.
  if (!pullRequestIsFromRepository(pull, repository)) {
    throw invalid('The pull request does not come from ' + repository + '; a fork cannot be a Publisher handoff.');
  }
  const job = jobFromPullRequest(repository, pull);
  if (!job || job.handoffMethod !== 'direct-github') throw invalid('The PR is not a marked Publisher direct GitHub handoff.');
  if (pull.state !== 'open' && !pull.merged_at) throw invalid('The publishing PR was closed without merging.');
  const manifest = parseDirectManifest(pull.body);
  validateManifest(manifest);

  if (manifest.repository !== repository
    || job.manifest.slug !== manifest.slug
    || job.manifest.destinationPath !== manifest.destinationPath
    || job.manifest.canonicalUrl !== manifest.canonicalUrl
    || job.manifest.targetSite !== manifest.targetSite
    || job.manifest.title !== manifest.title) {
    throw invalid('Direct manifest conflicts with the visible PR identity fields.');
  }
  if (pull.head?.ref !== branchFor(manifest.slug)
    || pull.base?.ref !== 'main'
    || !pullRequestIsFromRepository(pull, repository)
    || !/^[0-9a-f]{40}$/i.test(pull.head?.sha || '')) {
    throw invalid('Direct handoff must use the deterministic publisher/slug branch in its target repository.');
  }
  const headSha = pull.head.sha;
  const head = await request(repository, '/git/commits/' + encodeURIComponent(headSha));
  const files = await listFiles(repository, head.tree?.sha, manifest.destinationPath);
  const inspection = await inspectProductionBlobs({ repository, manifest, files, request });
  const errors = [];
  for (const image of manifest.images) {
    const digest = inspection.digests.get(image.file);
    if (digest && (!/^[0-9a-f]{64}$/i.test(String(image.sha256 || '')) || image.sha256.toLowerCase() !== digest)) {
      errors.push(image.file + ': SHA-256 does not match the approved image-byte digest in the PR manifest.');
    }
  }
  errors.push(...inspection.errors);
  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    manifest,
    commitSha: headSha,
    imageCount: inspection.imageCount,
    verifiedFiles: files.length,
  };
}
