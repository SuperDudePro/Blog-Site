import { getSiteProfile } from '../siteProfiles.mjs';
import { validateManifest } from './validation.mjs';
import { parseDirectManifest } from './directHandoff.mjs';
import { jobFromPullRequest } from './publishingJobs.mjs';
import { extractField } from '../src/packageManifest.js';
import { deployedCommitIsReady, inspectPublishedHtml } from './publishStatus.mjs';

export const LEDGER_REPO = 'SuperDudePro/Wilbert';
export const LEDGER_PATH = '14_Writing_Communications/blog_post_tracker.md';
export const LEDGER_CONTEXT = 'Wilbert post ledger';
const SHA = /^[a-f0-9]{40}$/i;
const placeholder = '## Placeholder / Not Social-Ready';
const indexHeader = '## Current Social-Ready Index';
const clean = value => String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
const scalar = value => clean(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
const oneLine = (value, max = 1500) => {
  const s = scalar(value);
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ') > max / 2 ? cut.lastIndexOf(' ') : cut.length) + '…';
};
const siteName = profile => profile.id === 'our-old-dad' ? 'OurOldDad' : 'LifeEducation';
const exactSite = value => clean(value).replace(/\s/g, '').toLowerCase();
const field = (block, label) => block.match(new RegExp('^- ' + label + ': (.*)$', 'm'))?.[1] || '';
const slugOf = block => field(block, 'Slug').replace(/^\x60|\x60$/g, '');
const sections = source => [...source.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)].map(m => plain(m[1])).filter(Boolean);
function plain(value) {
  return clean(String(value || '').replace(/<[^>]*>/g, '').replace(/&(?:apos|#39);/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/\{\s*["']([^"']*)["']\s*\}/g, '$1'));
}
function fallbackEditorial(source, manifest) {
  const paragraphs = [...source.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => plain(m[1])).filter(p => p.length >= 35 && !/\$\{|[{}]/.test(p));
  const hooks = [manifest.title, ...sections(source).slice(0, 3), manifest.excerpt];
  return {
    synopsis: oneLine('Source-derived extract: ' + (paragraphs.slice(0, 2).join(' ') || manifest.excerpt), 700),
    socialHooks: oneLine('Source-derived hooks: ' + [...new Set(hooks)].join('; '), 700),
  };
}

function blockEntries(source) {
  const start = source.indexOf(indexHeader);
  const end = source.indexOf(placeholder, start);
  if (start < 0 || end < 0 || source.indexOf(indexHeader, start + indexHeader.length) >= 0) {
    throw new Error('Canonical tracker structure is not recognized.');
  }
  const body = source.slice(start, end);
  const matches = [...body.matchAll(/^### (\d{3,}) — (.+)$/gm)];
  if (!matches.length) throw new Error('Canonical tracker has no numbered entries.');
  const entries = matches.map((m, i) => {
    const a = start + m.index;
    const b = i + 1 < matches.length ? start + matches[i + 1].index : end;
    const block = source.slice(a, b);
    return { id: Number(m[1]), a, b, block, site: exactSite(field(block, 'Site')), slug: slugOf(block), title: m[2] };
  });
  if (new Set(entries.map(x => x.id)).size !== entries.length) throw new Error('Duplicate tracker numbers; refusing write.');
  if (entries.some(x => !['ourolddad', 'lifeeducation'].includes(x.site) || !x.slug)) throw new Error('Tracker entry identity is incomplete; refusing write.');
  const keys = entries.map(x => x.site + '/' + x.slug);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate tracker post identity; refusing write.');
  return { entries, end };
}

function putField(block, labels, name, value) {
  const pattern = new RegExp('^- (?:' + labels + '):[^\\n]*$', 'm');
  const line = '- ' + name + ': ' + value;
  return pattern.test(block) ? block.replace(pattern, () => line) : block.trimEnd() + '\n' + line + '\n\n';
}

function updateCount(source, date) {
  const { entries } = blockEntries(source);
  const legacy = entries.filter(e => /Legacy\s*\/\s*unverified/i.test(field(e.block, 'Status'))).length;
  const ood = entries.filter(e => e.site === 'ourolddad' && !/Legacy\s*\/\s*unverified/i.test(field(e.block, 'Status'))).length;
  const life = entries.filter(e => e.site === 'lifeeducation' && !/Legacy\s*\/\s*unverified/i.test(field(e.block, 'Status'))).length;
  const count = '## Inventory Count Checkpoint — ' + date + '\n\n- **' + entries.length + ' numbered tracker entries:** ' + ood + ' Our Old Dad, ' + life + ' LifeEducation and ' + legacy + ' retained legacy/unverified. This is the indexed inventory, not an independent recount of all live URLs. Draft/Coming Soon placeholders are excluded.\n\n';
  const pattern = /^## Inventory Count Checkpoint[^\n]*\n[\s\S]*?(?=^## |\s*$)/m;
  // Use the next top-level heading, not a paragraph break, as the boundary.
  const start = source.indexOf('## Inventory Count Checkpoint');
  if (start < 0 || !pattern.test(source)) throw new Error('Tracker count checkpoint is missing.');
  const rest = source.slice(start + 3);
  const next = rest.search(/^## /m);
  if (next < 0) throw new Error('Tracker checkpoint boundary is missing.');
  let out = source.slice(0, start) + count + source.slice(start + 3 + next);
  // Keep the category summary derived from the same existing records.
  if (/^- Published Junk Drawer entries:/m.test(out)) {
    const junk = entries.filter(e => e.site === 'ourolddad' && /\bformat: junk-drawer\b/i.test(e.block));
    const titles = junk.map(e => '**' + String(e.id).padStart(3, '0') + ' — ' + e.title + '**').join(', ');
    out = out.replace(/^- Published Junk Drawer entries:[^\n]*$/m, () => '- Published Junk Drawer entries: ' + (titles || 'none recorded') + '. These use the diary section and junk-drawer format.');
  }
  return out;
}

export function upsertLedger(source, record) {
  const { manifest, profile, sourceText, mergeCommit, prNumber, mergedAt, date } = record;
  const original = String(source || '').replace(/\r\n/g, '\n');
  const { entries, end } = blockEntries(original);
  const site = siteName(profile);
  const existing = entries.find(e => e.site === exactSite(site) && e.slug === manifest.slug);
  const previousEvidence = existing && field(existing.block, 'Publisher verification');
  const priorDate = previousEvidence?.match(/merged at ([0-9TZ:.-]+);/)?.[1];
  if (priorDate && Date.parse(priorDate) > Date.parse(mergedAt)) return { content: source, changed: false, id: existing.id, reason: 'newer entry already verified' };
  const id = existing?.id ?? Math.max(...entries.map(e => e.id)) + 1;
  const heading = '### ' + String(id).padStart(3, '0') + ' — ' + oneLine(manifest.title, 300);
  const metadataFile = profile.sourceFiles[0];
  const evidence = 'PR #' + prNumber + '; merged at ' + mergedAt + '; merge ' + mergeCommit + '; verified live canonical route and deployed source identity.';
  const fallback = fallbackEditorial(sourceText, manifest);
  const tracker = manifest.tracker && typeof manifest.tracker === 'object' ? manifest.tracker : {};
  const synopsis = typeof tracker.synopsis === 'string' && tracker.synopsis.trim() ? oneLine(tracker.synopsis) : fallback.synopsis;
  const hooks = Array.isArray(tracker.socialHooks) ? tracker.socialHooks.filter(x => typeof x === 'string').map(x => clean(x)).filter(Boolean).join('; ') : tracker.socialHooks;
  const social = typeof hooks === 'string' && hooks.trim() ? oneLine(hooks) : fallback.socialHooks;
  // Only source-authoritative fields and this writer's own verification lines
  // are replaced; retain hand-authored synopsis, hooks, categories and history.
  let block = existing ? existing.block.replace(/^### [^\n]+/, () => heading) : heading + '\n\n';
  const sourceSection = (manifest.section || manifest.topic) + (manifest.format ? '; format: ' + manifest.format : '');
  const existingSection = existing && (field(block, 'Section/topic') || field(block, 'Section/topic (current site)'));
  // Curated series labels belong to Writing & Communications, not the source
  // section enum. Preserve that enrichment when the source category agrees.
  const section = existingSection && (existingSection === sourceSection || existingSection.startsWith(sourceSection + ' /') || existingSection.startsWith(sourceSection + ' (')) ? existingSection : sourceSection;
  const values = [
    ['Site', 'Site', site],
    ['Status', 'Status', manifest.status + '; live publication verified'],
    ['Publish date(?: \\([^\\n]*\\))?', 'Publish date', manifest.publishedAt],
    ['Section/topic(?: \\([^\\n]*\\))?', 'Section/topic', oneLine(section)],
    ['Slug', 'Slug', '\x60' + manifest.slug + '\x60'],
    ['(?:Intended )?(?:canonical )?URL', 'URL', manifest.canonicalUrl],
    ['Source', 'Source', '\x60' + profile.repository + '/' + manifest.destinationPath + metadataFile + '\x60 (merged source)'],
    ['Excerpt', 'Excerpt', oneLine(manifest.excerpt)],
    ['Publisher image roles', 'Publisher image roles', manifest.images.map(x => x.role).join(', ')],
    ['Publisher verification', 'Publisher verification', evidence],
  ];
  if (!existing || !field(block, 'Synopsis')) values.push(['Synopsis', 'Synopsis', synopsis]);
  if (!existing || !field(block, 'Social angles/hooks')) values.push(['Social angles/hooks', 'Social angles/hooks', social]);
  if (manifest.format === 'junk-drawer' && !field(block, 'Editorial category')) values.push(['Editorial category', 'Editorial category', 'The Junk Drawer']);
  for (const [labels, name, value] of values) block = putField(block, labels, name, value);
  block = block.trimEnd() + '\n\n';
  const next = existing ? original.slice(0, existing.a) + block + original.slice(existing.b) : original.slice(0, end) + block + original.slice(end);
  if (next === original) return { content: source, changed: false, id };
  let result = updateCount(next, date);
  const version = result.match(/^Version: (\d+)\.(\d+)$/m);
  if (!version || !/^Last Updated: \d{4}-\d{2}-\d{2}$/m.test(result)) throw new Error('Tracker version header is not recognized.');
  const bumped = version[1] + '.' + (Number(version[2]) + 1);
  result = result.replace(/^Version: \d+\.\d+$/m, 'Version: ' + bumped)
    .replace(/^Last Updated: \d{4}-\d{2}-\d{2}$/m, 'Last Updated: ' + date);
  if (!/^## Change Log$/m.test(result)) throw new Error('Tracker changelog is missing.');
  result = result.replace(/^## Change Log$/m, '## Change Log\n- ' + date + ': v' + bumped + ' Publisher reconciled ' + site + ' entry ' + String(id).padStart(3, '0') + ' from verified PR #' + prNumber + '.');
  return { content: result, changed: true, id };
}

export function ledgerStatusFromStatuses(statuses) {
  const status = (Array.isArray(statuses) ? statuses : []).find(s => s.context === LEDGER_CONTEXT && s.creator?.login === 'github-actions[bot]' && s.creator?.type === 'Bot');
  if (!status) return { state: 'pending', error: 'Waiting for automatic posts-ledger reconciliation.' };
  if (status.state === 'success') return { state: 'success' };
  if (status.state === 'failure' || status.state === 'error') return { state: 'failed', error: 'The post is live, but ledger reconciliation failed. Rerun the Post ledger closeout workflow.' };
  return { state: 'pending', error: 'Posts-ledger reconciliation is running.' };
}

export function mergedManifest(repository, pull) {
  const profile = getSiteProfile({ repository });
  const job = jobFromPullRequest(repository, pull);
  if (!job || pull.merged !== true || !pull.merged_at || pull.base?.ref !== 'main' || !SHA.test(pull.merge_commit_sha || '')) {
    throw new Error('Only a merged same-repository main Publisher PR can reconcile the ledger.');
  }
  const manifest = validateManifest(parseDirectManifest(pull.body));
  if (manifest.repository !== repository || manifest.targetSite !== profile.targetSite || pull.head?.ref !== 'publisher/' + manifest.slug ||
    job.manifest.slug !== manifest.slug || job.manifest.title !== manifest.title || job.manifest.destinationPath !== manifest.destinationPath ||
    job.manifest.canonicalUrl !== manifest.canonicalUrl || job.manifest.targetSite !== manifest.targetSite) throw new Error('Publishing identity does not match the merged manifest.');
  return { profile, manifest };
}

function decodeFile(file) {
  if (!file || file.type !== 'file' || file.encoding !== 'base64' || !SHA.test(file.sha || '') || typeof file.content !== 'string') throw new Error('GitHub did not return a readable source file.');
  return Buffer.from(file.content, 'base64').toString('utf8');
}
function folderIdentity(items) {
  if (!Array.isArray(items) || !items.length || items.some(x => !SHA.test(x.sha || '') || !x.name)) throw new Error('Could not establish merged folder identity.');
  return JSON.stringify(items.map(x => [x.name, x.type, x.sha]).sort((a,b) => a[0].localeCompare(b[0])));
}

export async function verifyLivePost({ repository, pull, request, fetchText, date }) {
  const { profile, manifest } = mergedManifest(repository, pull);
  if (!['Recent', 'Featured'].includes(manifest.status)) return { skipped: true };
  const mergeCommit = pull.merge_commit_sha;
  const markerUrl = new URL('/deployment.json', manifest.canonicalUrl);
  markerUrl.searchParams.set('publisher_verify', mergeCommit);
  const marker = JSON.parse(await fetchText(markerUrl.href));
  const deployed = marker.commit;
  let comparison = null;
  if (SHA.test(deployed || '') && deployed !== mergeCommit) comparison = (await request('/compare/' + mergeCommit + '...' + deployed)).status;
  if (!deployedCommitIsReady(mergeCommit, deployed, comparison)) throw new Error('Merged post has not reached production.');
  const folder = '/contents/' + manifest.destinationPath.replace(/\/$/, '');
  const mergedFolder = await request(folder + '?ref=' + mergeCommit);
  if (deployed !== mergeCommit && folderIdentity(mergedFolder) !== folderIdentity(await request(folder + '?ref=' + deployed))) {
    throw new Error('Deployed post folder differs from the merged post; refusing stale metadata.');
  }
  const identity = folderIdentity(mergedFolder);
  if (!SHA.test(pull.head?.sha || '') || identity !== folderIdentity(await request(folder + '?ref=' + pull.head.sha))) throw new Error('Merged post folder differs from the reviewed publishing head.');
  const sourceFiles = await Promise.all(profile.sourceFiles.map(name => request(folder + '/' + name + '?ref=' + deployed)));
  const meta = decodeFile(sourceFiles[0]);
  for (const key of profile.metadataFields) if (extractField(meta, key) !== String(manifest[key] ?? '')) throw new Error('Merged source metadata differs from manifest: ' + key);
  if (extractField(meta, 'format') !== (manifest.format || '')) throw new Error('Merged source format differs from manifest.');
  const route = new URL(manifest.canonicalUrl);
  route.searchParams.set('publisher_verify', mergeCommit);
  const html = await fetchText(route.href);
  const inspection = inspectPublishedHtml(html, manifest.canonicalUrl, manifest.title);
  if (!inspection.ok || !/<article\b[^>]*data-static-post(?:[\s=>])/i.test(html)) throw new Error('Production article identity is not verified.');
  // A production alias change between marker and article must not certify the wrong revision.
  if (JSON.parse(await fetchText(markerUrl.href)).commit !== deployed) throw new Error('Production deployment changed during verification.');
  return { repository, profile, manifest, sourceText: sourceFiles.map(decodeFile).join('\n'), mergeCommit, prNumber: pull.number, mergedAt: pull.merged_at, date };
}

export async function reconcileLedger(record, request, { attempts = 5 } = {}) {
  const endpoint = '/contents/' + LEDGER_PATH;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const old = await request(endpoint + '?ref=main');
    const result = upsertLedger(decodeFile(old), record);
    if (!result.changed) return result;
    let saved;
    try {
      saved = await request(endpoint, { method: 'PUT', body: { message: 'Publisher: reconcile ' + record.profile.targetSite + ' post ' + record.manifest.slug, content: Buffer.from(result.content, 'utf8').toString('base64'), sha: old.sha, branch: 'main' } });
    } catch (error) {
      if ([409, 422].includes(error.status) && attempt + 1 < attempts) continue;
      throw error;
    }
    if (!SHA.test(saved?.commit?.sha || '') || !SHA.test(saved?.content?.sha || '')) throw new Error('Ledger write returned no commit evidence.');
    const readback = await request(endpoint + '?ref=' + saved.commit.sha);
    if (readback.sha !== saved.content.sha || decodeFile(readback) !== result.content) throw new Error('Ledger write readback did not match.');
    // Re-read current main; another publisher may have appended a different
    // post since our CAS write, but our exact identity must remain present.
    const current = decodeFile(await request(endpoint + '?ref=main'));
    const found = blockEntries(current).entries.find(e => e.site === exactSite(siteName(record.profile)) && e.slug === record.manifest.slug);
    const verified = found && field(found.block, 'Publisher verification');
    const verifiedAt = verified && verified.match(/merged at ([0-9TZ:.-]+);/)?.[1];
    if (!found || found.id !== result.id || (!String(verified || '').includes('merge ' + record.mergeCommit + ';') && !(Date.parse(verifiedAt) > Date.parse(record.mergedAt)))) throw new Error('Verified ledger entry not present on current main.');
    return { ...result, commit: saved.commit.sha };
  }
  throw new Error('Ledger was concurrently changed; rerun closeout.');
}
