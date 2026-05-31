import type { Section } from '../data/siteContent';
import { sectionPath } from '../routes';
import { SiteLink } from './SiteLink';

type Props = {
  section: Section;
};

export function SectionCard({ section }: Props) {
  return (
    <SiteLink className="section-card card-link" href={sectionPath(section.key)}>
      <span className="post-pill">{section.shortName}</span>
      <h3>{section.name}</h3>
      <p>{section.description}</p>
      <span className="text-link text-link--fake">Open section</span>
    </SiteLink>
  );
}
