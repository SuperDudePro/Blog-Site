import { formatPostDate } from "../content/loadPosts";
import type { LifeEducationPost } from "../content/postTypes";

type Props = {
  post: LifeEducationPost;
};

export function PostCard({ post }: Props) {
  const imageSrc = post.cardImage ?? post.heroImage;
  const imageAlt = post.cardAlt ?? post.heroAlt ?? "";

  return (
    <article className="post-card">
      <a className="post-card-media" href={`/posts/${post.slug}`} aria-label={`Read ${post.title}`}>
        {imageSrc ? (
          <img className="post-card-image" src={imageSrc} alt={imageAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="post-card-placeholder" aria-hidden="true">
            <span>LifeEducation</span>
          </div>
        )}
      </a>
      <div className="post-card-body">
        <div className="post-card-kicker">
          <span className="post-pill">{post.status ?? "Recent"}</span>
          <span>{formatPostDate(post)}</span>
        </div>
        {post.topic ? <div className="post-card-topic">{post.topic}</div> : null}
        <h2 className="post-card-title">
          <a href={`/posts/${post.slug}`}>{post.title}</a>
        </h2>
        <p className="post-card-excerpt">{post.excerpt}</p>
        {post.tags?.length ? (
          <div className="post-tags" aria-label="Post tags">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="post-tag">{tag}</span>
            ))}
          </div>
        ) : null}
        <a className="post-read-link" href={`/posts/${post.slug}`}>Read post</a>
      </div>
    </article>
  );
}
