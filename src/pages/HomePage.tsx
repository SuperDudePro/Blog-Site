import { FeaturedImage } from '../components/FeaturedImage';
import { PostCard } from '../components/PostCard';
import { SectionCard } from '../components/SectionCard';
import { getFeaturedPost, posts } from '../content/loadPosts';
import { sections, site } from '../data/siteContent';

export function HomePage() {
  const featured = getFeaturedPost();
  const recentPosts = posts.filter((post) => post.slug !== featured?.slug).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">voice-first writing project</span>
          <h1>{site.title}</h1>
          <p className="hero__tagline">{site.tagline}</p>
          <p className="hero__intro">{site.intro}</p>

          <div className="hero__actions">
            <a className="button button--primary" href={featured ? `#/post/${featured.slug}` : '#/about'}>
              Read latest post
            </a>
            <a className="button button--ghost" href="#recent-writing">
              Latest Writing
            </a>
          </div>
        </div>

        <FeaturedImage
          src={featured?.heroImage}
          alt={featured?.heroAlt}
          className="feature-image feature-image--tall"
        />
      </section>

      <section className="content-band content-band--featured">
        <div className="section-heading">
          <span className="eyebrow">featured</span>
          <h2>
            {featured
              ? 'Start with the newest piece already dropped into the system.'
              : 'The first real post will show up here automatically.'}
          </h2>
        </div>

        <div className="featured-grid">
          <FeaturedImage src={featured?.cardImage ?? featured?.heroImage} alt={featured?.cardAlt ?? featured?.heroAlt} />

          <article className="featured-card">
            <span className="post-pill">{featured?.status ?? 'Waiting'}</span>
            <h3>{featured?.title ?? 'No post has been dropped in yet.'}</h3>
            <p>
              {featured?.excerpt ??
                'Once the first post folder exists under src/content/posts, the home page will pull it in automatically.'}
            </p>
            <a className="button button--primary" href={featured ? `#/post/${featured.slug}` : '#/about'}>
              {featured ? 'Read featured post' : 'Read about the project'}
            </a>
          </article>
        </div>
      </section>

      <section className="content-band" id="recent-writing">
        <div className="section-heading">
          <span className="eyebrow">recent writing</span>
          <h2>Now the post cards are real. Drop in another folder and this list grows.</h2>
        </div>

        <div className="post-grid">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <article className="post-card post-card--empty">
              <div className="post-card__body">
                <span className="post-pill">Ready</span>
                <h3>No extra posts yet.</h3>
                <p>The system is wired. The next move is just another post folder.</p>
              </div>
            </article>
          )}
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
