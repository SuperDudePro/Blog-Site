import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: '2000-or-so-things',
  title: '2000 or So Things',
  excerpt: 'A giant, living playlist for my kids: songs that still move me, a lot of overlooked favorites, and one instruction—hit shuffle.',
  seoTitle: '2000 or So Things: A Living Playlist for the Kids',
  seoDescription: 'A living playlist for the kids: the songs I still love, the ones that hold up, and why this giant collection is meant to be played on shuffle.',
  section: 'music-playlists',
  publishedAt: '2026-10-25',
  status: 'Recent',
  heroImage,
  heroAlt: 'Black, cream, gold, and neon-purple OOD Playlists poster with the bearded skull mascot, records, and the title 2000 or So Things.',
  cardImage,
  cardAlt: 'Charcoal sketch of worn headphones beside a music player displaying a purple shuffle icon.',
  bodyHtml: `
    <div class="post-center">
      <strong>OOD PLAYLISTS</strong><br>
      <strong>2000 or So Things</strong><br>
      <em>For the Dudes. Don't say I never taught you anything.</em><br>
      LIVING PLAYLIST | SHUFFLE RECOMMENDED
    </div>
    <p>OOD Playlists is where the songs get gathered by year, artist, mood, place, memory, or whatever else makes them belong together. The list matters, but the reason for the list is the post.</p>
    <p>I've been putting together a giant playlist for the kids. Just songs that move me in some way, that I've loved over the years, and that I think they ought to have a chance to hear.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A hand browsing a crowded wooden crate of vinyl records, selecting a sleeve with a purple accent." loading="lazy" decoding="async" />
    </figure>
    <p>The idea is for them to throw it on shuffle at random times in their lives and get a whole lot of sonic goodness. I use it myself when I just want to hear something that doesn't suck and isn't all the same. There's no order to it, and trying to put one together would probably make it worse.</p>
    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An unsorted spread of vinyl records, cassette tapes, and CDs across a tabletop, with a purple glint on a record." loading="lazy" decoding="async" />
    </figure>
    <p>The criteria are pretty simple. If a song comes on and I'm still happy to hear it, even after a hundred listens, it belongs. It has to have aged well for me. I don't care whether it's considered great music or whether anyone else likes it.</p>
    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A well-used turntable playing a record with the stylus in the groove and a faint purple highlight." loading="lazy" decoding="async" />
    </figure>
    <p>It's a living list, too. Sometimes a song comes on and rubs me the wrong way, or my taste has changed enough that I'm embarrassed I ever included it. So I take it off. Meanwhile, I've been using AI to help me remember old favorites I overlooked, and it turns out I've forgotten a shitload of songs I would've included.</p>
    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="An untidy handwritten playlist with crossed-out and added entries, a pencil, a cassette, and a record." loading="lazy" decoding="async" />
    </figure>
    <p>I originally called it <em>1000 or So Things</em>. Now I'm aiming somewhere around 2,000, but who knows? It keeps growing, and there's no particular reason to stop.</p>
    <p>So, Dudes, hit shuffle once in a while. You'll probably find something you love. You'll probably find some stuff you think is terrible, too.</p>
    <p>Don't say I never taught you anything.</p>
    <p><strong>What's a song you never get sick of hearing?</strong> <a href="https://ourolddad.com/contact">Let me know through the contact page.</a></p>
    <div class="post-links">
      <a class="button button--primary" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQgJa5vKNuLmjL4wUJymvL6r&si=W-Wu-jabIUlHqqif" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
      <a class="button button--ghost" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQgJa5vKNuLmjL4wUJymvL6r" target="_blank" rel="noreferrer">Watch on YouTube</a>
    </div>
  `,
};

export default post;
