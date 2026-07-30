const OOD_REPOSITORY = 'SuperDudePro/Blog-Site';

const issueKey = (entry) => `${entry.ruleId}\u0000${entry.signature}`;

function imageImports(source) {
  return new Map(
    [...source.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]\.\/([^'"]+\.(?:png|jpe?g|webp))['"];?/gi)]
      .map((match) => [match[1], match[2]]),
  );
}

function bodyHtmlSource(source) {
  return source.match(/\bbodyHtml\s*:\s*`([\s\S]*?)`\s*[,}]/)?.[1] || '';
}

function bodyImageFiles(bodyHtml, imports, defects) {
  const files = [];
  for (const match of bodyHtml.matchAll(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
    const src = match[1] ?? match[2] ?? '';
    const identifier = src.match(/^\$\{([A-Za-z_$][\w$]*)\}$/)?.[1];
    if (!identifier || !imports.has(identifier)) {
      defects.add(issueKey({ ruleId: 'image.body.reference', signature: src || '(missing)' }));
    } else {
      files.push(imports.get(identifier));
    }
  }
  return files;
}

function hasContactCta(bodyHtml) {
  for (const match of bodyHtml.matchAll(/<a\b([^>]*)>[\s\S]*?<\/a>/gi)) {
    const href = match[1].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    const value = href?.[1] ?? href?.[2] ?? href?.[3] ?? '';
    try {
      const url = value.startsWith('/') ? new URL(value, 'https://ourolddad.com') : new URL(value);
      if (
        (url.origin === 'https://ourolddad.com' || url.origin === 'https://www.ourolddad.com')
        && (url.pathname.replace(/\/+$/, '') || '/') === '/contact'
      ) return true;
    } catch {
      // Other link rules handle malformed URLs.
    }
  }
  return false;
}

function roleIdentifier(source, field) {
  return source.match(new RegExp(`\\b${field}\\s*:\\s*([A-Za-z_$][\\w$]*)`))?.[1]
    || (new RegExp(`\\b${field}\\s*[,}]`).test(source) ? field : '');
}

export function supportedPostDefects(indexSource) {
  const source = String(indexSource || '');
  const imports = imageImports(source);
  const bodyHtml = bodyHtmlSource(source);
  const defects = new Set();

  if (!hasContactCta(bodyHtml)) {
    defects.add(issueKey({ ruleId: 'cta.contact.required', signature: '/contact' }));
  }

  for (const [field, role, expected] of [
    ['cardImage', 'card', 'card-image.webp'],
    ['heroImage', 'hero', 'hero-image.webp'],
  ]) {
    const identifier = roleIdentifier(source, field);
    if (!identifier || !imports.has(identifier)) {
      defects.add(issueKey({ ruleId: `image.role.${role}.missing`, signature: expected }));
    }
  }

  const bodyFiles = bodyImageFiles(bodyHtml, imports, defects);
  const unique = [...new Set(bodyFiles)];
  if (unique.length < 4) {
    defects.add(issueKey({ ruleId: 'image.body.minimum', signature: `count=${unique.length}` }));
  }
  const expected = Array.from({ length: unique.length }, (_, index) => `body-image-${index + 1}.webp`);
  if (unique.join('|') !== expected.join('|')) {
    defects.add(issueKey({
      ruleId: 'image.body.sequence',
      signature: `actual=${unique.join(',')};expected=${expected.join(',')}`,
    }));
  }
  return defects;
}

export function retireResolvedBaselineEntries({ baseline, repository, slug, indexSource }) {
  if (repository !== OOD_REPOSITORY || !baseline?.entries?.[slug]) {
    return { baseline, retired: [], retained: [], changed: false };
  }

  const current = supportedPostDefects(indexSource);
  const supported = new Set([
    'cta.contact.required',
    'image.body.minimum',
    'image.body.sequence',
    'image.body.reference',
    'image.role.card.missing',
    'image.role.hero.missing',
  ]);
  const retired = [];
  const retained = [];

  for (const entry of baseline.entries[slug]) {
    if (supported.has(entry.ruleId) && !current.has(issueKey(entry))) retired.push(entry);
    else retained.push(entry);
  }
  if (!retired.length) return { baseline, retired, retained, changed: false };

  const next = structuredClone(baseline);
  if (retained.length) next.entries[slug] = retained;
  else delete next.entries[slug];
  return { baseline: next, retired, retained, changed: true };
}

export function decodeGithubBlob(blob) {
  if (!blob?.content || blob.encoding !== 'base64') throw new Error('GitHub returned an unreadable text blob.');
  return Buffer.from(blob.content.replace(/\s/g, ''), 'base64').toString('utf8');
}

export function encodeBaseline(baseline) {
  return `${JSON.stringify(baseline, null, 2)}\n`;
}
