import type { SectionKey } from '../data/siteContent';

export const sectionSketchAlt: Record<SectionKey, string> = {
  everything: 'A laptop, coffee mug, notebook, and phone in a charcoal-and-purple sketch.',
  diary: 'A worn leather journal and pen in a charcoal-and-purple sketch.',
  'life-education': 'A globe, stacked books, and foliage in a charcoal-and-purple sketch.',
  'music-playlists': 'An acoustic guitar and headphones in a charcoal-and-purple sketch.',
  'slow-travel': 'A hiking backpack beside a mountain landscape in a charcoal-and-purple sketch.',
  advice: 'A weathered wooden trail signpost in a charcoal-and-purple sketch.',
  'junk-drawer': 'A charcoal-and-purple vintage junk drawer filled with mementos, with a metal Junk Drawer label on its front.',
};

export function sectionSketchPath(key: SectionKey): string {
  if (key === 'junk-drawer') return '/section-sketches/junk-drawer.webp?v=20261107-approved';
  return `/section-sketches/${key}.webp?v=20261015-replacement`;
}
