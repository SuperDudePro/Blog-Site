import { getSectionName, type Post } from '../data/siteContent';

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  return (
    <article className="post-card">
      <span className="post-pill">{post.status}</span>
      <p className="post-card__meta">
        {post.date} · {getSectionName(post.section)}
      </p>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <a className="text-link" href="#/about">
        Read placeholder
      </a>
    </article>
  );
}
