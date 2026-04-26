import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { site } from '../data/siteContent';

export function AboutPage() {
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div>
          <span className="eyebrow">about</span>
          <h1>What this is</h1>
          <p className="lead">
            {site.title} follows fatherhood, music, memory, learning, and the work of building a bigger life while the years keep moving.
          </p>
        </div>
        <ImagePlaceholder
          label="Our Old Dad"
          detail="A place for family stories, playlists, and the road ahead."
        />
      </section>

      <section className="copy-grid">
        <div>
          <h2>The short version</h2>
          <p>{site.intro}</p>
          <p>
            The writing moves between remembered scenes, music, parenting, travel plans, and sharper takes on what matters.
          </p>
        </div>

        <div>
          <h2>What you will find here</h2>
          <ul className="plain-list">
            <li>Diary pieces about family life and the absurdity of being an old dad.</li>
            <li>Life Education posts about learning, judgment, capability, and growing up.</li>
            <li>Music playlist posts tied to seasons, trips, moods, and memory.</li>
            <li>Slow Travel writing about the life being built and the road ahead.</li>
            <li>Advice posts that get directly to the point.</li>
          </ul>
        </div>
      </section>

      <section className="content-band content-band--muted">
        <div className="section-heading">
          <span className="eyebrow">working principle</span>
          <h2>Tell the truth before nostalgia ruins it.</h2>
          <p>
            Memory, music, parenting, mistakes, and whatever else belongs in the record.
          </p>
        </div>
      </section>
    </div>
  );
}
