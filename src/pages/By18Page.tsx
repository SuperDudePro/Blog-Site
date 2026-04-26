import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { BY18_DATA } from "../data/by18Data";

export function By18Page() {
  return (
    <PageShell>
      <PageIntro pill="By 18" title={BY18_DATA.title} subtitle={BY18_DATA.subtitle} />
      <BackBar>
        <div className="back-link-row"><a href="/" className="back-link">← Back to Home</a><a href="/floor" className="back-link">View the Floor</a></div>
      </BackBar>
      <section className="doc-dark">
        {BY18_DATA.intro.map((paragraph) => (
          <p key={paragraph} className="doc-dark-text">{paragraph}</p>
        ))}
        <h2 className="doc-dark-text doc-dark-lead">{BY18_DATA.lead}</h2>
      </section>
      {BY18_DATA.groups.map((group) => (
        <section key={group.title} className="doc-section">
          <h2 className="doc-section-title">{group.title}</h2>
          <ul className="doc-list">
            {group.items.map((item) => (
              <li key={item} className="doc-list-item"><span className="doc-list-dot" /><span>{item}</span></li>
            ))}
          </ul>
        </section>
      ))}
      <section className="doc-section doc-section-alt">
        {BY18_DATA.closing.map((paragraph) => (
          <p key={paragraph} className="doc-section-text doc-closing-text">{paragraph}</p>
        ))}
      </section>
      <footer className="footer"><div className="footer-inner"><div className="footer-text">© LifeEducation.org</div><a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div></footer>
    </PageShell>
  );
}
