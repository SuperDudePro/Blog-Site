import { generateImage } from 'ai';
import { requirePublisher } from '../../lib/auth.mjs';
import { json, method, readJson } from '../../lib/http.mjs';

const validRoles = new Set(['card', 'hero', 'body-1', 'body-2', 'body-3', 'body-4']);

export default async function handler(request, response) {
  if (!method(request, response, 'POST')) return;
  try { requirePublisher(request); } catch (error) { return json(response, error.status || 401, { error: error.message }); }
  try {
    if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) throw Object.assign(new Error('AI Gateway is not configured. Add AI_GATEWAY_API_KEY to the Wilbert Publisher Vercel project.'), { status: 503 });
    const { image, metadata } = await readJson(request);
    if (!image || !validRoles.has(image.id) || !image.prompt || !metadata?.title) throw new Error('A valid approved image concept is required.');
    const roleShape = image.id === 'hero' ? 'wide 16:9 horizontal composition' : 'horizontal 4:3 composition';
    const prompt = `${image.prompt}

FINAL PRODUCTION CONSTRAINTS
- Our Old Dad post: ${metadata.title}
- Role: ${image.role}; ${roleShape}.
- Bright charcoal and pencil sketch on off-white or light paper. Preserve open light areas and readable midtones.
- Purple is a sparse highlight only, limited to a few small details. Do not use purple for the background, shadows, fog, overall lighting, large clothing areas, or a full-image tint.
- Do not make the image dark, murky, gothic, neon-purple, or heavily color-graded.
- Rough handmade human texture; no polished vector art, no clean ed-tech gloss, no stock-photo look.
- No recognizable family likenesses. Anonymous, simplified, symbolic, back-view, or loosely sketched people only.
- No border, no title text, no watermark, no logo.
- The result must be a complete final illustration with no placeholder areas.`;
    const result = await generateImage({
      model: process.env.STUDIO_IMAGE_MODEL || 'openai/gpt-image-2',
      prompt,
      aspectRatio: image.id === 'hero' ? '16:9' : '4:3',
      n: 1,
    });
    const generated = result.images?.[0];
    if (!generated?.base64) throw new Error('The image model returned no usable image.');
    return json(response, 200, {
      base64: generated.base64,
      mediaType: generated.mediaType || 'image/png',
      model: process.env.STUDIO_IMAGE_MODEL || 'openai/gpt-image-2',
    });
  } catch (error) {
    return json(response, error.status || 400, { error: error.message });
  }
}
