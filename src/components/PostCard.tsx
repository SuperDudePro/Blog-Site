import { getSectionName, type Post } from '../data/siteContent';
import { ImagePlaceholder } from './ImagePlaceholder';

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  return (
    <article className="post-card">
      <div className="post-card__media">
        {post.imageUrl ? (
          <img className="post-card__image" src={post.imageUrl} alt={post.imageAlt ?? post.title} />
        ) : (
          <ImagePlaceholder
            label="Post image"
            detail={post.imageAlt ?? 'Add a grayscale post image later.'}
            compact
          />
        )}
      </div>

      <div className="post-card__body">
        <span className="post-pill">{post.status}</span>
        <p className="post-card__meta">
          {post.date} · {getSectionName(post.section)}
        </p>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <a className="text-link" href="#/about">
          Read placeholder
        </a>
      </div>
    </article>
  );
}
