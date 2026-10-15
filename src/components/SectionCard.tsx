import type { Section, SectionKey } from '../data/siteContent';
import { sectionPath } from '../routes';
import { SiteLink } from './SiteLink';
import './SectionCard.css';

type Props = { section: Section };

const sectionSketchAlt: Record<SectionKey, string> = {
  everything: 'A laptop, coffee mug, notebook, and phone in a charcoal-and-purple sketch.',
  diary: 'A worn leather journal and pen in a charcoal-and-purple sketch.',
  'life-education': 'A globe, stacked books, and foliage in a charcoal-and-purple sketch.',
  'music-playlists': 'An acoustic guitar and headphones in a charcoal-and-purple sketch.',
  'slow-travel': 'A hiking backpack beside a mountain landscape in a charcoal-and-purple sketch.',
  advice: 'A weathered wooden trail signpost in a charcoal-and-purple sketch.',
};

export function SectionCard({ section }: Props) {
  return (
    <SiteLink className="section-card card-link" href={sectionPath(section.key)}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <img
        className={`section-card__sketch section-card__sketch--${section.key}`}
        src={`/section-sketches/${section.key}.webp?v=20261015-replacement`}
        alt={sectionSketchAlt[section.key]}
        width={320}
        height={320}
        loading="lazy"
        decoding="async"
      />
      <p>{section.description}</p>
      <span className="text-link text-link--fake">Open section</span>
    </SiteLink>
  );
}
