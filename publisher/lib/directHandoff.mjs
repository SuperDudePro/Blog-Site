import { createHash } from 'node:crypto';
import { repoRequest } from './github.mjs';
import { inspectImageBytes } from './imageMetadata.mjs';
import { jobFromPullRequest } from './publishingJobs.mjs';
import { listDestinationFiles } from './repository.mjs';
import { branchFor, collectPackagePreflightErrors, validateManifest, validateRepository } from './validation.mjs';

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

export function parseDirectManifest(body) {
  const match = String(body || '').match(/(?:^|\n)## Publisher manifest[^\n]*\r?\n+\x60{3}json[ \t]*\r?\n([\s\S]*?)\r?\n\x60{3}/i);
  if (!match) throw new Error('Direct GitHub handoff must include a Publisher manifest JSON block in the draft PR.');
  try {
    const manifest = JSON.parse(match[1]);
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Manifest must be an object.');
    return manifest;
  } catch (error) {
    throw new Error('Direct GitHub manifest is invalid JSON: ' + error.message);
  }
}

function decodedGitBlob(blob, file) {
  if (!blob || blob.encoding !== 'base64' || !blob.content || !/^[0-9a-f]{40}$/i.test(file.sha)) {
    throw new Error(file.path + ': GitHub did not return a valid base64 blob.');
  }
  if (blob.sha && blob.sha !== file.sha) throw new Error(file.path + ': GitHub blob SHA does not match the PR tree.');
  const bytes = Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
  if (file.size && file.size !== bytes.length) throw new Error(file.path + ': blob length differs from PR tree.');
  return bytes;
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
    || (pull.head?.repo?.full_name && pull.head.repo.full_name !== repository)
    || !/^[0-9a-f]{40}$/i.test(pull.head?.sha || '')) {
    throw invalid('Direct handoff must use the deterministic publisher/slug branch in its target repository.');
  }
  const headSha = pull.head.sha;
  const head = await request(repository, '/git/commits/' + encodeURIComponent(headSha));
  const files = await listFiles(repository, head.tree?.sha, manifest.destinationPath);
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const preflight = { productionPaths: files.map((file) => file.path), sourceFiles: {}, imageMetadata: [] };
  const errors = [];
  const profile = (await import('../siteProfiles.mjs')).getSiteProfile(manifest);
  let bytesSeen = 0;

  for (const sourceName of profile.sourceFiles) {
    const file = filesByPath.get(sourceName);
    if (!file) continue;
    if (file.size > MAX_SOURCE_BYTES) {
      errors.push(sourceName + ': production source exceeds the safe size limit.');
      continue;
    }
    const content = decodedGitBlob(await request(repository, '/git/blobs/' + encodeURIComponent(file.sha)), file);
    bytesSeen += content.length;
    preflight.sourceFiles[sourceName] = content.toString('utf8');
  }

  for (const image of manifest.images) {
    const file = filesByPath.get(image.file);
    if (!file) continue;
    if (file.size > MAX_IMAGE_BYTES || bytesSeen + file.size > MAX_TOTAL_BYTES) {
      errors.push(image.file + ': the image or total direct-handoff payload exceeds the safe size limit.');
      continue;
    }
    const bytes = decodedGitBlob(await request(repository, '/git/blobs/' + encodeURIComponent(file.sha)), file);
    bytesSeen += bytes.length;
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (!/^[0-9a-f]{64}$/i.test(String(image.sha256 || '')) || image.sha256.toLowerCase() !== digest) {
      errors.push(image.file + ': SHA-256 does not match the approved image-byte digest in the PR manifest.');
    }
    let metadata = { file: image.file, role: image.role, readable: false, width: 0, height: 0, bytes: bytes.length };
    try {
      metadata = { file: image.file, role: image.role, readable: true, ...inspectImageBytes(bytes) };
    } catch {
      // The shared preflight emits the actual unreadable-image error.
    }
    preflight.imageMetadata.push(metadata);
  }

  errors.push(...collectPackagePreflightErrors({ manifest, ...preflight }));
  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    manifest,
    commitSha: headSha,
    imageCount: preflight.imageMetadata.length,
    verifiedFiles: files.length,
  };
}
