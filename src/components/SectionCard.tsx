import type { Section, SectionKey } from '../data/siteContent';
import { sectionPath } from '../routes';
import { SiteLink } from './SiteLink';
import './SectionCard.css';

type Props = { section: Section };

export function SectionCard({ section }: Props) {
  return (
    <SiteLink className="section-card card-link" href={sectionPath(section.key)}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <img
        className={`section-card__sketch section-card__sketch--${section.key}`}
        src={sectionSketchPath(section.key)}
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
