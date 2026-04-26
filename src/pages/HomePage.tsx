import { DOMAINS } from "../data/domainsData";
import { HOME_FAQ_ITEMS } from "../data/homeFaqData";
import { PageShell } from "../components/PageShell";
import { PostCard } from "../components/PostCard";
import { getRecentPosts } from "../content/loadPosts";

export function HomePage() {
  const featuredPosts = getRecentPosts(2);

  return (
    <PageShell>
      <div className="hero">
        <section className="hero-copy">
          <div className="copy-inner">
            <div className="pill">LifeEducation</div>
            <h1 className="hero-title">
              If you dropped them off in a strange city on a different continent, could they figure it out?
            </h1>
            <p className="hero-text">
              Too much of the current system still rewards looking good on paper. I’m trying to raise kids who can think, adapt, solve problems, and function in real life.
            </p>
          </div>
        </section>
        <section className="hero-art">
          <div className="art-card">
            <div className="tree-wrap">
              <img src="/lifeeducation_tree_source.webp" alt="" aria-hidden="true" loading="eager" decoding="async" />
            </div>
          </div>
        </section>
      </div>
      <section className="image-break">
        <div className="image-break-inner">
          <img className="image-break-img" src="/lifeeducation_break_navigator.webp" alt="Young person navigating a foreign city with a map" loading="lazy" decoding="async" />
        </div>
      </section>
      <section className="why">
        <div className="why-grid">
          <div className="why-copy">
            <div className="why-pill">The Why</div>
            <h2 className="why-title">Most education talk starts in the wrong place.</h2>
            <p className="why-text">
              It starts with school. Or curriculum. Or standards. Or credentials. The better starting point is simpler: what should an 18-year-old actually be able to do, on their own, in real life?
            </p>
            <p className="why-text">
              Skip the school reform debate. Name a better target and build around it directly. The goal is real capability, autonomy, and judgment.
            </p>
            <a className="why-button" href="/why">Read the Why Statement</a>
          </div>
          <div className="why-cards">
            <div className="why-card">
              <div className="why-card-label">Target</div>
              <div className="why-card-title">The Floor is the contract.</div>
              <div className="why-card-text">Minimum adulthood capability by 18. Serious, non-negotiable, and not disguised curriculum theater.</div>
            </div>
            <div className="why-card">
              <div className="why-card-label">Priorities</div>
              <div className="why-card-title">Agency. Capability. Optionality.</div>
              <div className="why-card-text">Integrity, Health, and Belonging complete the set. The system exists to serve those six priorities.</div>
            </div>
            <div className="why-card">
              <div className="why-card-label">Shape</div>
              <div className="why-card-title">Keep it light.</div>
              <div className="why-card-text">A better target, clear guardrails, and a life where real things happen on purpose. That’s it.</div>
            </div>
          </div>
        </div>
      </section>
      <section className="faq">
        <div className="faq-head">
          <div className="faq-pill">Q&amp;A</div>
          <h2 className="faq-title">The questions a serious parent or skeptic should ask.</h2>
          <p className="faq-text">Better to answer them plainly than hide the big distinctions under branding. These are the short versions; the full Q&amp;A now has the complete public FAQ.</p>
        </div>
        <div className="faq-grid">
          {HOME_FAQ_ITEMS.map((item) => (
            <div key={item.question} className="faq-card">
              <div className="faq-card-label">{item.label}</div>
              <div className="faq-card-title">{item.question}</div>
              <div className="faq-card-text">{item.answer}</div>
            </div>
          ))}
        </div>
        <a className="why-button" href="/qa">Read the full Q&amp;A</a>
      </section>
      <section className="floor-section">
        <div className="floor-head">
          <div className="floor-pill">The Floor + By 18</div>
          <h2 className="floor-title">The contract, and By 18, its public translation.</h2>
          <p className="floor-text">The Floor is the non-negotiable minimum by 18. By 18 says the same thing in plain language.</p>
        </div>
        <div className="floor-grid">
          <div className="floor-card">
            <div className="floor-card-label">The contract</div>
            <div className="floor-card-title">The 18-Year-Old Floor</div>
            <div className="floor-card-text">This is the minimum line for adulthood capability.</div>
            <a className="floor-card-button" href="/floor">Read the Floor document</a>
          </div>
          <div className="floor-card floor-card-accent">
            <div className="floor-card-label">Public translation</div>
            <div className="floor-card-title">By 18: What You Can Do</div>
            <div className="floor-card-text">This is the same contract in plain public language.</div>
            <a className="floor-card-button floor-card-button-accent" href="/by-18">Read the By 18 document</a>
          </div>
        </div>
      </section>
      <section className="domains">
        <div className="domains-head">
          <div className="domains-pill">The 10 Domains</div>
          <h2 className="domains-title">The Floor is the minimum.<br />The Domains show the full map.</h2>
          <p className="domains-text">The Domains are here to keep blind spots visible.</p>
          <p className="domains-text">They are not a second contract. The Floor is still the minimum.</p>
        </div>
        <div className="domains-grid">
          {DOMAINS.map((domain) => (
            <a key={domain.slug} href={`/domains/${domain.slug}`} className="domains-item domains-item-link">
              <span className="domains-item-number">{domain.number}</span>
              <span>{domain.title}</span>
            </a>
          ))}
        </div>
        <div className="domains-note">Contract first. Full map second.</div>
        <a className="domains-button" href="/domains">Read the Domains document</a>
      </section>
      <section className="posts-section posts-section-home">
        <div className="posts-head">
          <div className="posts-pill">Posts</div>
          <h2 className="posts-title">Short essays and notes as the system gets built in public.</h2>
          <p className="posts-text">This will hold practical writing on the Floor, the Domains, evidence, parenting, travel, and the work of raising capable kids without recreating school at home.</p>
        </div>
        <div className="post-grid">
          {featuredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <a className="domains-button" href="/posts">Browse posts</a>
      </section>
      <section className="image-break">
        <div className="image-break-inner">
          <img className="image-break-img" src="/site_break_02_contact_desk.webp" alt="Documents, notes, and letters prepared for serious public exchange" loading="lazy" decoding="async" />
        </div>
      </section>
      <section className="contact">
        <div className="contact-grid">
          <div className="contact-copy">
            <div className="contact-pill">Contact</div>
            <h2 className="contact-title">If you see something I’m missing, tell me.</h2>
            <p className="contact-text">I’m building this for my own kids first. If you see a blind spot, a hole in the logic, or a better way to say something, send it.</p>
          </div>
          <div className="contact-card">
            <div className="contact-card-label">Public contact</div>
            <div className="contact-card-line"><a href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a></div>
            <div className="contact-card-note">Use this address for objections, ideas, examples, or serious feedback.</div>
            <a className="contact-card-cta" href="mailto:LifeEducationInformation@gmail.com?subject=LifeEducation%20Website%20Feedback">Email your thoughts</a>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-text">© LifeEducation.org</div>
          <a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a>
        </div>
      </footer>
    </PageShell>
  );
}
