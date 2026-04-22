import type { Section } from '../data/siteContent';

type Props = {
  section: Section;
};

export function SectionCard({ section }: Props) {
  return (
    <article className="section-card">
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <p>{section.description}</p>
      <a className="text-link" href={`#/section/${section.key}`}>
        Open section
      </a>
    </article>
  );
}
