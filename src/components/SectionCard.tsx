import type { Section } from '../data/siteContent';

type Props = {
  section: Section;
};

export function SectionCard({ section }: Props) {
  return (
    <a className="section-card card-link" href={`#/section/${section.key}`} aria-label={`Open ${section.name}`}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <p>{section.description}</p>
      <span className="text-link text-link--fake">Open section</span>
    </a>
  );
}
