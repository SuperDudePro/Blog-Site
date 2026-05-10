import { FeaturedImage } from '../components/FeaturedImage';
import { PostCard } from '../components/PostCard';
import { SectionCard } from '../components/SectionCard';
import { getFeaturedPost, posts } from '../content/loadPosts';
import homeSkullImage from '../assets/home-skull-square.webp';
import { sections, site } from '../data/siteContent';

export function HomePage() {
  const featured = getFeaturedPost();
  const recentPosts = posts.filter((post) => post.slug !== featured?.slug).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">field notes</span>
          <h1>{site.title}</h1>
          <p className="hero__tagline">{site.tagline}</p>
          <p className="hero__intro">{site.intro}</p>

          <div className="hero__actions">
            <a className="button button--primary" href={featured ? `#/post/${featured.slug}` : '#/section/everything'}>
              Read latest post
            </a>
            <a className="button button--ghost" href="#/section/everything">
              Browse all posts
            </a>
          </div>
        </div>

        <FeaturedImage
          src={homeSkullImage}
          alt="A square charcoal-style drawing of a skull with headphones, aviator sunglasses, and purple beard highlights."
          className="feature-image feature-image--tall feature-image--home-skull"
        />
      </section>

      <section className="content-band content-band--featured">
        <div className="section-heading">
          <span className="eyebrow">latest</span>
          <h2>{featured ? 'Latest post' : 'Latest writing'}</h2>
        </div>

        <div className="featured-grid">
          <FeaturedImage src={featured?.cardImage ?? featured?.heroImage} alt={featured?.cardAlt ?? featured?.heroAlt} />

          <a
            className="featured-card card-link"
            href={featured ? `#/post/${featured.slug}` : '#/section/everything'}
            aria-label={featured ? `Read ${featured.title}` : 'Browse all posts'}
          >
            <span className="post-pill">{featured?.status ?? 'Recent'}</span>
            <h3>{featured?.title ?? 'Latest writing'}</h3>
            <p>
              {featured?.excerpt ?? 'The newest post appears here automatically.'}
            </p>
            <span className="button button--primary button--fake">
              {featured ? 'Read post' : 'Browse all posts'}
            </span>
          </a>
        </div>
      </section>

      <section className="content-band" id="recent-writing">
        <div className="section-heading">
          <span className="eyebrow">recent writing</span>
          <h2>Recent posts</h2>
        </div>

        <div className="post-grid">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <article className="post-card post-card--empty">
              <div className="post-card__body">
                <span className="post-pill">Soon</span>
                <h3>No posts yet.</h3>
                <p>More writing will appear here soon.</p>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="content-band content-band--muted">
        <div className="section-heading">
          <span className="eyebrow">sections</span>
          <h2>Browse by section</h2>
        </div>

        <div className="section-grid">
          {sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </div>
      </section>

      <section className="content-band content-band--closing">
        <div className="closing-note">
          <span className="eyebrow">closing note</span>
          <h2>{site.footerNote}</h2>
        </div>
      </section>
    </>
  );
}
