import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'a-room-from-1983',
  title: 'A Room From 1983',
  excerpt:
    'The five years I spent at Purdue still take up more room in my head than decades that came after. A small dorm room, a TA who blew my tiny mind, and a memory I am no longer sure I can trust.',
  section: 'diary',
  publishedAt: '2026-05-10',
  status: 'Recent',
  heroImage,
  heroAlt: 'An older man seen from behind facing an oversized doorway into a cluttered college dorm room that dominates the wide scene.',
  cardImage,
  cardAlt: 'A cramped 1983 dorm room arranged like a memory box, with a loft bed, clothes hanging from nails, a sleeping bag and a leopard-print chair.',
  bodyHtml: `
    <p>The five years I spent at Purdue still take up more room in my head than decades that came after. By a lot.</p>

    <p>Not because I remember more. I remember almost nothing. Most of my classes are gone. Most of the people are gone. Whole semesters are a blur. But the era takes up space anyway. It feels heavy. It feels formative. It feels like it mattered.</p>

    <p>It was drunk camp.</p>

    <p>That&rsquo;s most of what it was. I had a disastrous academic career by any normal measure. Five years to do four years of work, and I wouldn&rsquo;t say I came out the other end with much to show for it on paper.</p>

    <p>This is my freshman dorm room at Cary Quad, the oldest, all-male dorm at Purdue. The bed is a loft because that was the move at Cary then &mdash; build the bed up, put the couch and the desk underneath, claim the cubic feet. Mine is unmade. The clothes on the wall are hung on nails. There&rsquo;s a leopard-print chair I don&rsquo;t remember owning. There&rsquo;s a sleeping bag on the floor that may or may not have someone in it. I genuinely can&rsquo;t tell from the photo.</p>

    <p>That&rsquo;s the room. That&rsquo;s the era.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Inside a chaotic freshman dorm room with a wooden loft bed, clothes hanging from nails, a buried desk, a leopard-print chair and an ambiguous sleeping bag on the floor." loading="lazy" decoding="async" />
    </figure>

    <p>Looks dignified from up there. It wasn&rsquo;t. We threw a lot of things off that roof.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Students safely behind a brick rooftop parapet toss harmless pieces of dorm-room junk into the air above an orderly college courtyard." loading="lazy" decoding="async" />
    </figure>

    <p>And I couldn&rsquo;t wait to get out of it. Not toward anything cleaner &mdash; toward something worse. I moved into a fraternity the next year that was, by every visible measure, a step down in hygiene and a step up in chaos. That was the trajectory I was on, and I was excited about it.</p>

    <p>Yet that little room sits in my head like something important. That&rsquo;s the part I want to write about.</p>

    <p>Before I fell into most of the bad patterns that defined the next few years, I signed up for a one-credit add-on class run by the psych 101 TAs. I assume they used us for unethical experiments all semester. I don&rsquo;t remember any of them.</p>

    <p>I remember exactly one day.</p>

    <p>The topic was intuition versus coincidence. Premonition, telepathy, that whole drawer. The TA wanted volunteers.</p>

    <p>I never volunteered. I almost certainly hadn&rsquo;t done the reading. My standard move was to go quiet and hope eye contact didn&rsquo;t find me. But I had a fresh story I thought was a banger, and for once, raising my hand wasn&rsquo;t going to expose me. It was going to make me look like I belonged there. So up went the hand.</p>

    <p>A few weeks earlier, back in my hometown for a weekend, I&rsquo;d been driving around and couldn&rsquo;t get a particular high school math teacher out of my head. Senior year teacher. No reason for her to be on my mind. Then, sitting at a left turn, I watched her drive past me going the other direction.</p>

    <p>That was it. That was the whole story. I told it like it was proof of something.</p>

    <p>The TA listened. Then he asked me to consider, calmly, all the times I&rsquo;d been thinking about someone &mdash; even intensely &mdash; and the person didn&rsquo;t drive past me in a car going the opposite direction.</p>

    <p>He blew my tiny mind.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A student raises his hand while a teaching assistant contrasts a few vivid marks with many faint overlooked marks on a classroom chalkboard." loading="lazy" decoding="async" />
    </figure>

    <p>I had never thought about it that way. Not once. I had a whole filing cabinet of times my brain landed on someone right before something happened, and zero filing cabinet of times it landed on someone and nothing happened, because nothing happening doesn&rsquo;t get filed. The hits are vivid. The misses don&rsquo;t exist. So the hits look like signal, when really they&rsquo;re just the few moments my pattern-matcher accidentally lined up with the world.</p>

    <p>That was probably the most useful thing I learned in five years of college. From a TA. In a one-credit add-on class. About a story I raised my hand to tell because I didn&rsquo;t have anything else.</p>

    <p>Here&rsquo;s the part I didn&rsquo;t see coming.</p>

    <p>Forty-something years later, sitting down to write this, I realized I&rsquo;m not sure it was even her.</p>

    <p>I was sure at the time. Sure enough to tell the story in front of a classroom. Sure enough to carry it for four decades as one of those personal proofs that the universe occasionally winks at you. But when I actually try to picture her face in that car, in that intersection, going the other direction &mdash; I can&rsquo;t. I have a feeling. I have a story. I don&rsquo;t have a face.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Two cars pass at an intersection while the remembered driver&rsquo;s profile dissolves into erased charcoal and unfinished paper." loading="lazy" decoding="async" />
    </figure>

    <p>So now the memory has three layers of failure stacked on it.</p>

    <p>The TA was right that the original feeling was probably nothing. Memory is right that I can&rsquo;t even confirm the inciting moment. And the part of me that held onto the story for forty years was running on fumes the whole time, polishing a thing that may not have happened to make a point that wasn&rsquo;t there.</p>

    <p>That&rsquo;s drunk camp in a sentence.</p>

    <p>It takes up more space than it earned. Whole stretches where I became a father somehow feel thinner by comparison. The five years where I made the most mistakes per capita is the five years I most easily call up.</p>

    <p>I don&rsquo;t think this is just me. I think memory has a bias toward the years when you were figuring out who you were, even if who you were turned out to be a guy with a leopard chair and a story about a math teacher.</p>

    <p>I&rsquo;d rather know that than not. The TA did me a favor. So did this old photo. So did writing it down and noticing what disappeared while I wasn&rsquo;t looking.</p>

    <p>The Purdue years are still louder than they should be. I don&rsquo;t think I can fix that, and I don&rsquo;t know that I want to. But I&rsquo;d like to notice the time I&rsquo;m in while I&rsquo;m still in it. That&rsquo;s the thing I keep missing.</p>
  `,
};

export default post;
