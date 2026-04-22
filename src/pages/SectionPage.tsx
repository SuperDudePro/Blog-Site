import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { PostCard } from '../components/PostCard';
import { sections, starterPosts, type SectionKey } from '../data/siteContent';

type Props = {
  sectionKey: SectionKey;
};

export function SectionPage({ sectionKey }: Props) {
  const section = sections.find((item) => item.key === sectionKey);
  const posts = starterPosts.filter((post) => post.section === sectionKey);

  if (!section) {
    return (
      <div className="page-wrap">
        <h1>Section not found</h1>
        <p>This starter build expects one of the five current public sections.</p>
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
          label={`${section.shortName} image block`}
          detail="Drop a section-level grayscale image here later, or replace this with a collage or framed quote."
        />
      </section>

      <section className="content-band">
        <div className="section-heading">
          <span className="eyebrow">starter entries</span>
          <h2>Placeholder cards for the first pieces in this lane.</h2>
        </div>

        <div className="post-grid">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.title} post={post} />)
          ) : (
            <article className="post-card">
              <span className="post-pill">Coming soon</span>
              <h3>No entries have been dropped into this section yet.</h3>
              <p>That is fine. Keep the lane available, and add real pieces as they emerge.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
