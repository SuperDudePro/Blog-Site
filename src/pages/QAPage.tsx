import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { QA_DATA } from "../data/qaData";

export function QAPage() {
  return (
    <PageShell>
      <PageIntro pill="Q&A" title="LifeEducation Q&A" subtitle="Plain answers to the obvious objections" />
      <BackBar><a href="/" className="back-link">← Back to Home</a></BackBar>
      <section className="doc-dark">
        {QA_DATA.intro.map((paragraph) => (
          <p key={paragraph} className="doc-dark-text">{paragraph}</p>
        ))}
      </section>
      {QA_DATA.sections.map((section, sectionIndex) => (
        <section key={section.heading} className={sectionIndex % 2 === 0 ? "doc-section" : "doc-section doc-section-alt"}>
          <h2 className="doc-section-title">{section.heading}</h2>
          <div className="qa-list">
            {section.items.map((item) => (
              <article key={item.question} className="qa-item">
                <h3 className="qa-question">{item.question}</h3>
                {item.answer.map((paragraph) => (
                  <p key={paragraph} className="qa-answer">{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className="doc-dark">
        {QA_DATA.bottom.map((paragraph) => (
          <p key={paragraph} className="doc-dark-text">{paragraph}</p>
        ))}
      </section>
      <footer className="footer"><div className="footer-inner"><div className="footer-text">© LifeEducation.org</div><a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div></footer>
    </PageShell>
  );
}
