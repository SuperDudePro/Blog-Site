import type { StructuredSection } from "../types";

export function SectionNav({ sections, label = "On this page" }: { sections: Pick<StructuredSection, "id" | "heading">[]; label?: string }) {
  if (!sections.length) return null;

  return (
    <section className="section-nav" aria-label={label}>
      <div className="section-nav-label">{label}</div>
      <div className="section-nav-links">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="section-nav-link">{section.heading}</a>
        ))}
      </div>
    </section>
  );
}
