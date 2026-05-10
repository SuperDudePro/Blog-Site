import { FeaturedImage } from '../components/FeaturedImage';
import { PostCard } from '../components/PostCard';
import { RotatingGallery } from '../components/RotatingGallery';
import { getPostsForSection } from '../content/loadPosts';
import { sections, type SectionKey } from '../data/siteContent';

type Props = {
  sectionKey: SectionKey;
  oldLinkNotice?: boolean;
};

export function SectionPage({ sectionKey, oldLinkNotice = false }: Props) {
  const section = sections.find((item) => item.key === sectionKey);
  const posts = getPostsForSection(sectionKey);

  if (!section) {
    return (
      <div className="page-wrap">
        <h1>Section not found</h1>
        <p>That section does not exist here.</p>
      </div>
    );
  }

  const hasGallery = Boolean(section.galleryImages?.length);
  const hasImage = Boolean(section.imageSrc);
  const hasVisual = hasGallery || hasImage;

  return (
    <div className="page-wrap">
      <section className={`section-hero ${hasVisual ? 'section-hero--with-visual' : 'section-hero--text-only'}`}>
        <div className="section-copy-card">
          <span className="eyebrow">section</span>
          <h1>{section.name}</h1>
          <p className="lead">{section.intro}</p>
        </div>

        {hasVisual && (
          <div className="section-visual" aria-label={`${section.name} section image`}>
            {hasGallery ? (
              <RotatingGallery images={section.galleryImages ?? []} intervalMs={6000} />
            ) : (
              <FeaturedImage
                src={section.imageSrc}
                alt={section.imageAlt}
                className="feature-image feature-image--section"
              />
            )}
          </div>
        )}
      </section>

      {oldLinkNotice && sectionKey === 'everything' && (
        <aside className="old-link-notice" aria-labelledby="old-link-notice-title">
          <span className="eyebrow">old link</span>
          <h2 id="old-link-notice-title">You reached Our Old Dad from an old link.</h2>
          <p>
            The site has been rebuilt, and some old post URLs have moved. The piece you were
            looking for may still be here under a new title or section. Browse everything below,
            or use the sections above to poke around.
          </p>
        </aside>
      )}

      <section className="content-band">
        <div className="section-heading">
          <span className="eyebrow">posts</span>
          <h2>
            {section.key === 'everything' ? 'All posts in one place.' : `${section.name}`}
          </h2>
        </div>

        <div className="post-grid">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <article className="post-card post-card--empty">
              <div className="post-card__body">
                <span className="post-pill">Soon</span>
                <h3>No posts in this section yet.</h3>
                <p>More writing will appear here soon.</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
