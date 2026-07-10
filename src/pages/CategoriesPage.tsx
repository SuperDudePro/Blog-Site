import { SiteLink } from '../components/SiteLink';
import { formatPostDate, getPostsForSection } from '../content/loadPosts';
import { sections } from '../data/siteContent';
import { postPath, sectionPath } from '../routes';

export function CategoriesPage() {
  return (
    <div className="page-wrap about-page">
      <section className="page-hero page-hero--no-image">
        <div>
          <span className="eyebrow">categories</span>
          <h1>Pick a corner of the mess.</h1>
          <p className="lead">
            Browse everything in order, or start with family stories, learning, music,
            slow travel, or advice.
          </p>
        </div>
      </section>

      <section className="about-grid about-grid--three" aria-label="Post categories">
        {sections.map((section) => {
          const latestPost = getPostsForSection(section.key)[0];

          return (
            <article className="about-card" key={section.key}>
              <span className="eyebrow">{section.shortName}</span>
              <h2>{section.name}</h2>
              <p>{section.description}</p>

              {latestPost ? (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid var(--border)' }}>
                  <span className="post-pill">Latest</span>
                  <h3>{latestPost.title}</h3>
                  <p className="post-card__meta">{formatPostDate(latestPost)}</p>
                  <p>{latestPost.excerpt}</p>
                  <div className="hero__actions" style={{ marginTop: '1rem', gap: '0.65rem' }}>
                    <SiteLink className="button button--primary" href={postPath(latestPost.slug)}>
                      Read latest
                    </SiteLink>
                    <SiteLink className="button button--ghost" href={sectionPath(section.key)}>
                      {section.key === 'everything' ? 'Browse everything' : 'Browse category'}
                    </SiteLink>
                  </div>
                </div>
              ) : (
                <p>No posts here yet.</p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
