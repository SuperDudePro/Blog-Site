import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { site } from '../data/siteContent';

export function AboutPage() {
  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div>
          <span className="eyebrow">about</span>
          <h1>What this site is</h1>
          <p className="lead">
            {site.title} is a writing project about fatherhood, slow travel, life education,
            music, memory, and the strange work of raising two generations at once.
          </p>
        </div>
        <ImagePlaceholder
          label="About page image"
          detail="A portrait, family image, or travel-detail image can live here later."
        />
      </section>

      <section className="copy-grid">
        <div>
          <h2>The short version</h2>
          <p>{site.intro}</p>
          <p>
            The site is meant to lead with voice, publish often, and stay flexible. It is not a
            polished lifestyle brand and it is not a giant content machine. It is a place to write,
            document, argue, remember, plan, and keep moving.
          </p>
        </div>

        <div>
          <h2>What you will find here</h2>
          <ul className="plain-list">
            <li>Diary pieces about family life and the exploits of being an old dad.</li>
            <li>Life Education posts about learning, judgment, capability, and growing up.</li>
            <li>Music playlist posts tied to seasons, trips, moods, and memory.</li>
            <li>Slow Travel writing about the life being built and the road ahead.</li>
            <li>Advice posts that get more directly to the lesson or warning.</li>
          </ul>
        </div>
      </section>

      <section className="content-band content-band--muted">
        <div className="section-heading">
          <span className="eyebrow">working principle</span>
          <h2>Build the adventure while you are still in it.</h2>
          <p>
            This starter site keeps the visuals restrained and the publishing workflow simple so the
            focus stays on getting writing out into the world.
          </p>
        </div>
      </section>
    </div>
  );
}
