import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'the-constraint-system-that-will-pick-our-next-places',
  title: 'The Constraint System That Will Pick Our Next Places',
  excerpt:
    'A slow-travel plan only works if the places survive real constraints: weather, housing, safety, pacing, internet, visas, money, and kids.',
  section: 'slow-travel',
  publishedAt: '2026-06-20',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Sketch-style illustration of an older father and two children planning family travel around a table covered in maps, notebooks, and purple-accented travel notes.',
  cardImage,
  cardAlt:
    'Sketch-style illustration of an older father and two children studying a travel-planning board with maps, pins, ratings, and purple-accented marks.',
  bodyHtml: `
    <p>In <a href="/post/slow-travel-the-mission">the mission post</a> I said the plan: slow travel the world with my two youngest kids when I retire in about seven years.</p>

    <p>This post is how we'll decide where we actually go — so choosing the next place is a decision we can make fast, instead of a fight we have every time.</p>

    <p>We're building a constraint system. Not an itinerary. A filter.</p>

    <p>That's the point. A place can look perfect in the photos and fall apart in person. It's 97 degrees before lunch. The apartment has no laundry, so you're washing kid clothes in the sink. The internet drops every afternoon, right when school's supposed to happen. There's nowhere in walking distance for two kids to just be kids.</p>

    <p>None of that shows up in a listing.</p>

    <p>All of it shows up by day three.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Sketch-style conceptual illustration of an older father and two children using layered map filters for weather, safety, housing, internet, pacing, and family fit." loading="lazy" decoding="async" />
    </figure>

    <p>So when the system is built and we ask it the real question — &ldquo;give us twenty places that fit our family from May 1 to August 1&rdquo; — it won't hand back fantasy. It'll hand back places that might actually work.</p>

    <h2>How the Filter Works</h2>

    <p>Each category is its own short file. That way we can tune one without touching the rest.</p>

    <p>Every constraint has the same four parts:</p>

    <ul>
      <li><strong>Dealbreakers</strong> — hard filters that remove a place entirely.</li>
      <li><strong>Preferences</strong> — what we'd like, if we can get it.</li>
      <li><strong>Modes</strong> — most constraints score two ways: an overseas <em>base</em> where we settle into an apartment or house, and North America <em>camping</em> where we live out of a truck and trailer, a region at a time. A place can pass one and fail the other.</li>
      <li><strong>Overrides</strong> — for a special trip, a family reason, or a once-in-a-lifetime shot.</li>
    </ul>

    <p>The constraints are dials, not commandments. Too strict, we loosen them. Too loose, we tighten them. The whole thing is built to be tuned.</p>

    <h2>The First Five Constraints</h2>

    <p>These five cover the lived experience — the day-to-day question of whether a place works. Each one gets its own post later.</p>

    <ol>
      <li><strong>Weather</strong> — Temperature and season bands where we can actually live, plus rain, air quality, and heat limits. Separate profiles for a base versus camping.</li>
      <li><strong>Safety &amp; Family Fit</strong> — Physical safety, safety for a daughter specifically, how much independence a kid can have by around age 11, healthcare access, and whether the place feels normal for families.</li>
      <li><strong>Pacing &amp; Movement</strong> — The anti-burnout rules. Minimum base stays, limits on move-days, when a micro-move is fine, and how to catch the pace breaking us before it does.</li>
      <li><strong>Housing &amp; Neighborhood</strong> — What &ldquo;good enough&rdquo; means for a rental or a campsite. Kitchen, laundry, walkability, noise, and the red flags that kill a place on sight.</li>
      <li><strong>Connectivity &amp; Tech</strong> — Internet stable enough for video calls, a backup for when it isn't, reliable power, and the device stack that keeps school and safety running.</li>
    </ol>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Sketch-style illustration of an older father and two children standing between an overseas neighborhood and a North America camping setup with a truck and trailer." loading="lazy" decoding="async" />
    </figure>

    <h2>What Makes the Results Real</h2>

    <p>The first five tell us if we'd like living somewhere. These next six tell us if we can actually pull it off.</p>

    <ol start="6">
      <li><strong>Visa &amp; Legal</strong> — Entry rules, how long we can stay, registration requirements, and the Schengen math where it applies. The kids' documentation gets its own sub-section.</li>
      <li><strong>Budget &amp; Cost Tiers</strong> — Cheap, moderate, stretch. Simple bands so we can filter fast. The detailed money lives in its own project.</li>
      <li><strong>Education &amp; Learning</strong> — What a place needs to support the kids: activities, libraries, sports, other kids around, and enough routine to keep learning steady. Tracked through <a href="https://lifeeducation.org" target="_blank" rel="noreferrer">LifeEducation.org</a>.</li>
      <li><strong>Transport &amp; Logistics</strong> — Flight hubs, how much friction there is getting around overland, local transit, and whether moving every quarter is realistic.</li>
      <li><strong>Language &amp; Cultural Access</strong> — How much non-English friction we'll take, what immersion we're after, and what the kids need to handle on their own.</li>
      <li><strong>Social &amp; Community</strong> — How much isolation we can stand, access to other families, and whether we aim for slow-travel hubs or go further off the path.</li>
    </ol>

    <p>Later, when the hardware and health calls get real, we'll add documents and admin, health logistics, and the camping-rig systems. But this list is already enough to start producing serious shortlists.</p>

    <h2>Tell Me What We're Missing</h2>

    <p>If you've traveled long-term — especially with kids — and you can see a hole in this, send it through the <a href="/contact">contact page</a>.</p>

    <ul>
      <li>What category are we missing?</li>
      <li>What rule would've saved you real pain if you'd had it earlier?</li>
    </ul>

    <p>That's exactly the kind of thing I want to hear now, while it's still a document, before I'm standing in some airport with two tired kids finding out the hard way.</p>
  `,
};

export default post;
