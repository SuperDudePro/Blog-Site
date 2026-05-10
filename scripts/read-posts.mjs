import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');

function capture(source, pattern) {
  const match = source.match(pattern);
  return match ? match[1].trim() : '';
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
      return {
        folder,
        indexPath,
        source,
        slug: capture(source, /slug:\s*['"]([^'"]+)['"]/),
        title: capture(source, /title:\s*['"]([^'"]+)['"]/),
        excerpt: capture(source, /excerpt:\s*([`'"])([\s\S]*?)\1,/).replace(/\s+/g, ' '),
        section: capture(source, /section:\s*['"]([^'"]+)['"]/),
        publishedAt: capture(source, /publishedAt:\s*['"]([^'"]+)['"]/),
        hasBodyHtml: hasField(source, 'bodyHtml'),
        hasHeroImage: hasField(source, 'heroImage'),
        hasHeroAlt: hasField(source, 'heroAlt'),
        hasCardImage: hasField(source, 'cardImage'),
        hasCardAlt: hasField(source, 'cardAlt'),
        importedImages: Array.from(source.matchAll(/import\s+\w+\s+from\s+['"]\.\/([^'"]+\.(?:png|jpg|jpeg|webp))['"]/gi)).map((match) => match[1]),
        bodyImageAlts: Array.from(source.matchAll(/<img[\s\S]*?alt=(?:"[^"]+"|'[^']+')/gi)).length,
        bodyImages: Array.from(source.matchAll(/<img[\s\S]*?>/gi)).length,
      };
    });
}
