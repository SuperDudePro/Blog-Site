import { site } from '../data/siteContent';

export function AboutPage() {
  return (
    <div className="page-wrap about-page">
      <section className="page-hero about-hero">
        <div>
          <span className="eyebrow">about</span>
          <h1>{site.title}</h1>
          <p className="lead">
            A running record of family life, memory, music, learning, mistakes, and the long attempt to build a bigger life before time runs out.
          </p>
          <p>
            This is not a brand deck and not a polished lifestyle pitch. It is a place to tell the truth while there is still time to get it down.
          </p>
        </div>

        <aside className="about-note" aria-label="About note">
          <span className="eyebrow">working idea</span>
          <h2>Tell the truth before nostalgia ruins it.</h2>
          <p>
            Some posts are stories. Some are playlists. Some are sharper pieces about parenting, judgment, learning, and what age changes.
          </p>
        </aside>
      </section>

      <section className="about-grid about-grid--three">
        <article className="about-card">
          <span className="eyebrow">diary</span>
          <h3>Scenes worth keeping</h3>
          <p>
            Family moments, remembered scenes, old stories, and the small things that end up mattering more than the big official ones.
          </p>
        </article>

        <article className="about-card">
          <span className="eyebrow">playlists</span>
          <h3>Music with a memory attached</h3>
          <p>
            Not just rankings and nostalgia bait. Songs tied to a year, a person, a place, a mood, or a version of life that still echoes.
          </p>
        </article>

        <article className="about-card">
          <span className="eyebrow">everything else</span>
          <h3>Learning, travel, advice, and the mess around them</h3>
          <p>
            Posts about capability, education, slow travel, parenting, judgment, and whatever keeps pushing its way into the record.
          </p>
        </article>
      </section>

      <section className="about-grid about-grid--two">
        <article className="about-card">
          <h2>What you will find here</h2>
          <ul className="plain-list">
            <li>Diary pieces with actual story weight.</li>
            <li>Playlist posts that connect songs to lived memory.</li>
            <li>Life Education writing about what is worth learning.</li>
            <li>Slow Travel notes about the life being built from here.</li>
            <li>Advice that gets to the point fast.</li>
          </ul>
        </article>

        <article className="about-card">
          <h2>What this is not</h2>
          <ul className="plain-list">
            <li>Not a productivity cult.</li>
            <li>Not sentimental mush for its own sake.</li>
            <li>Not fake wisdom dressed up as branding.</li>
            <li>Not a promise that everything gets neatly resolved.</li>
          </ul>
        </article>
      </section>

      <section className="content-band about-band">
        <div className="about-closing">
          <span className="eyebrow">bottom line</span>
          <h2>{site.footerNote}</h2>
          <p>
            The job here is simple: keep the record honest, keep the voice sharp, and leave behind something better than slogans.
          </p>
        </div>
      </section>
    </div>
  );
}
