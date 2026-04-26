import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { DOMAINS, DOMAINS_META } from "../data/domainsData";

export function DomainsPage() {
  return (
    <PageShell>
      <PageIntro pill="The Domains" title={DOMAINS_META.title} subtitle={DOMAINS_META.subtitle} />
      <BackBar><a href="/" className="back-link">← Back to Home</a></BackBar>
      <section className="doc-dark">
        {DOMAINS_META.intro.map((paragraph) => (
          <p key={paragraph} className="doc-dark-text">{paragraph}</p>
        ))}
      </section>
      <section className="doc-section">
        <h2 className="doc-section-title">Foundational Principles</h2>
        <ul className="doc-list">
          {DOMAINS_META.principles.map((principle) => (
            <li key={principle} className="doc-list-item"><span className="doc-list-dot" /><span>{principle}</span></li>
          ))}
        </ul>
      </section>
      <section className="doc-section doc-section-alt">
        <h2 className="doc-section-title">The 10 Core Learning Domains</h2>
        <div className="domain-page-grid">
          {DOMAINS.map((domain) => (
            <a key={domain.slug} href={`/domains/${domain.slug}`} className="domain-page-card">
              <div className="domain-page-card-number">{domain.number}</div>
              <div className="domain-page-card-title">{domain.title}</div>
              <div className="domain-page-card-note">Open full domain details</div>
            </a>
          ))}
        </div>
      </section>
      <section className="doc-section">
        <h2 className="doc-section-title">Domain Recap</h2>
        <ul className="doc-list">
          {DOMAINS_META.recap.map((item) => (
            <li key={item} className="doc-list-item"><span className="doc-list-dot" /><span>{item}</span></li>
          ))}
        </ul>
      </section>
      <section className="doc-section doc-section-alt">
        <h2 className="doc-section-title">Equity &amp; Access</h2>
        {DOMAINS_META.appendix.map((paragraph) => (
          <p key={paragraph} className="doc-section-text">{paragraph}</p>
        ))}
      </section>
      <footer className="footer"><div className="footer-inner"><div className="footer-text">© LifeEducation.org</div><a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div></footer>
    </PageShell>
  );
}
