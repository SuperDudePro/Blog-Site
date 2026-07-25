import JSZip from 'jszip';

export type ImageRole = 'card' | 'hero' | 'body-1' | 'body-2' | 'body-3' | 'body-4';
export type PlanStatus = 'proposed' | 'approved';
export type ImageStatus = 'empty' | 'generating' | 'ready' | 'approved';

export type PlanItem = {
  id: ImageRole;
  file: string;
  role: string;
  moment: string;
  concept: string;
  composition: string;
  placementIndex: number | null;
  alt: string;
  caption: string | null;
  prompt: string;
  planStatus: PlanStatus;
};

export type ColorReport = {
  purpleRatio: number;
  darkPurpleRatio: number;
  darkRatio: number;
  warning: string | null;
};

export type GeneratedAsset = {
  id: ImageRole;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  color: ColorReport;
  status: ImageStatus;
  overrideReason: string;
  source: 'generated' | 'uploaded';
};

export type StudioMetadata = {
  title: string;
  slug: string;
  excerpt: string;
  section: string;
  publishedAt: string;
  status: string;
};

export type Paragraph = { index: number; text: string };

export const ROLE_SPECS: Record<ImageRole, { file: string; width: number; height: number; label: string }> = {
  card: { file: 'card-image.webp', width: 960, height: 720, label: 'Card / preview' },
  hero: { file: 'hero-image.webp', width: 1600, height: 900, label: 'Hero / header' },
  'body-1': { file: 'body-image-1.webp', width: 1200, height: 900, label: 'Body image 1' },
  'body-2': { file: 'body-image-2.webp', width: 1200, height: 900, label: 'Body image 2' },
  'body-3': { file: 'body-image-3.webp', width: 1200, height: 900, label: 'Body image 3' },
  'body-4': { file: 'body-image-4.webp', width: 1200, height: 900, label: 'Body image 4' },
};

export const ROLE_ORDER = Object.keys(ROLE_SPECS) as ImageRole[];

const decodeEntities = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

export function stripHtml(value: string) {
  return decodeEntities(value.replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

export function extractBodyHtml(source: string): string | null {
  const match = source.match(/bodyHtml\s*:\s*`([\s\S]*?)`\s*,?\s*\n\s*};/);
  return match?.[1] ?? null;
}

export function sourceIsIndex(source: string) {
  return /const\s+post\s*:\s*BlogPost/.test(source) && /bodyHtml\s*:/.test(source);
}

export function extractParagraphs(source: string): Paragraph[] {
  const body = sourceIsIndex(source) ? extractBodyHtml(source) || '' : markdownToHtml(source);
  const items: Paragraph[] = [];
  const regex = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body))) {
    const text = stripHtml(match[1]);
    if (text) items.push({ index: items.length, text });
  }
  return items;
}

export function extractReadableText(source: string) {
  if (!sourceIsIndex(source)) return source.trim();
  let body = extractBodyHtml(source) || '';
  body = body
    .replace(/\s*<figure\s+class=["']post-figure["'][^>]*>[\s\S]*?<\/figure>\s*/gi, '\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?\s*>/gi, '\n');
  const decoded = decodeEntities(body.replace(/<[^>]+>/g, ''));
  return decoded
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseMetadata(source: string): Partial<StudioMetadata> {
  const read = (field: string) => {
    const match = source.match(new RegExp(`${field}\\s*:\\s*(?:\\n\\s*)?(["'])([\\s\\S]*?)\\1\\s*,`));
    return match?.[2]?.replace(/\\'/g, "'").replace(/\\"/g, '"').trim() || '';
  };
  return {
    title: read('title'),
    slug: read('slug'),
    excerpt: read('excerpt'),
    section: read('section'),
    publishedAt: read('publishedAt'),
    status: read('status'),
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const output: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' ').trim())}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listType && listItems.length) output.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    const ul = line.match(/^[-*]\s+(.+)$/);
    const ol = line.match(/^\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushParagraph();
      const nextType = ul ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((ul || ol)![1]);
      continue;
    }
    if (listType) flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return output.join('\n\n');
}

function importName(role: ImageRole) {
  return role === 'card' ? 'cardImage' : role === 'hero' ? 'heroImage' : `bodyImage${['One', 'Two', 'Three', 'Four'][Number(role.split('-')[1]) - 1]}`;
}

function figureFor(item: PlanItem) {
  const name = importName(item.id);
  const caption = item.caption ? `\n      <figcaption>${escapeHtml(item.caption)}</figcaption>` : '';
  return `\n\n    <figure class="post-figure">\n      <img src="\${${name}}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" />${caption}\n    </figure>`;
}

function insertFigures(body: string, plan: PlanItem[]) {
  const withoutFigures = body.replace(/\s*<figure\s+class=["']post-figure["'][^>]*>[\s\S]*?<\/figure>\s*/gi, '\n\n');
  const bodyItems = plan.filter((item) => item.id.startsWith('body-'));
  const matches = [...withoutFigures.matchAll(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/gi)];
  if (!matches.length) return `${withoutFigures.trim()}${bodyItems.map(figureFor).join('')}`;
  const byIndex = new Map<number, PlanItem[]>();
  bodyItems.forEach((item, order) => {
    const requested = item.placementIndex ?? Math.min(order, matches.length - 1);
    const index = Math.max(0, Math.min(requested, matches.length - 1));
    byIndex.set(index, [...(byIndex.get(index) || []), item]);
  });
  let result = '';
  let cursor = 0;
  matches.forEach((match, index) => {
    result += withoutFigures.slice(cursor, match.index! + match[0].length);
    const additions = byIndex.get(index) || [];
    result += additions.map(figureFor).join('');
    cursor = match.index! + match[0].length;
  });
  result += withoutFigures.slice(cursor);
  return result.trim();
}

function quoteTs(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function replaceStringField(source: string, field: keyof StudioMetadata, value: string) {
  const pattern = new RegExp(`(\\n\\s*${field}\\s*:\\s*)(?:\\n\\s*)?(["'])(?:\\\\.|(?!\\2)[\\s\\S])*?\\2\\s*,`);
  return source.replace(pattern, `$1${quoteTs(value)},`);
}

export function buildIndexSource(source: string, metadata: StudioMetadata, plan: PlanItem[]) {
  const hero = plan.find((item) => item.id === 'hero')!;
  const card = plan.find((item) => item.id === 'card')!;
  const sourceBody = sourceIsIndex(source) ? extractBodyHtml(source) || '' : markdownToHtml(source);
  const body = insertFigures(sourceBody, plan);
  if (sourceIsIndex(source)) {
    let next = source
      .replace(/^import\s+[^;]+from\s+["']\.\/[^"']+\.(?:webp|png|jpe?g)["'];\s*$/gim, '')
      .replace(/^import\s+[^;]+from\s+["']\.\/(?:images|image-data[^"']*)["'];\s*$/gim, '')
      .replace(/^\s*(?:heroImage|cardImage)\s*,\s*$/gm, '')
      .replace(/^\s*(?:heroAlt|cardAlt)\s*:\s*(?:\n\s*)?(["'])(?:\\.|(?!\1)[\s\S])*?\1\s*,\s*$/gm, '');
    (Object.keys(metadata) as Array<keyof StudioMetadata>).forEach((field) => {
      next = replaceStringField(next, field, metadata[field]);
    });
    const imports = ROLE_ORDER.map((role) => `import ${importName(role)} from './${ROLE_SPECS[role].file}';`).join('\n');
    const typeImport = next.match(/^import\s+type\s+\{\s*BlogPost\s*\}[^;]+;\s*$/m);
    next = typeImport ? next.replace(typeImport[0], `${typeImport[0]}\n${imports}`) : `import type { BlogPost } from '../../postTypes';\n${imports}\n\n${next.trimStart()}`;
    const fields = `  heroImage,\n  heroAlt: ${quoteTs(hero.alt)},\n  cardImage,\n  cardAlt: ${quoteTs(card.alt)},\n`;
    next = next.replace(/(\n\s*status\s*:\s*["'][^"']+["']\s*,)/, `$1\n${fields}`);
    return next.replace(/bodyHtml\s*:\s*`[\s\S]*?`\s*,?\s*\n\s*};/, `bodyHtml: \`\n${body}\n  \`,\n};`);
  }
  const imports = ROLE_ORDER.map((role) => `import ${importName(role)} from './${ROLE_SPECS[role].file}';`).join('\n');
  return `import type { BlogPost } from '../../postTypes';\n${imports}\n\nconst post: BlogPost = {\n  slug: ${quoteTs(metadata.slug)},\n  title: ${quoteTs(metadata.title)},\n  excerpt: ${quoteTs(metadata.excerpt)},\n  section: ${quoteTs(metadata.section)},\n  publishedAt: ${quoteTs(metadata.publishedAt)},\n  status: ${quoteTs(metadata.status)},\n  heroImage,\n  heroAlt: ${quoteTs(hero.alt)},\n  cardImage,\n  cardAlt: ${quoteTs(card.alt)},\n  bodyHtml: \`\n${body}\n  \`,\n};\n\nexport default post;\n`;
}

function loadImage(source: Blob | string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The generated image could not be decoded.'));
    image.src = typeof source === 'string' ? source : URL.createObjectURL(source);
  });
}

export async function normalizeImage(input: Blob | string, role: ImageRole): Promise<{ blob: Blob; color: ColorReport }> {
  const spec = ROLE_SPECS[role];
  const image = await loadImage(input);
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable.');
  const scale = Math.max(spec.width / image.naturalWidth, spec.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (spec.width - width) / 2, (spec.height - height) / 2, width, height);
  const sample = document.createElement('canvas');
  sample.width = 160;
  sample.height = 120;
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) throw new Error('Canvas analysis is unavailable.');
  sampleContext.drawImage(canvas, 0, 0, sample.width, sample.height);
  const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
  let purple = 0;
  let darkPurple = 0;
  let dark = 0;
  let counted = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 128) continue;
    const r = pixels[index] / 255;
    const g = pixels[index + 1] / 255;
    const b = pixels[index + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const isPurple = saturation > 0.18 && b > g * 1.12 && r > g * 1.08 && b > 0.18;
    if (isPurple) purple += 1;
    if (isPurple && luminance < 0.38) darkPurple += 1;
    if (luminance < 0.16) dark += 1;
    counted += 1;
  }
  const purpleRatio = purple / Math.max(1, counted);
  const darkPurpleRatio = darkPurple / Math.max(1, counted);
  const darkRatio = dark / Math.max(1, counted);
  const warnings: string[] = [];
  if (purpleRatio > 0.18) warnings.push('Purple occupies too much of the image.');
  if (darkPurpleRatio > 0.08) warnings.push('Dark purple is acting as a dominant shadow or wash.');
  if (darkRatio > 0.48) warnings.push('The image is too dark overall for the current bright-sketch standard.');
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('WebP export failed.')), 'image/webp', 0.88));
  return { blob, color: { purpleRatio, darkPurpleRatio, darkRatio, warning: warnings.join(' ') || null } };
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export async function buildPackageZip(source: string, metadata: StudioMetadata, plan: PlanItem[], assets: Map<ImageRole, GeneratedAsset>) {
  const root = `${metadata.publishedAt}--${metadata.slug}--our-old-dad`;
  const zip = new JSZip();
  const indexSource = buildIndexSource(source, metadata, plan);
  const images = plan.map((item) => ({ file: item.file, role: item.role, alt: item.alt, caption: item.caption }));
  const manifest = {
    targetSite: 'Our Old Dad',
    repository: 'SuperDudePro/Blog-Site',
    title: metadata.title,
    slug: metadata.slug,
    publishedAt: metadata.publishedAt,
    status: metadata.status,
    section: metadata.section,
    excerpt: metadata.excerpt,
    canonicalUrl: `https://ourolddad.com/post/${metadata.slug}`,
    destinationPath: `src/content/posts/${metadata.slug}/`,
    buildCommand: 'npm run build',
    imageProfile: 'our-old-dad-v2-six-image-bright-sketch',
    images,
  };
  const notes = [
    '# Image Notes',
    '',
    '## Public Images',
    '',
    '| File | Use | Alt Text | Caption | Credit/Source |',
    '|---|---|---|---|---|',
    ...plan.map((item) => { const asset = assets.get(item.id)!; return `| ${item.file} | ${item.role} | ${item.alt.replace(/\|/g, '\\|')} | ${(item.caption || '').replace(/\|/g, '\\|')} | ${asset.source === 'generated' ? 'AI-generated' : 'User-supplied'}; human approved |`; }),
    '',
    '## Generation / Selection Notes',
    '',
    '- Target site: Our Old Dad',
    '- Site visual identity applied: bright grayscale/charcoal sketch, rough human texture, restrained purple highlights.',
    '- Purple rule: purple is a sparse accent only; it must not become the dominant shadow, wash, background, or mood.',
    '- Family-likeness rule: no recognizable family likenesses are used in public assets.',
    '- Default image pattern: six distinct role files — dedicated card, dedicated hero, and four body images.',
    '- Every concept and final image passed a separate human approval gate.',
    '- Image-role exceptions: None.',
    '',
    '## Per-image review',
    '',
    ...plan.flatMap((item) => {
      const asset = assets.get(item.id)!;
      return [
        `### ${item.file}`,
        '',
        `- Moment: ${item.moment}`,
        `- Concept: ${item.concept}`,
        `- Composition: ${item.composition}`,
        `- Prompt: ${item.prompt}`,
        `- Purple coverage: ${formatPercent(asset.color.purpleRatio)}`,
        `- Dark-purple coverage: ${formatPercent(asset.color.darkPurpleRatio)}`,
        `- Very-dark coverage: ${formatPercent(asset.color.darkRatio)}`,
        `- Automated warning: ${asset.color.warning || 'None'}`,
        `- Override reason: ${asset.overrideReason || 'None'}`,
        '',
      ];
    }),
  ].join('\n');
  const readme = `# Post Handoff\n\nTarget site: Our Old Dad\nDestination path: \`src/content/posts/${metadata.slug}/\`\nPost URL after deploy: \`https://ourolddad.com/post/${metadata.slug}\`\nSlug: \`${metadata.slug}\`\nTitle: ${metadata.title}\nPublished date: ${metadata.publishedAt}\nStatus: ${metadata.status}\nSection/topic: ${metadata.section}\n\n## Copy This Folder\n\nUpload this complete ZIP to Wilbert Publisher. The publisher will validate the package and replace the destination post folder atomically only after explicit approval.\n\n## Build Check\n\n\`npm run build\`\n\n## Human Gate\n\nThe package is approved for a draft preview only. Production merge remains manual.\n`;
  const tracker = `### ${metadata.title}\n- Site: OurOldDad\n- Status: ${metadata.status}\n- Publish date: ${metadata.publishedAt}\n- Section/topic: ${metadata.section}\n- Slug: \`${metadata.slug}\`\n- URL: https://ourolddad.com/post/${metadata.slug}\n- Source: \`SuperDudePro/Blog-Site/src/content/posts/${metadata.slug}/index.ts\`\n- Excerpt: ${metadata.excerpt}\n`;
  zip.file(`${root}/README-HANDOFF.md`, readme);
  zip.file(`${root}/source/post.md`, extractReadableText(source));
  zip.file(`${root}/source/image-notes.md`, notes);
  zip.file(`${root}/source/package-manifest.json`, JSON.stringify(manifest, null, 2));
  zip.file(`${root}/source/proposed-tracker-entry.md`, tracker);
  zip.file(`${root}/drop-in/${metadata.slug}/index.ts`, indexSource);
  for (const role of ROLE_ORDER) zip.file(`${root}/drop-in/${metadata.slug}/${ROLE_SPECS[role].file}`, assets.get(role)!.blob);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
