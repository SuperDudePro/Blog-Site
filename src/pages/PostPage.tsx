import { FeaturedImage } from '../components/FeaturedImage';
import { getPostBySlug, formatPostDate } from '../content/loadPosts';
import { getSectionName } from '../data/siteContent';

type Props = {
  slug: string;
};

export function PostPage({ slug }: Props) {
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="page-wrap">
        <section className="page-hero">
          <div>
            <span className="eyebrow">not found</span>
            <h1>That post is not here.</h1>
            <p className="lead">
              The route exists, but no post folder with that slug was found under src/content/posts.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#/section/everything">
                Browse everything
              </a>
            </div>
          </div>
          <FeaturedImage />
        </section>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <section className="page-hero page-hero--post">
        <div>
          <span className="eyebrow">{getSectionName(post.section)}</span>
          <h1>{post.title}</h1>
          <p className="lead">{post.excerpt}</p>
          <p className="post-page__meta">{formatPostDate(post)}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={`#/section/${post.section}`}>
              More in this section
            </a>
            <a className="button button--ghost" href="#/section/everything">
              Browse everything
            </a>
          </div>
        </div>

        <FeaturedImage src={post.heroImage} alt={post.heroAlt} className="feature-image" />
      </section>

      <article className="post-article" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
    </div>
  );
}
