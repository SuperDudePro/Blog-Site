import { PageShell } from "../components/PageShell";
import { BackBar } from "../components/BackBar";
import { getPostBySlug, formatPostDate } from "../content/loadPosts";

type Props = {
  slug: string;
};

export function PostPage({ slug }: Props) {
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <PageShell>
        <section className="doc-hero">
          <div className="doc-pill">Post not found</div>
          <h1 className="doc-title">That post is not here.</h1>
          <p className="doc-subtitle">The route exists, but no matching post folder was found under src/posts.</p>
        </section>
        <BackBar><a href="/posts" className="back-link">← Back to Posts</a></BackBar>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <article>
        <section className="post-hero">
          <div className="post-hero-copy">
            <div className="doc-pill">{post.topic ?? "Post"}</div>
            <h1 className="doc-title">{post.title}</h1>
            <p className="doc-subtitle">{post.excerpt}</p>
            <p className="post-page-meta">{formatPostDate(post)}</p>
            <div className="post-hero-actions">
              <a className="why-button" href="/posts">Browse all posts</a>
            </div>
          </div>
          {post.heroImage ? (
            <div className="post-hero-media">
              <img src={post.heroImage} alt={post.heroAlt ?? ""} loading="eager" decoding="async" />
            </div>
          ) : null}
        </section>
        <BackBar><a href="/posts" className="back-link">← Back to Posts</a></BackBar>
        <section className="post-article">
          {post.body}
        </section>
      </article>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-text">© LifeEducation.org</div>
          <a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a>
        </div>
      </footer>
    </PageShell>
  );
}
