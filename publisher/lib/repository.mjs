import { repoRequest } from './github.mjs';
import { safeRelative } from './validation.mjs';

export async function listDestinationFiles(repository, treeSha, destinationPath) {
  const tree = await repoRequest(repository, `/git/trees/${treeSha}?recursive=1`);
  const prefix = String(destinationPath || '').replace(/^\/+/, '').replace(/\/?$/, '/');
  return (tree.tree || [])
    .filter((entry) => entry.type === 'blob' && entry.path?.startsWith(prefix))
    .map((entry) => ({
      path: safeRelative(entry.path.slice(prefix.length)),
      sha: entry.sha,
      size: entry.size || 0,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function compareDestination(existingFiles, uploadedFiles) {
  const existing = new Map(existingFiles.map((file) => [safeRelative(file.path), file]));
  const uploaded = new Map(uploadedFiles.map((file) => [safeRelative(file.path), file]));

  const added = [];
  const replaced = [];
  const unchanged = [];
  const deleted = [];

  for (const [path, file] of uploaded) {
    const current = existing.get(path);
    if (!current) added.push(path);
    else if (current.sha === file.sha) unchanged.push(path);
    else replaced.push(path);
  }

  for (const path of existing.keys()) if (!uploaded.has(path)) deleted.push(path);

  return {
    added: added.sort(),
    replaced: replaced.sort(),
    unchanged: unchanged.sort(),
    deleted: deleted.sort(),
  };
}
