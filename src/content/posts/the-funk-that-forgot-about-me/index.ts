import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'the-funk-that-forgot-about-me',
  title: 'The Funk That Forgot About Me',
  excerpt:
    'Teachers know this funk, even when they pretend they don’t. A field guide to twenty years of end-of-winter-break dread, the avoidance hobbies that came with it, and the year I learned more about Desi Arnaz than any reasonable person should.',
  section: 'diary',
  publishedAt: '2026-05-10',
  modifiedAt: '2026-07-28',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Charcoal sketch of an older teacher at a late-night desk studying vintage television history instead of preparing for Monday.',
  cardImage,
  cardAlt:
    'Charcoal sketch of a teacher avoiding Monday through a late-night vintage television rabbit hole.',
  bodyHtml: `
    <p>Teachers know this funk, even when they pretend they don&rsquo;t.</p>

    <p>It clocks in around day three of winter break. Day five, you exhale. Day seven, you remember what you used to be like before the school year started chewing on you. Day eight, you realize you have to go back, and a small, dignified panic sets up shop in the chest. Some have rebranded it as &ldquo;back-to-work energy&rdquo; or &ldquo;Sunday scaries&rdquo; or, in the worst cases, gratitude. The pattern is the same.</p>

    <p>I had this for about twenty years. The teacher version is its own animal &mdash; longer break, deeper exhale, harder return. By the night before, I&rsquo;d be up at one in the morning convinced that this was the year I wouldn&rsquo;t make it back to the building.</p>

    <p>I made it back to the building every time.</p>

    <p>The funk wasn&rsquo;t about hating the job. I&rsquo;ve had other jobs. None of them produced this. Something about the long break &mdash; the time off, the slowing down, the accidental glimpse of what life would feel like if I weren&rsquo;t gearing up to face a room of teenagers &mdash; gave the dread a window.</p>

    <p>So I&rsquo;d avoid the dread. That was the actual hobby.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Charcoal sketch of a peaceful winter break gradually giving way to the approaching school week." loading="lazy" decoding="async" />
    </figure>

    <p>I had moves.</p>

    <p>The big one was Facebook. I&rsquo;d come back to it once a year, around this time, like a salmon returning to a polluted stream. I never announced leaving Facebook, never closed the account, never unfollowed anyone for having the wrong opinions. I kept it as a memory graveyard. Living museum. Annual archaeology site. I&rsquo;d open it on a Sunday afternoon of the last week, tell myself I was just going to check on a few people, and surface six hours later having reconstructed someone&rsquo;s divorce from public photos and comment threads.</p>

    <p>One year I spent most of a day piecing together what had happened to an old friend&rsquo;s family. Not because I cared enough to call. Because I&rsquo;d seen something on a wall and decided I needed to understand it. Another year I went looking for a guy I used to know who had lost custody and gone off the grid. I didn&rsquo;t find him. I spent hours looking, which was the point.</p>

    <p>The point was always the hours, not the answer.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Charcoal sketch of a teacher conducting an archaeological excavation through years of old social-media memories." loading="lazy" decoding="async" />
    </figure>

    <p>The most honest version of this happened the year I went into a forty-eight-hour Lucille Ball spiral.</p>

    <p>Not just the show. I had already given Lucy plenty of life &mdash; first runs, syndication, stoned cable evenings, the whole catalog. This was behind the scenes. Production fights. Marriage timelines. Network politics from 1953. By Sunday evening I knew things about Desi Arnaz I had no use for. Things I still know. Things that are, right now, in my brain, taking up space that could have gone to my children&rsquo;s birthdays. Trapped in there, waiting to be inserted into a conversation that didn&rsquo;t ask for an obscure Lucille Ball reference.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Charcoal sketch of a teacher disappearing into a whirlwind of vintage television history and studio records." loading="lazy" decoding="async" />
    </figure>

    <p>That&rsquo;s the actual texture of teacher dread. It&rsquo;s not heroic. It&rsquo;s not even tragic. It&rsquo;s a guy in his fifties learning Desilu corporate history because his brain has decided that anything is better than thinking about Monday.</p>

    <p>I could feel it happening. That was the worst part. I&rsquo;d watch myself become a lump of nothingness, completely aware that I was running an avoidance program, and still completely unable to close the tab.</p>

    <p>The funk was real. The Lucille Ball thing was real. The hours disappeared into both, and the dread waited it out, and Monday came anyway.</p>

    <p>It mostly doesn&rsquo;t happen to me anymore.</p>

    <p>I&rsquo;d love to claim some hard-won wisdom for that, but the real reason is dumber: I stopped being scared of not being good enough at the job. Somewhere along the way I noticed that even on my worst day, I&rsquo;m a fine teacher. Top half. Being humble about it. The imposter-syndrome version of me &mdash; the one running the funk &mdash; was working from a story that wasn&rsquo;t true. Once the story stopped, the funk lost its grip.</p>

    <p>It still pokes its head in. End of break, last weekend, that thinning of the air in the lungs. But it doesn&rsquo;t unpack the suitcase anymore. It looks around, sees that nobody&rsquo;s panicking, and leaves.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Charcoal sketch of the old back-to-school funk arriving with a suitcase, finding a calm teacher, and quietly leaving." loading="lazy" decoding="async" />
    </figure>

    <p>I still think the funk is part of the job. Some rename it. Some muscle through. Some pretend gratitude fixes it. For me, for a while, it took the shape of Desi Arnaz.</p>

    <p>I could do worse.</p>

    <p>Do you get your own end-of-break funk—or have you ever disappeared into an absurdly specific rabbit hole to avoid thinking about Monday? <a href="https://ourolddad.com/contact">Let us know through the contact page.</a></p>
  `,
};

export default post;
