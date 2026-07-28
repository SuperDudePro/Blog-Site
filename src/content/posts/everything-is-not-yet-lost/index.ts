import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'everything-is-not-yet-lost',
  title: 'Everything Is Not Yet Lost',
  excerpt: 'A quote found on a messy desk becomes a way to interrupt the grievance reflex and return to the person in front of me.',
  section: 'diary',
  publishedAt: '2026-06-17',
  modifiedAt: '2026-07-28',
  status: 'Recent',
  heroImage,
  heroAlt: 'Hand-drawn charcoal and pencil sketch of a messy desk with a note that reads Everything is not yet lost.',
  cardImage,
  cardAlt: 'A handwritten note reading Everything is not yet lost among papers on a messy desk.',
  bodyHtml: `

    <p>I was cleaning off my desk and found a quote I'd saved years ago, from the Will Ferrell movie <em>Everything Must Go.</em></p>

    <blockquote>
      <p>“Everything is not yet lost.”</p>
    </blockquote>

    <p>In the film it means pretty much what it sounds like. Keep walking. Keep trying. Things are bad, but they're not done. If you haven't seen it, watch it — it's not the Will Ferrell you're expecting.</p>

    <p>I think I held onto that line because it does something I need more than I'd like to admit. It picks a way to read the situation. Not a true reading or a false one. A chosen one.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A hand using a purple pencil to choose one framing of the same cluttered everyday scene." loading="lazy" decoding="async" />
    </figure>

    <p>That's the part that's hard to face. It's easy to spot in other people. I never have to look far to find the clearest case, though. It's me. Once it really lands — that it's 100% on me how I read whatever's in front of me — the excuses run out. There's nobody left to deal with but myself, and all the petty faults I showed up with.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An anonymous adult facing their reflection while grievance-filled papers collect around the mirror." loading="lazy" decoding="async" />
    </figure>

    <p>So here's what I do — and more and more, what I do with my kids and my students too. When somebody starts in on how bad things are — and I'm usually first in line — I make them picture how much worse it could be. Not in a vague way. Specifically. How many ways. How much worse.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A figure briefly looking down branching sketches of worse possibilities while a purple line leads back." loading="lazy" decoding="async" />
    </figure>

    <p>It never takes me long to shut up about how hard I've got it.</p>

    <p>But the shutting-up isn't the point. The point is where it drops me. I look up from all the worse versions — the ones that could've been happening to me, and to them, and aren't — and I'm just glad it isn't worse. The person in front of me is still right there, and I can see them again now, instead of whatever I was carrying a second ago.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Two people seeing each other across a cluttered table after a dark tangle has been pushed aside." loading="lazy" decoding="async" />
    </figure>

    <p>I've gotten faster at it over the years. I don't climb down into the bad version and stew. I give myself a peek, and then I come back — to right now, to where I actually am.</p>

    <p>My desk is still a mess. But it was clean enough today to let me find that quote.</p>

    <p>What do you do when your brain starts building a case for how bad you've got it? <a href="https://ourolddad.com/contact">Let us know through the contact page.</a></p>
  `,
};

export default post;
