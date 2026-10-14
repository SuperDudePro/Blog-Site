import type { Section, SectionKey } from '../data/siteContent';
import { sectionPath } from '../routes';
import { SiteLink } from './SiteLink';
import './SectionCard.css';

type Props = { section: Section };

const sectionSketchAlt: Record<SectionKey, string> = {
  everything: 'A journal, headphones, photographs, and a map in a charcoal sketch.',
  diary: 'An open diary, reading glasses, and a cup of coffee sketched in charcoal.',
  'life-education': 'A child following a winding path with a notebook and compass.',
  'music-playlists': 'Over-ear headphones resting on a stack of vinyl records.',
  'slow-travel': 'A pickup truck pulling a travel trailer toward the mountains.',
  advice: 'A weathered hand pointing toward a fork in the road.',
};

export function SectionCard({ section }: Props) {
  return (
    <SiteLink className="section-card card-link" href={sectionPath(section.key)}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <div
        className={`section-card__sketch section-card__sketch--${section.key}`}
        role="img"
        aria-label={sectionSketchAlt[section.key]}
      />
      <p>{section.description}</p>
      <span className="text-link text-link--fake">Open section</span>
    </SiteLink>
  );
}
