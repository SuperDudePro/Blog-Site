import { formatPostDate } from '../content/loadPosts';
import type { BlogPost } from '../content/postTypes';
import { getSectionName } from '../data/siteContent';
import { ImagePlaceholder } from './ImagePlaceholder';

type Props = {
  post: BlogPost;
};

export function PostCard({ post }: Props) {
  const imageSrc = post.cardImage ?? post.heroImage;
  const imageAlt = post.cardAlt ?? post.heroAlt ?? post.title;

  return (
    <article className="post-card">
      <div className="post-card__media">
        {imageSrc ? (
          <img className="post-card__image" src={imageSrc} alt={imageAlt} />
        ) : (
          <ImagePlaceholder label="Post image" detail="Add a grayscale post image later." compact />
        )}
      </div>

      <div className="post-card__body">
        <span className="post-pill">{post.status ?? 'Recent'}</span>
        <p className="post-card__meta">
          {formatPostDate(post)} · {getSectionName(post.section)}
        </p>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <a className="text-link" href={`#/post/${post.slug}`}>
          Read post
        </a>
      </div>
    </article>
  );
}
