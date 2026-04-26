import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { PostCard } from '../components/PostCard';
import { getPostsForSection } from '../content/loadPosts';
import { sections, type SectionKey } from '../data/siteContent';

type Props = {
  sectionKey: SectionKey;
};

export function SectionPage({ sectionKey }: Props) {
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

  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div>
          <span className="eyebrow">section</span>
          <h1>{section.name}</h1>
          <p className="lead">{section.intro}</p>
        </div>
        <ImagePlaceholder
          label={section.shortName}
          detail={section.description}
        />
      </section>

      <section className="content-band">
        <div className="section-heading">
          <span className="eyebrow">posts</span>
          <h2>
            {section.key === 'everything'
              ? 'All posts in one place.'
              : `${section.name}`}
          </h2>
        </div>

        <div className="post-grid">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <article className="post-card">
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
