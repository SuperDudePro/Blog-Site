import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SEO_FIELDS = ['seoTitle', 'seoDescription'];
function removeOverrides(source) {
  let output = source;
  for (const field of SEO_FIELDS) {
    const pattern = new RegExp('^([ \\t]*)' + field + ':\\s*(?:"(?:[^"\\\\]|\\\\.)*"|\\x27(?:[^\\x27\\\\]|\\\\.)*\\x27),[ \\t]*\\r?\\n', 'gm');
    const matches = [...output.matchAll(pattern)];
    if (matches.length > 1) return null;
    if (matches.length) output = output.replace(pattern, '');
    // Any unrecognized definition of the SEO field fails closed.
    if (new RegExp('\\b' + field + '\\s*:').test(output)) return null;
  }
  return output;
}
export function isSeoOnlyChange(before, after) {
  if (before === after) return false;
  const cleanBefore = removeOverrides(before);
  const cleanAfter = removeOverrides(after);
  return cleanBefore !== null && cleanAfter !== null && cleanBefore === cleanAfter;
}

export function isPlaylistLinkOnlyChange(before, after) {
  const normalize = (source) => source.replace(/(https?:\/\/(?:music\.|www\.)?youtube\.com\/[^\s"'<>]+?)([?&](?:amp;)?list=)([A-Za-z0-9_-]+)/g, (_, prefix, parameter) => prefix + parameter + 'PLAYLIST_ID');
  return before !== after && normalize(before) === normalize(after);
}

export function isYoutubeMusicButtonRemovalOnlyChange(before, after) {
  if (before === after) return false;
  const strip = (source) => source.replace(/^[ \\t]*<a class="button button--ghost" href="https:\/\/music\.youtube\.com\/playlist\?list=[^"\n]+"[^\n]*<\/a>[ \\t]*\r?\n/gm, '');
  return strip(before) === strip(after);
}

export function nonMaterialTouchedSlugs(root, base, changedFiles) {
  const bySlug = new Map();
  for (const file of changedFiles) {
    const match = file.match(/^src\/content\/posts\/([^/]+)\/(.+)$/);
    if (!match) continue;
    if (!bySlug.has(match[1])) bySlug.set(match[1], []);
    bySlug.get(match[1]).push({ file, relative: match[2] });
  }
  const allowed = new Set();
  for (const [slug, files] of bySlug) {
    if (files.length !== 1 || files[0].relative !== 'index.ts') continue;
    try {
      const before = execFileSync('git', ['show', base + ':' + files[0].file], { cwd: root, encoding: 'utf8' });
      const after = readFileSync(path.join(root, files[0].file), 'utf8');
      if (isSeoOnlyChange(before, after) || isPlaylistLinkOnlyChange(before, after) || isYoutubeMusicButtonRemovalOnlyChange(before, after)) allowed.add(slug);
    } catch {}
  }
  return allowed;
}
