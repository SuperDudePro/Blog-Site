import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { PostCard } from '../components/PostCard';
import { SectionCard } from '../components/SectionCard';
import { sections, site, starterPosts } from '../data/siteContent';

export function HomePage() {
  const featured = starterPosts.find((post) => post.status === 'Featured') ?? starterPosts[0];
  const recentPosts = starterPosts.filter((post) => post !== featured);

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">voice-first writing project</span>
          <h1>{site.title}</h1>
          <p className="hero__tagline">{site.tagline}</p>
          <p className="hero__intro">{site.intro}</p>

          <div className="hero__actions">
            <a className="button button--primary" href="#/about">
              Start Here
            </a>
            <a className="button button--ghost" href="#recent-writing">
              Latest Writing
            </a>
          </div>
        </div>

        <ImagePlaceholder
          label="Hero image"
          detail="Use a grayscale family, travel, or documentary-style photo here later."
          tall
        />
      </section>

      <section className="content-band content-band--featured">
        <div className="section-heading">
          <span className="eyebrow">featured</span>
          <h2>Start with the piece that explains the project in motion.</h2>
        </div>

        <div className="featured-grid">
          <ImagePlaceholder
            label="Featured post image"
            detail="Another grayscale image block with a silver frame and a muted purple accent line."
          />

          <article className="featured-card">
            <span className="post-pill">Featured piece</span>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <a className="button button--primary" href="#/about">
              Read placeholder
            </a>
          </article>
        </div>
      </section>

      <section className="content-band" id="recent-writing">
        <div className="section-heading">
          <span className="eyebrow">recent writing</span>
          <h2>Enough structure to browse. Not so much structure that it slows you down.</h2>
        </div>

        <div className="post-grid">
          {recentPosts.map((post) => (
            <PostCard key={post.title} post={post} />
          ))}
        </div>
      </section>

      <section className="content-band content-band--muted">
        <div className="section-heading">
          <span className="eyebrow">browse the lanes</span>
          <h2>Everything first, then the five public-facing homes for the writing.</h2>
        </div>

        <div className="section-grid">
          {sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </div>
      </section>

      <section className="content-band content-band--closing">
        <div className="closing-note">
          <span className="eyebrow">the project</span>
          <h2>Black-and-white field notes from a late-built family adventure.</h2>
          <p>{site.footerNote}</p>
        </div>
      </section>
    </>
  );
}
