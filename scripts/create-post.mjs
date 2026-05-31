import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');
const validSections = new Set(['diary', 'life-education', 'music-playlists', 'slow-travel', 'advice']);

function readArgs() {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = args[index + 1];

    if (!next || next.startsWith('--')) {
      values[key] = 'true';
      continue;
    }

    values[key] = next;
    index += 1;
  }

  return values;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeTsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function usage() {
  console.error(`Usage:
  npm run create:post -- --title "Post Title" --section diary --excerpt "Short summary."

Options:
  --title     Required. Display title for the post.
  --section   Required. One of: ${Array.from(validSections).join(', ')}
  --excerpt   Required. Short card/search summary.
  --slug      Optional. Defaults to a slugified title.
  --date      Optional. Defaults to today's date.
  --status    Optional. Defaults to Recent.`);
}

const args = readArgs();
const title = args.title?.trim();
const section = args.section?.trim();
const excerpt = args.excerpt?.trim();
const slug = (args.slug?.trim() || (title ? slugify(title) : ''));
const publishedAt = args.date?.trim() || new Date().toISOString().slice(0, 10);
const status = args.status?.trim() || 'Recent';

const errors = [];
if (!title) errors.push('--title is required');
if (!section) errors.push('--section is required');
if (section && !validSections.has(section)) errors.push(`--section must be one of: ${Array.from(validSections).join(', ')}`);
if (!excerpt) errors.push('--excerpt is required');
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('--slug must be lowercase kebab-case');
if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) errors.push('--date must be YYYY-MM-DD');
if (!['Featured', 'Recent'].includes(status)) errors.push('--status must be Featured or Recent');

if (errors.length) {
  usage();
  console.error('\nErrors:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const postDir = path.join(postsDir, slug);
const indexPath = path.join(postDir, 'index.ts');

if (fs.existsSync(postDir)) {
  console.error(`Post folder already exists: src/content/posts/${slug}`);
  process.exit(1);
}

const source = `import type { BlogPost } from '../../postTypes';

const post: BlogPost = {
  slug: '${escapeTsString(slug)}',
  title: '${escapeTsString(title)}',
  excerpt:
    '${escapeTsString(excerpt)}',
  section: '${escapeTsString(section)}',
  publishedAt: '${escapeTsString(publishedAt)}',
  status: '${escapeTsString(status)}',
  bodyHtml: \`
    <p>Write the post body here.</p>
  \`,
};

export default post;
`;

fs.mkdirSync(postDir, { recursive: true });
fs.writeFileSync(indexPath, source);

console.log(`Created src/content/posts/${slug}/index.ts`);
console.log('Next: add images if needed, then run npm run build.');
