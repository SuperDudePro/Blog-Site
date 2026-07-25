import { generateText } from 'ai';
import { requirePublisher } from '../../lib/auth.mjs';
import { json, method, readJson } from '../../lib/http.mjs';

const roles = [
  ['card', 'card-image.webp', 'Dedicated card/top-preview image composed for a small 4:3 slot. It must read instantly at thumbnail size.'],
  ['hero', 'hero-image.webp', 'Dedicated wide 16:9 opening image. It should establish the emotional world without duplicating the card composition.'],
  ['body-1', 'body-image-1.webp', 'First 4:3 inline illustration.'],
  ['body-2', 'body-image-2.webp', 'Second 4:3 inline illustration.'],
  ['body-3', 'body-image-3.webp', 'Third 4:3 inline illustration.'],
  ['body-4', 'body-image-4.webp', 'Fourth 4:3 inline illustration.'],
];

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  if (!candidate) throw new Error('The planning model did not return JSON.');
  return JSON.parse(candidate);
}

function validatePlan(value, paragraphCount) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.images)) throw new Error('The planning response is missing its image list.');
  const expected = new Set(roles.map(([id]) => id));
  if (value.images.length !== 6) throw new Error(`The planning response returned ${value.images.length} images instead of six.`);
  for (const image of value.images) {
    if (!expected.has(image.id)) throw new Error(`Unexpected image role: ${image.id}`);
    expected.delete(image.id);
    for (const field of ['file', 'role', 'moment', 'concept', 'composition', 'alt', 'prompt']) {
      if (typeof image[field] !== 'string' || !image[field].trim()) throw new Error(`${image.id} is missing ${field}.`);
    }
    if (image.id.startsWith('body-')) {
      if (!Number.isInteger(image.placementIndex)) throw new Error(`${image.id} is missing a paragraph placement.`);
      image.placementIndex = Math.max(0, Math.min(image.placementIndex, Math.max(0, paragraphCount - 1)));
    } else {
      image.placementIndex = null;
    }
    image.caption = typeof image.caption === 'string' && image.caption.trim() ? image.caption.trim() : null;
  }
  if (expected.size) throw new Error(`The planning response is missing: ${[...expected].join(', ')}`);
  return value;
}

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) throw Object.assign(new Error('AI Gateway is not configured. Add AI_GATEWAY_API_KEY to the Wilbert Publisher Vercel project.'), { status: 503 });
    const { metadata, postText, paragraphs, sourceMode } = await readJson(request);
    if (!metadata?.title || !metadata?.slug || !postText) throw new Error('Title, slug, and finished post text are required.');
    const paragraphList = Array.isArray(paragraphs) && paragraphs.length
      ? paragraphs.map((paragraph) => `[${paragraph.index}] ${String(paragraph.text).slice(0, 500)}`).join('\n')
      : '[0] End of post';
    const roleList = roles.map(([id, file, description]) => `- ${id} / ${file}: ${description}`).join('\n');
    const prompt = `You are the controlled image director for Our Old Dad. Read the finished, approved post and propose exactly six distinct public illustrations before any image is generated.

POST METADATA
Title: ${metadata.title}
Slug: ${metadata.slug}
Section: ${metadata.section}
Source mode: ${sourceMode}

FINISHED POST
${String(postText).slice(0, 50000)}

AVAILABLE PARAGRAPH PLACEMENTS
${paragraphList}

REQUIRED ROLES
${roleList}

CURRENT OUR OLD DAD VISUAL IDENTITY — NON-NEGOTIABLE
- Bright, readable grayscale / charcoal / pencil-sketch base on off-white or light paper.
- Rough human texture, handmade marks, lived-memory feeling.
- Restrained purple highlights only. Purple should occupy a small accent area, generally under 10 percent of the composition.
- Purple must never become the dominant shadow color, background wash, atmospheric fog, border field, or overall mood.
- Avoid deep dark purple images. Avoid crushed blacks and murky low-key lighting. Preserve light paper, midtones, and visual breathing room.
- No clean ed-tech gloss, vector-corporate polish, stock-photo realism, or generic motivational imagery.
- No recognizable family likenesses. Use anonymous or symbolic people, silhouettes, back views, simplified faces, or scene details rather than portraits that resemble real family members.
- Card, hero, and body images must be genuinely separate concepts, not crops or variations of one image.
- Body images should cover four strong, distinct visual moments distributed across the post.
- Avoid written words, logos, album-cover copies, or trademark-dependent compositions unless the post absolutely requires a small generic label.

PLANNING RULES
- Choose moments that carry story, humor, emotional pressure, place, or memory. Do not illustrate abstract summary sentences when a concrete scene is available.
- Card must remain legible at small size.
- Hero must establish the post without repeating the card.
- Each body image must use placementIndex from the numbered paragraph list.
- Alt text describes what is visibly present, not the meaning of the post.
- Captions are optional. Use null when the image does not need one.
- Prompts must repeat the bright-sketch and sparse-purple requirements in concrete visual language.

Return JSON only in this exact shape:
{
  "summary": "one concise explanation of the selected visual arc",
  "visualThesis": "one short sentence describing how the six images work together",
  "images": [
    {
      "id": "card|hero|body-1|body-2|body-3|body-4",
      "file": "required lowercase filename",
      "role": "human-readable role",
      "moment": "the specific visual moment",
      "concept": "what the image shows",
      "composition": "framing, focal point, foreground/background, and brightness plan",
      "placementIndex": 0,
      "alt": "specific visible alt text",
      "caption": null,
      "prompt": "complete image-generation prompt"
    }
  ]
}`;
    const result = await generateText({
      model: process.env.STUDIO_TEXT_MODEL || 'openai/gpt-5.4',
      prompt,
      temperature: 0.4,
    });
    const planned = validatePlan(extractJson(result.text), Array.isArray(paragraphs) ? paragraphs.length : 1);
    return json(response, 200, planned);
  } catch (error) {
    return json(response, error.status || 400, { error: error.message });
  }
}
