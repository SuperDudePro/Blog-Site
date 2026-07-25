const ALLOWED_TAGS = new Set(['a','blockquote','br','div','em','figcaption','figure','h2','h3','hr','iframe','img','li','ol','p','span','strong','table','tbody','td','th','thead','tr','ul']);
const VOID_TAGS = new Set(['br','hr','img']);
const GLOBAL_ATTRS = new Set(['class','title','style']);
const ATTRS = {
  a: new Set(['href','rel','target']),
  iframe: new Set(['allow','allowfullscreen','frameborder','height','loading','referrerpolicy','src','title','width']),
  img: new Set(['alt','decoding','height','loading','src','width']),
  ol: new Set(['start']),
  td: new Set(['colspan','rowspan']),
  th: new Set(['colspan','rowspan','scope']),
};

function attrs(source) {
  const found = [];
  const pattern = /([:@A-Za-z_][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source.replace(/\/$/, ''))) !== null) {
    found.push({ name: match[1].toLowerCase(), value: match[2] ?? match[3] ?? match[4] ?? '' });
  }
  return found;
}

function safeUrl(value) {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith('${') || normalized.startsWith('/') || normalized.startsWith('#') || normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('mailto:');
}

function safeStyle(value) {
  const normalized = value.toLowerCase();
  return !normalized.includes('url(') && !normalized.includes('expression(') && !normalized.includes('javascript:') && !normalized.includes('@import');
}

export function validateBodyHtml(html) {
  const errors = [];
  const warnings = [];
  const tags = [];
  const stack = [];
  const pattern = /<\/?([A-Za-z][\w:-]*)([^>]*)>/g;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    const closing = raw.startsWith('</');
    const selfClosing = raw.endsWith('/>') || VOID_TAGS.has(tag);

    if (!ALLOWED_TAGS.has(tag)) {
      errors.push(`bodyHtml uses disallowed <${tag}> tag`);
      continue;
    }

    if (closing) {
      if (!VOID_TAGS.has(tag)) {
        const open = stack.pop();
        if (open !== tag) errors.push(`bodyHtml has mismatched closing </${tag}> tag`);
      }
      continue;
    }

    const parsed = attrs(match[2]);
    const map = new Map(parsed.map((item) => [item.name, item.value]));
    tags.push({ tag, attributes: map });

    for (const attribute of parsed) {
      if (attribute.name.startsWith('on')) errors.push(`bodyHtml uses inline event handler '${attribute.name}'`);
      const allowed = GLOBAL_ATTRS.has(attribute.name) || ATTRS[tag]?.has(attribute.name);
      if (!allowed) errors.push(`bodyHtml uses unsupported '${attribute.name}' attribute on <${tag}>`);
      if (attribute.name === 'style' && !safeStyle(attribute.value)) errors.push(`bodyHtml uses unsafe inline style on <${tag}>`);
    }

    for (const name of ['href','src']) {
      const value = map.get(name);
      if (value && !safeUrl(value)) errors.push(`bodyHtml uses unsafe ${name} URL '${value}'`);
    }

    if (tag === 'a' && map.get('target') === '_blank' && !map.get('rel')?.split(/\s+/).includes('noreferrer')) {
      errors.push('target="_blank" links must include rel="noreferrer"');
    }
    if (tag === 'img') {
      if (!map.has('alt')) errors.push('one or more body <img> tags are missing alt text');
      if (map.get('loading') !== 'lazy') errors.push('body <img> tags must include loading="lazy"');
      if (map.get('decoding') !== 'async') errors.push('body <img> tags must include decoding="async"');
    }
    if (tag === 'iframe') {
      if (!map.get('title')) errors.push('iframe must include a title');
      if (map.get('loading') !== 'lazy') warnings.push('iframe should include loading="lazy"');
      warnings.push('bodyHtml contains an iframe; confirm the embed is intentional');
    }

    if (!selfClosing) stack.push(tag);
  }

  if (/<script[\s>]/i.test(html)) errors.push('bodyHtml contains a <script> tag');
  if (/<style[\s>]/i.test(html)) errors.push('bodyHtml contains a <style> tag');
  if (/javascript\s*:/i.test(html)) errors.push('bodyHtml contains a javascript: URL');
  while (stack.length) errors.push(`bodyHtml has unclosed <${stack.pop()}> tag`);

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)], tags };
}
