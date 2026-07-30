import fs from 'node:fs';
import path from 'node:path';
import { validateBodyHtml } from './html-validator.mjs';
import { inspectImage } from './image-metadata.mjs';
import { parsePostSource } from './post-parser.mjs';

const VALID_SECTIONS = new Set(['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const REQUIRED_FIELDS = ['slug', 'title', 'excerpt', 'section', 'publishedAt', 'bodyHtml'];
const CANONICAL_ORIGIN = 'https://ourolddad.com';
const IMAGE_GEOMETRY = {
  card: { width: 960, height: 720 },
  hero: { width: 1600, height: 900 },
  body: { width: 1200, height: 900 },
};

function issue(ruleId, signature, message) {
  return { ruleId, signature, message };
}

function issueKey(value) {
  return `${value.ruleId}\u0000${value.signature}`;
}

function realIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function sitemapRoutes(root) {
  const sitemapPath = path.join(root, 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return new Set();
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return new Set(
    [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
      .map((match) => {
        try {
          return new URL(match[1]).pathname.replace(/\/+$/, '') || '/';
        } catch {
          return '';
        }
      })
      .filter(Boolean),
  );
}

function localHrefPath(href) {
  if (!href || href.startsWith('#') || /^(?:mailto|tel):/i.test(href)) return null;
  try {
    const url = href.startsWith('/') ? new URL(href, CANONICAL_ORIGIN) : new URL(href);
    if (url.origin === CANONICAL_ORIGIN || url.origin === 'https://www.ourolddad.com') {
      return url.pathname.replace(/\/+$/, '') || '/';
    }
    return false;
  } catch {
    return undefined;
  }
}

function htmlText(value) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&rsquo;/gi, '’')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rdquo;/gi, '”')
    .replace(/&ldquo;/gi, '“')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

function contactCtaEvidence(bodyHtml) {
  const matches = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let anchor;
  while ((anchor = anchorPattern.exec(bodyHtml)) !== null) {
    const hrefMatch = anchor[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? '';
    if (localHrefPath(href) === '/contact') {
      matches.push({ href, text: htmlText(anchor[2]) });
    }
  }
  const fullText = htmlText(bodyHtml);
  const closingText = fullText.length <= 280
    ? fullText
    : `…${fullText.slice(-280).replace(/^\S+\s+/, '')}`;
  return { matches, closingText };
}

function priorityFor(defects) {
  if (!defects.length) return 'current';
  if (defects.some((value) =>
    value.ruleId.startsWith('structure.')
    || value.ruleId.startsWith('metadata.')
    || value.ruleId.startsWith('identity.')
    || value.ruleId === 'code.parse'
    || /image\.role\.(?:card|hero)\.missing/.test(value.ruleId),
  )) return 'P1 structural';
  if (defects.some((value) =>
    value.ruleId.startsWith('image.body.')
    || /^image\.role\.(?:card|hero)\.geometry$/.test(value.ruleId),
  )) return 'P2 image completion';
  return 'P3 finish and cleanup';
}

export function scanOurOldDad(root = process.cwd()) {
  const postsDir = path.join(root, 'src', 'content', 'posts');
  const routes = sitemapRoutes(root);
  for (const route of ['/', '/about', '/archive', '/categories', '/contact']) routes.add(route);
  for (const section of ['everything', ...VALID_SECTIONS]) routes.add(`/section/${section}`);
  if (fs.existsSync(postsDir)) {
    for (const entry of fs.readdirSync(postsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) routes.add(`/post/${entry.name}`);
    }
  }
  const posts = [];
  const seenSlugs = new Map();

  if (!fs.existsSync(postsDir)) {
    return {
      site: 'Our Old Dad',
      repository: 'SuperDudePro/Blog-Site',
      posts: [],
      repositoryDefects: [issue('repository.posts-directory.required', 'src/content/posts', 'Missing src/content/posts.')],
    };
  }

  for (const entry of fs.readdirSync(postsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const folder = path.join(postsDir, slug);
    const indexPath = path.join(folder, 'index.ts');
    const defects = [];
    const add = (ruleId, signature, message) => defects.push(issue(ruleId, signature, message));

    if (!fs.existsSync(indexPath)) {
      add('structure.index.required', 'index.ts', 'The post folder is missing index.ts.');
      posts.push({ slug, title: '', publishedAt: '', defects, priority: priorityFor(defects) });
      continue;
    }

    const children = fs.readdirSync(folder, { withFileTypes: true });
    const assets = new Set();
    for (const child of children) {
      if (child.name === 'index.ts') continue;
      if (child.isDirectory()) {
        add('structure.nested-directory.forbidden', child.name, `Unexpected nested directory: ${child.name}.`);
        continue;
      }
      if (!IMAGE_EXTENSIONS.has(path.extname(child.name).toLowerCase())) {
        add('structure.extra-file.forbidden', child.name, `Unexpected non-production file: ${child.name}.`);
        continue;
      }
      assets.add(child.name);
    }

    const source = fs.readFileSync(indexPath, 'utf8');
    const parsed = parsePostSource(source, indexPath);
    for (const message of parsed.errors) add('code.parse', message, message);
    const value = (field) => parsed.values.get(field);
    const sourceSlug = value('slug') || '';
    const title = value('title') || '';
    const publishedAt = value('publishedAt') || '';

    for (const field of REQUIRED_FIELDS) {
      const current = field === 'bodyHtml' ? parsed.bodyHtml : value(field);
      if (!current?.trim()) add(`metadata.${field}.required`, field, `Missing required ${field}.`);
    }
    if (sourceSlug && sourceSlug !== slug) {
      add('identity.folder-slug', `folder=${slug};slug=${sourceSlug}`, `Folder "${slug}" does not match slug "${sourceSlug}".`);
    }
    if (sourceSlug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceSlug)) add('identity.slug-format', sourceSlug, 'Slug must be lowercase kebab-case.');
      const duplicate = seenSlugs.get(sourceSlug);
      if (duplicate) add('identity.slug-unique', `slug=${sourceSlug};other=${duplicate}`, `Duplicate slug also used by ${duplicate}.`);
      else seenSlugs.set(sourceSlug, slug);
    }
    if (value('section') && !VALID_SECTIONS.has(value('section'))) {
      add('metadata.section.allowed', value('section'), `Invalid section "${value('section')}".`);
    }
    if (value('publishedAt') && !realIsoDate(value('publishedAt'))) {
      add('metadata.publishedAt.date', value('publishedAt'), 'publishedAt must be a real YYYY-MM-DD date.');
    }
    if (value('modifiedAt') && !realIsoDate(value('modifiedAt'))) {
      add('metadata.modifiedAt.date', value('modifiedAt'), 'modifiedAt must be a real YYYY-MM-DD date.');
    }

    const roleFiles = new Map();
    for (const [field, expected] of [['cardImage', 'card-image.webp'], ['heroImage', 'hero-image.webp']]) {
      const identifier = parsed.identifiers.get(field);
      const file = identifier ? parsed.imageImports.get(identifier) : undefined;
      const altField = field === 'cardImage' ? 'cardAlt' : 'heroAlt';
      const role = field === 'cardImage' ? 'card' : 'hero';
      if (!identifier || !file) add(`image.role.${role}.missing`, expected, `Missing dedicated ${role} image import and field.`);
      else {
        roleFiles.set(role, file);
        if (file !== expected) add(`image.role.${role}.filename`, `actual=${file};expected=${expected}`, `${role} image must be named ${expected}.`);
      }
      if (!value(altField)?.trim()) add(`image.role.${role}.alt`, altField, `Missing ${altField}.`);
    }
    if (roleFiles.get('card') && roleFiles.get('card') === roleFiles.get('hero')) {
      add('image.role.distinct', roleFiles.get('card'), 'Card and hero roles reuse the same image.');
    }

    const html = validateBodyHtml(parsed.bodyHtml);
    const bodyFiles = [];
    for (const tag of html.tags.filter((candidate) => candidate.tag === 'img')) {
      const src = tag.attributes.get('src') || '';
      const identifier = src.match(/^\$\{([A-Za-z_$][\w$]*)\}$/)?.[1];
      if (!identifier || !parsed.imageImports.has(identifier)) {
        add('image.body.reference', src || '(missing)', `Body image source "${src || '(missing)'}" does not match a local import.`);
        continue;
      }
      const file = parsed.imageImports.get(identifier);
      bodyFiles.push(file);
      if (!tag.attributes.get('alt')?.trim()) add('image.body.alt', file, `Body image ${file} has empty alt text.`);
    }

    const uniqueBodyFiles = [...new Set(bodyFiles)];
    if (uniqueBodyFiles.length < 4) {
      add('image.body.minimum', `count=${uniqueBodyFiles.length}`, `Only ${uniqueBodyFiles.length} distinct body images; current minimum is 4.`);
    }
    if (bodyFiles.length !== uniqueBodyFiles.length) {
      add('image.body.distinct', `files=${bodyFiles.join(',')}`, 'One or more body images are rendered more than once.');
    }
    const expectedBodyFiles = Array.from({ length: uniqueBodyFiles.length }, (_, index) => `body-image-${index + 1}.webp`);
    if (uniqueBodyFiles.join('|') !== expectedBodyFiles.join('|')) {
      add(
        'image.body.sequence',
        `actual=${uniqueBodyFiles.join(',')};expected=${expectedBodyFiles.join(',')}`,
        `Body roles must use the exact sequential filenames ${expectedBodyFiles.join(', ') || '(none)'}.`,
      );
    }
    for (const [role, file] of roleFiles) {
      if (uniqueBodyFiles.includes(file)) add('image.role.body-reuse', `${role}=${file}`, `${role} image is reused as a body image.`);
    }

    const importedFiles = new Set(parsed.imageImports.values());
    for (const file of assets) {
      if (!importedFiles.has(file)) add('asset.stale', file, `Asset ${file} is not imported by index.ts.`);
    }
    for (const file of importedFiles) {
      if (!assets.has(file)) add('asset.missing', file, `Imported image ${file} does not exist.`);
    }

    const checkGeometry = (role, file, ruleId) => {
      if (!file || !assets.has(file)) return;
      const expected = IMAGE_GEOMETRY[role];
      try {
        const actual = inspectImage(path.join(folder, file));
        if (actual.width !== expected.width || actual.height !== expected.height) {
          add(
            ruleId,
            `file=${file};actual=${actual.width}x${actual.height};expected=${expected.width}x${expected.height}`,
            `${file} is ${actual.width}x${actual.height}; the ${role} role requires ${expected.width}x${expected.height}.`,
          );
        }
      } catch {
        add(
          ruleId,
          `file=${file};actual=unreadable;expected=${expected.width}x${expected.height}`,
          `${file} does not contain readable PNG, JPEG, or WebP image data; the ${role} role requires ${expected.width}x${expected.height}.`,
        );
      }
    };
    checkGeometry('card', roleFiles.get('card'), 'image.role.card.geometry');
    checkGeometry('hero', roleFiles.get('hero'), 'image.role.hero.geometry');
    for (const file of uniqueBodyFiles) checkGeometry('body', file, 'image.body.geometry');

    const links = html.tags.filter((candidate) => candidate.tag === 'a').map((tag) => tag.attributes.get('href') || '');
    const ctaEvidence = contactCtaEvidence(parsed.bodyHtml);
    if (!ctaEvidence.matches.length) {
      add(
        'cta.contact.required',
        '/contact',
        'No reader CTA linking to /contact was found inside bodyHtml; sitewide header/footer Contact links do not count.',
      );
    }
    for (const href of links) {
      const local = localHrefPath(href);
      if (local === undefined) add('link.url.valid', href, `Malformed link: ${href}.`);
      else if (local === false) {
        try {
          const url = new URL(href);
          if (url.protocol !== 'https:') add('link.external.https', href, `External link must use HTTPS: ${href}.`);
        } catch {
          // The malformed case is handled above.
        }
      } else if (local && routes.size && !routes.has(local)) {
        add('link.internal.route', href, `Internal link is absent from the sitemap: ${href}.`);
      }
    }

    const deduped = [...new Map(defects.map((value) => [issueKey(value), value])).values()]
      .sort((a, b) => issueKey(a).localeCompare(issueKey(b)));
    posts.push({ slug, title, publishedAt, defects: deduped, priority: priorityFor(deduped), ctaEvidence });
  }

  return { site: 'Our Old Dad', repository: 'SuperDudePro/Blog-Site', posts, repositoryDefects: [] };
}

export function retrofitQueue(scan, baseline) {
  const posts = new Map(scan.posts.map((post) => [post.slug, post]));
  const queue = Object.entries(baseline?.entries || {})
    .map(([slug, defects]) => {
      const post = posts.get(slug);
      return {
        slug,
        title: post?.title || '',
        publishedAt: post?.publishedAt || '',
        priority: post?.priority || 'P1 structural',
        defects: defects.map(({ ruleId, signature, reason, message }) => ({
          ruleId,
          signature,
          message: reason || message || '',
        })),
      };
    })
    .sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt)
      || a.slug.localeCompare(b.slug),
    );

  return queue.map((entry, index) => ({
    queueNumber: index + 1,
    queueTotal: queue.length,
    ...entry,
  }));
}

export function candidateBaseline(scan) {
  return {
    schemaVersion: 1,
    site: scan.site,
    repository: scan.repository,
    status: 'candidate',
    reviewedAt: null,
    entries: Object.fromEntries(
      scan.posts
        .filter((post) => post.defects.length)
        .map((post) => [
          post.slug,
          post.defects.map(({ ruleId, signature, message }) => ({ ruleId, signature, reason: message })),
        ]),
    ),
  };
}

export function evaluateBaseline(scan, baseline, { touchedSlugs = new Set() } = {}) {
  const errors = [];
  if (baseline?.status !== 'reviewed') errors.push('Legacy baseline is not marked reviewed.');
  if (baseline?.repository !== scan.repository) errors.push(`Baseline repository must be ${scan.repository}.`);
  const posts = new Map(scan.posts.map((post) => [post.slug, post]));

  for (const post of scan.posts) {
    const allowed = new Map((baseline?.entries?.[post.slug] || []).map((entry) => [issueKey(entry), entry]));
    const current = new Map(post.defects.map((entry) => [issueKey(entry), entry]));
    for (const defect of post.defects) {
      if (!allowed.has(issueKey(defect))) errors.push(`${post.slug}: unapproved ${defect.ruleId} (${defect.signature}) — ${defect.message}`);
    }
    for (const entry of allowed.values()) {
      if (!current.has(issueKey(entry))) errors.push(`${post.slug}: obsolete baseline entry ${entry.ruleId} (${entry.signature}) must be removed.`);
    }
    if (touchedSlugs.has(post.slug) && post.defects.length) {
      errors.push(`${post.slug}: materially touched legacy post must meet the complete current contract.`);
    }
  }
  for (const slug of Object.keys(baseline?.entries || {})) {
    if (!posts.has(slug)) errors.push(`${slug}: baseline entry refers to a post that no longer exists.`);
  }
  return [...new Set(errors)];
}

export function inventoryMarkdown(scan) {
  const current = scan.posts.filter((post) => !post.defects.length);
  const legacy = scan.posts.filter((post) => post.defects.length);
  const lines = [
    `# ${scan.site} Post Contract Inventory`,
    '',
    'Generated by `scripts/validate-post-contract.mjs`. Do not hand-edit this report.',
    '',
    `- Repository: \`${scan.repository}\``,
    `- Posts scanned: ${scan.posts.length}`,
    `- Current-standard posts: ${current.length}`,
    `- Legacy posts needing retrofit: ${legacy.length}`,
    '',
    '## Current-standard posts',
    '',
    ...(current.length ? current.map((post) => `- \`${post.slug}\` — ${post.title}`) : ['- None']),
    '',
    '## Retrofit queue',
    '',
  ];
  for (const priority of ['P1 structural', 'P2 image completion', 'P3 finish and cleanup']) {
    const group = legacy.filter((post) => post.priority === priority);
    if (!group.length) continue;
    lines.push(`### ${priority}`, '');
    for (const post of group) {
      lines.push(`#### \`${post.slug}\` — ${post.title || '(title unavailable)'}`, '');
      for (const defect of post.defects) lines.push(`- \`${defect.ruleId}\` — ${defect.message}`);
      lines.push('');
    }
  }
  return `${lines.join('\n').trim()}\n`;
}

export function ctaAuditMarkdown(scan) {
  const passed = scan.posts.filter((post) => post.ctaEvidence?.matches.length);
  const missing = scan.posts.filter((post) => !post.ctaEvidence?.matches.length);
  const lines = [
    '# Our Old Dad CTA Audit',
    '',
    'Generated by `scripts/validate-post-contract.mjs`. Do not hand-edit this report.',
    '',
    'Verification scope: links inside each post’s rendered `bodyHtml` only. Sitewide header and footer navigation are intentionally excluded because they are navigation, not a reader invitation attached to the post.',
    '',
    `- Posts scanned: ${scan.posts.length}`,
    `- Posts with an article CTA to \`/contact\`: ${passed.length}`,
    `- Posts missing an article CTA to \`/contact\`: ${missing.length}`,
    '',
    '## Verified article CTAs',
    '',
  ];

  for (const post of passed) {
    const evidence = post.ctaEvidence.matches
      .map((match) => `“${match.text || '(link has no text)'}” → \`${match.href}\``)
      .join('; ');
    lines.push(`- \`${post.slug}\` — ${evidence}`);
  }

  lines.push('', '## Missing article CTAs', '');
  for (const post of missing) {
    lines.push(
      `### \`${post.slug}\` — ${post.title || '(title unavailable)'}`,
      '',
      `Closing article text: “${post.ctaEvidence?.closingText || '(empty bodyHtml)'}”`,
      '',
    );
  }

  return `${lines.join('\n').trim()}\n`;
}
