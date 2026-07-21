import { FeaturedImage } from '../components/FeaturedImage';
import { PostCard } from '../components/PostCard';
import { SharePost } from '../components/SharePost';
import { SiteLink } from '../components/SiteLink';
import { SubscribeForm } from '../components/SubscribeForm';
import { getPostBySlug, formatPostDate, getRelatedPosts } from '../content/loadPosts';
import { getSectionName, site } from '../data/siteContent';
import { sectionPath } from '../routes';

type Props = { slug: string };

export function PostPage({ slug }: Props) {
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="page-wrap">
        <section className="page-hero">
          <div>
            <span className="eyebrow">not found</span>
            <h1>That post is not here.</h1>
            <p className="lead">That link does not point to a post that exists here.</p>
            <div className="hero__actions"><SiteLink className="button button--primary" href={sectionPath('everything')}>Browse everything</SiteLink></div>
          </div>
          <FeaturedImage />
        </section>
      </div>
    );
  }

  const related = getRelatedPosts(post);
  const shareUrl = new URL(`/post/${post.slug}`, site.url).href;
  const shareImageSource = post.cardImage ?? post.heroImage;
  const shareImage = shareImageSource ? new URL(shareImageSource, site.url).href : undefined;

  return (
    <div className="page-wrap">
      <section className="page-hero page-hero--post">
        <div>
          <span className="eyebrow">{getSectionName(post.section)}</span>
          <h1>{post.title}</h1>
          <p className="lead">{post.excerpt}</p>
          <p className="post-page__meta">{formatPostDate(post)}</p>
          <div className="hero__actions">
            <SiteLink className="button button--primary" href={sectionPath(post.section)}>More in this section</SiteLink>
            <SiteLink className="button button--ghost" href="/archive">Search the archive</SiteLink>
          </div>
        </div>
        <FeaturedImage src={post.heroImage} alt={post.heroAlt} className="feature-image" />
      </section>

      <article className="post-article">
        <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
        <SharePost title={post.title} excerpt={post.excerpt} url={shareUrl} {...(shareImage ? { image: shareImage } : {})} />
      </article>
      {related.length > 0 && (
        <section className="content-band" aria-labelledby="related-posts-title">
          <div className="section-heading"><span className="eyebrow">keep reading</span><h2 id="related-posts-title">Related pieces</h2></div>
          <div className="post-grid">{related.map((item) => <PostCard key={item.slug} post={item} />)}</div>
        </section>
      )}
      <SubscribeForm />
    </div>
  );
}
