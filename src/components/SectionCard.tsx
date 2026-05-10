import type { Section } from '../data/siteContent';

type Props = {
  section: Section;
};

export function SectionCard({ section }: Props) {
  return (
    <a className="section-card section-card--clickable" href={`#/section/${section.key}`} aria-label={`Open ${section.name}`}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <p>{section.description}</p>
      <span className="text-link" aria-hidden="true">
        Open section
      </span>
    </a>
  );
}
