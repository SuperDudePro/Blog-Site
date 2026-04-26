import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { ContentBlocks } from "../components/ContentBlocks";
import { SectionNav } from "../components/SectionNav";
import { FLOOR_DATA } from "../data/floorData";

export function FloorPage() {
  return (
    <PageShell>
      <PageIntro pill="The Floor" title={FLOOR_DATA.title} subtitle={FLOOR_DATA.subtitle} notice={FLOOR_DATA.notice} />
      <BackBar>
        <div className="back-link-row"><a href="/" className="back-link">← Back to Home</a><a href="/by-18" className="back-link">View By 18</a></div>
      </BackBar>
      <section className="doc-dark">
        {FLOOR_DATA.intro.map((paragraph) => (
          <p key={paragraph} className="doc-dark-text">{paragraph}</p>
        ))}
      </section>
      <SectionNav sections={FLOOR_DATA.sections} />
      {FLOOR_DATA.sections.map((section, index) => (
        <section key={section.id} id={section.id} className={index % 2 === 0 ? "doc-section" : "doc-section doc-section-alt"}>
          <h2 className="doc-section-title">{section.heading}</h2>
          <ContentBlocks blocks={section.blocks} />
        </section>
      ))}
      <footer className="footer"><div className="footer-inner"><div className="footer-text">© LifeEducation.org</div><a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div></footer>
    </PageShell>
  );
}
