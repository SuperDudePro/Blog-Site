import { decodeGithubBlob } from './baselineRetirement.mjs';
import { repoRequest } from './github.mjs';
import { extractField } from '../src/packageManifest.js';
import { getSiteProfile } from '../siteProfiles.mjs';

export const TRACKER_REPOSITORY = 'SuperDudePro/Wilbert';
export const TRACKER_PATH = '14_Writing_Communications/blog_post_tracker.md';
const POST_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TRACKER_ANCHOR = '\n## Placeholder / Not Social-Ready';
const TRACKER_HEADER = '## Current Social-Ready Index';

function safeOneLine(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function validatePost(post) {
  if (!POST_SLUG.test(post.slug)) throw new Error('Invalid tracker post slug.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) throw new Error('Missing tracker publication date.');
  if (!post.title || !post.excerpt || !post.section) throw new Error('Published source is missing tracker metadata.');
  if (!['Recent', 'Featured', 'Starter'].includes(post.status)) return false;
  return true;
}

export function postFromSource({ repository, slug, source }) {
  const profile = getSiteProfile({ repository });
  if (!POST_SLUG.test(slug)) throw new Error('Invalid publisher slug.');
  const post = {
    repository,
    site: profile.id === 'our-old-dad' ? 'OurOldDad' : 'LifeEducation',
    slug: extractField(source, 'slug'),
    title: safeOneLine(extractField(source, 'title')),
    excerpt: safeOneLine(extractField(source, 'excerpt')),
    publishedAt: extractField(source, 'publishedAt'),
    status: extractField(source, 'status'),
    section: safeOneLine(extractField(source, profile.id === 'our-old-dad' ? 'section' : 'topic')),
    url: profile.canonicalPrefix + slug,
    sourcePath: 'SuperDudePro/' + (profile.id === 'our-old-dad' ? 'Blog-Site' : 'LifeEducationOrg')
      + '/src/content/posts/' + slug + '/' + profile.sourceFiles[0],
  };
  if (post.slug !== slug) throw new Error('Live source slug differs from the verified publishing route.');
  return post;
}

function listedSlugs(tracker) {
  return [...tracker.matchAll(/^- Slug: `([^`]+)`/gm)].map((match) => match[1]);
}

function entryNumber(tracker) {
  const indices = [...tracker.matchAll(/^### (\d{3}) — /gm)].map((match) => Number(match[1]));
  if (!indices.every((number, index) => number === index + 1)) {
    throw new Error('Tracker numbering has gaps or duplicates; manual reconciliation required.');
  }
  return indices.length + 1;
}

function cleanDraftPlaceholder(tracker, slug) {
  const start = tracker.indexOf('## Placeholder / Not Social-Ready');
  if (start < 0) return tracker;
  const end = tracker.indexOf('\n## Change Log', start);
  if (end < 0) throw new Error('Tracker placeholder section is malformed.');
  const section = tracker.slice(start, end);
  const parts = section.split(/(?=^### )/m);
  const remaining = parts.filter((part) => !part.includes('- Slug: ' + String.fromCharCode(96) + slug + String.fromCharCode(96)));
  return tracker.slice(0, start) + remaining.join('') + tracker.slice(end);
}

function recordEntry(post, number) {
  const tick = String.fromCharCode(96);
  const intro = post.excerpt.split(/(?<=[.!?])\s/)[0].slice(0, 125);
  return '\n### ' + String(number).padStart(3, '0') + ' — ' + post.title
    + '\n- Site: ' + post.site
    + '\n- Status: ' + post.status
    + '\n- Publish date: ' + post.publishedAt
    + '\n- Section/topic: ' + post.section
    + '\n- Slug: ' + tick + post.slug + tick
    + '\n- URL: ' + post.url
    + '\n- Source: ' + tick + post.sourcePath + tick
    + '\n- Excerpt: ' + post.excerpt
    + '\n- Synopsis: ' + post.excerpt
    + '\n- Social angles/hooks: ' + post.title + '; ' + post.section + '; ' + intro
    + '\n';
}

// Pure transformation. Never renumber or rewrite existing posts, synopsis, or human social angles.
export function addPublishedPost(tracker, post, day) {
  if (!tracker.includes(TRACKER_HEADER) || !tracker.includes(TRACKER_ANCHOR)) {
    throw new Error('Canonical blog tracker layout changed; no automatic write.');
  }
  if (!validatePost(post)) return { content: tracker, state: 'skipped', reason: 'Draft or non-public source status.' };
  if (listedSlugs(tracker).filter((slug) => slug === post.slug).length > 1) {
    throw new Error('Duplicate source slug in tracker; no automatic write.');
  }
  const number = entryNumber(tracker);
  const existing = tracker.match(new RegExp('^### \\d{3} — [^\\n]*\\n(?:(?!^### |^## )[\\s\\S])*?^- Slug: '+String.fromCharCode(96)+post.slug+String.fromCharCode(96)+'$', 'm'));
  if (existing) return { content: tracker, state: 'already-recorded' };
  // If a draft becomes public, retire only its matching placeholder entry.
  let content = cleanDraftPlaceholder(tracker, post.slug);
  content = content.replace(TRACKER_ANCHOR, recordEntry(post, number) + TRACKER_ANCHOR);
  content = content.replace(/^Last Updated: .*$/m, 'Last Updated: ' + day);
  return { content, state: 'added', number };
}

// The repository source must be fetched from main only after the merge and live deployment are verified.
export async function syncPublishedPost({ repository, canonicalUrl, title, readSource = repoRequest, trackerRequest = repoRequest, day = new Date().toISOString().slice(0, 10) }) {
  const profile = getSiteProfile({ repository });
  if (!canonicalUrl.startsWith(profile.canonicalPrefix)) throw new Error('Tracker route does not match site profile.');
  const slug = canonicalUrl.slice(profile.canonicalPrefix.length);
  if (!POST_SLUG.test(slug)) throw new Error('Tracker route has an invalid slug.');
  const sourcePath = 'src/content/posts/' + slug + '/' + profile.sourceFiles[0];
  const sourceFile = await readSource(repository, '/contents/' + sourcePath + '?ref=main');
  const post = postFromSource({ repository, slug, source: decodeGithubBlob(sourceFile) });
  if (post.title !== title) throw new Error('Verified post title and live source title do not match.');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await trackerRequest(TRACKER_REPOSITORY, '/contents/' + TRACKER_PATH + '?ref=main');
    const transformed = addPublishedPost(decodeGithubBlob(current), post, day);
    if (transformed.state !== 'added') return transformed;
    try {
      await trackerRequest(TRACKER_REPOSITORY, '/contents/' + TRACKER_PATH, {
        method: 'PUT',
        body: {
          message: 'docs(writing): record published ' + post.site + ' post ' + slug,
          content: Buffer.from(transformed.content, 'utf8').toString('base64'),
          sha: current.sha,
          branch: 'main',
        },
      });
      const verified = await trackerRequest(TRACKER_REPOSITORY, '/contents/' + TRACKER_PATH + '?ref=main');
      const recorded = addPublishedPost(decodeGithubBlob(verified), post, day);
      if (recorded.state !== 'already-recorded') throw new Error('Tracker write could not be verified by readback.');
      return { state: 'added', number: transformed.number, verified: true };
    } catch (error) {
      if (error.status !== 409 && error.status !== 422) throw error;
      // The canonical file changed while updating; recompute from its fresh SHA.
    }
  }
  throw new Error('Tracker update conflicted repeatedly; retry verification later.');
}
