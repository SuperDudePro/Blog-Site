import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { DOMAINS } from "../data/domainsData";

export function DomainDetailPage({ slug }: { slug: string }) {
  const domain = DOMAINS.find((item) => item.slug === slug);

  if (!domain) {
    return (
      <PageShell>
        <PageIntro pill="Domain Detail" title="Domain not found" subtitle="That domain page does not exist yet." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageIntro pill={`Domain ${domain.number}`} title={domain.title} subtitle="Broader map page, not the minimum contract." />
      <BackBar>
        <div className="back-link-row"><a href="/domains" className="back-link">← Back to Domains</a><a href="/" className="back-link">Back to Home</a></div>
      </BackBar>
      <section className="doc-dark"><p className="doc-dark-text">This page shows the full domain map from the 10-Domain Framework: core outcomes, key competencies, and evidence examples. The Floor still defines the minimum contract.</p></section>
      <section className="doc-section">
        <h2 className="doc-section-title">Core Outcomes</h2>
        <ul className="doc-list">
          {domain.coreOutcomes.map((item) => (
            <li key={item} className="doc-list-item"><span className="doc-list-dot" /><span>{item}</span></li>
          ))}
        </ul>
      </section>
      <section className="doc-section doc-section-alt">
        <h2 className="doc-section-title">Key Competencies</h2>
        <ul className="doc-list doc-list-columns">
          {domain.competencies.map((item) => (
            <li key={item} className="doc-list-item"><span className="doc-list-dot" /><span>{item}</span></li>
          ))}
        </ul>
      </section>
      <section className="doc-section">
        <h2 className="doc-section-title">Evidence Examples</h2>
        <p className="doc-section-text">{domain.evidence}</p>
      </section>
      <footer className="footer"><div className="footer-inner"><div className="footer-text">© LifeEducation.org</div><a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div></footer>
    </PageShell>
  );
}
