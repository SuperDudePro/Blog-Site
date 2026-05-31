import { FeaturedImage } from '../components/FeaturedImage';
import { SiteLink } from '../components/SiteLink';
import { getPostBySlug, formatPostDate } from '../content/loadPosts';
import { getSectionName } from '../data/siteContent';
import { sectionPath } from '../routes';

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
              That link does not point to a post that exists here.
            </p>
            <div className="hero__actions">
              <SiteLink className="button button--primary" href={sectionPath('everything')}>
                Browse everything
              </SiteLink>
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
            <SiteLink className="button button--primary" href={sectionPath(post.section)}>
              More in this section
            </SiteLink>
            <SiteLink className="button button--ghost" href={sectionPath('everything')}>
              Browse everything
            </SiteLink>
          </div>
        </div>

        <FeaturedImage src={post.heroImage} alt={post.heroAlt} className="feature-image" />
      </section>

      <article className="post-article" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
    </div>
  );
}
