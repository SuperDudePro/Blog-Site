import { PageShell } from "../components/PageShell";
import { PageIntro } from "../components/PageIntro";
import { BackBar } from "../components/BackBar";
import { PostCard } from "../components/PostCard";
import { getRecentPosts } from "../content/loadPosts";

export function PostsPage() {
  const currentPosts = getRecentPosts();

  return (
    <PageShell>
      <PageIntro
        pill="Posts"
        title="Posts"
        subtitle="Essays and field notes on LifeEducation, capability, the Floor, domains, parenting, and real-world learning."
      />
      <BackBar><a href="/" className="back-link">← Back to Home</a></BackBar>
      <section className="doc-dark">
        <p className="doc-dark-text">
          This is the running post library for the project. It is intentionally simple: add a new folder under <code>src/posts</code>, drop in the post code and any images, and the site picks it up automatically.
        </p>
        <p className="doc-dark-text">
          The lane is narrow on purpose. Posts here should support the core question: what does it take to raise capable, self-directed humans without turning life into school theater?
        </p>
      </section>
      <section className="posts-section">
        <div className="posts-head">
          <div className="posts-pill">Current posts</div>
          <h2 className="posts-title">Large cards, simple archive, no CMS overhead.</h2>
          <p className="posts-text">
            New entries live as folders in <code>src/posts</code>. That keeps this site aligned with the Our Old Dad workflow instead of adding another system to maintain.
          </p>
        </div>
        <div className="post-grid">
          {currentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-text">© LifeEducation.org</div>
          <a className="footer-link" href="mailto:LifeEducationInformation@gmail.com">LifeEducationInformation@gmail.com</a>
        </div>
      </footer>
    </PageShell>
  );
}
