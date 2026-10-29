import type { SectionKey } from '../data/siteContent';

export const sectionSketchAlt: Record<SectionKey, string> = {
  everything: 'A laptop, coffee mug, notebook, and phone in a charcoal-and-purple sketch.',
  diary: 'A worn leather journal and pen in a charcoal-and-purple sketch.',
  'life-education': 'A globe, stacked books, and foliage in a charcoal-and-purple sketch.',
  'music-playlists': 'An acoustic guitar and headphones in a charcoal-and-purple sketch.',
  'slow-travel': 'A hiking backpack beside a mountain landscape in a charcoal-and-purple sketch.',
  advice: 'A weathered wooden trail signpost in a charcoal-and-purple sketch.',
};

export function sectionSketchPath(key: SectionKey): string {
  return `/section-sketches/${key}.webp?v=20261015-replacement`;
}
