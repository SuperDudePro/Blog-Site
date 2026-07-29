import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');

function capture(source, pattern, group = 1) {
  const match = source.match(pattern);
  return match?.[group] ? match[group].trim() : '';
}

function decodeStringLiteral(value) {
  return value.replace(/\\(?:u\{([0-9a-f]+)\}|u([0-9a-f]{4})|x([0-9a-f]{2})|([\\'"bfnrtv0]))/gi, (match, codePoint, unicode, hex, escaped) => {
    if (codePoint) return String.fromCodePoint(Number.parseInt(codePoint, 16));
    if (unicode) return String.fromCharCode(Number.parseInt(unicode, 16));
    if (hex) return String.fromCharCode(Number.parseInt(hex, 16));
    return {
      '\\': '\\',
      "'": "'",
      '"': '"',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\v',
      0: '\0',
    }[escaped] ?? match;
  });
}

function stringField(source, field) {
  const value = source.match(new RegExp(`${field}:\\s*(?:\\n\\s*)?(["'])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1,`))?.[2];
  return value === undefined ? '' : decodeStringLiteral(value).replace(/\s+/g, ' ').trim();
}

function hasField(source, field) {
  return new RegExp(`${field}\\s*:`).test(source);
}

export function readPosts() {
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Missing posts directory: ${postsDir}`);
  }

  return fs
    .readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folder = entry.name;
      const indexPath = path.join(postsDir, folder, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        return { folder, indexPath, missingIndex: true, source: '' };
      }

      const source = fs.readFileSync(indexPath, 'utf8');
      const bodyHtml = capture(source, /bodyHtml:\s*`([\s\S]*?)`\s*,?\s*\n\s*}/);

      return {
        folder,
        indexPath,
        source,
        slug: stringField(source, 'slug'),
        title: stringField(source, 'title'),
        excerpt: stringField(source, 'excerpt') || capture(source, /excerpt:\s*`([\s\S]*?)`,/).replace(/\s+/g, ' '),
        section: stringField(source, 'section'),
        publishedAt: stringField(source, 'publishedAt'),
        hasBodyHtml: hasField(source, 'bodyHtml'),
        hasHeroImage: hasField(source, 'heroImage'),
        hasHeroAlt: hasField(source, 'heroAlt'),
        hasCardImage: hasField(source, 'cardImage'),
        hasCardAlt: hasField(source, 'cardAlt'),
        bodyHtml,
        importedImages: Array.from(source.matchAll(/import\s+\w+\s+from\s+['"]\.\/([^'"]+\.(?:png|jpg|jpeg|webp))['"]/gi)).map((match) => match[1]),
        bodyImageAlts: Array.from(source.matchAll(/<img[\s\S]*?alt=(?:"[^"]+"|'[^']+')/gi)).length,
        bodyImages: Array.from(source.matchAll(/<img[\s\S]*?>/gi)).length,
        bodyImagesWithLoading: Array.from(source.matchAll(/<img[\s\S]*?loading=(?:"[^"]+"|'[^']+')/gi)).length,
      };
    });
}
