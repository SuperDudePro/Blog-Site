import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: "stevie-wonder-the-great-songs",
  title: "Stevie Wonder: The Great Songs",
  excerpt: "Stevie Wonder changed the way I heard music. Now I have 54 favorite songs and four more to cut from the playlist.",
  section: "music-playlists",
  publishedAt: "2026-11-26",
  status: "Recent",
  heroImage,
  heroAlt: "Black, cream, gold and purple OOD Playlists banner with a bearded skull mascot and the original 55-song, five-cut challenge.",
  cardImage,
  cardAlt: "Charcoal portrait of Stevie Wonder smiling as he sings into a microphone, with purple accents on his embroidered jacket.",
  bodyHtml: `
    <div class="post-center"><strong>OOD PLAYLISTS | 54 SONGS | FOUR HAVE TO GO</strong></div>

    <p>When <em>Songs in the Key of Life</em> came out, it seemed like Stevie Wonder was on the radio nonstop.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Vintage radio on a wooden tabletop beside records and a purple lava lamp." loading="lazy" decoding="async" />
    </figure>

    <p>I wanted to hear some of his other music, so I picked up a cassette of <em>Innervisions</em>. That album blew my mind. It was one of those albums that changed my ideas about music and what music could be.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A shaggy-haired teenager listens to a cassette player through headphones in a seventies bedroom." loading="lazy" decoding="async" />
    </figure>

    <p>It's difficult to explain to anyone who didn't grow up with cassettes and 8-tracks just how much of a pain in the ass listening to music could be. Trying to find a particular song on a cassette meant fast-forwarding, stopping, listening, rewinding a little, and repeating the process until you found it. With 8-tracks, you couldn't even rewind. The tape was divided into four programs, and if a song happened to run across the end of one program, the damn thing would stop in the middle of the song, make a loud mechanical click as it switched to the next program, and then pick up where it left off.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A teenager leans over a cassette player and an eight-track deck in frustration." loading="lazy" decoding="async" />
    </figure>

    <p>Now I can sit here with virtually everything Stevie Wonder has ever recorded at my fingertips, put together a collection of my favorite songs, and listen to them in whatever order I want. As much as I love the music of that era, I wouldn't go back to the way we had to listen to it.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="A smartphone displaying a music playlist beside old cassettes and an eight-track cartridge." loading="lazy" decoding="async" />
    </figure>

    <p>I started out with 87 Stevie Wonder songs and managed to get the list down to 46. Then I went back to see if there was anything I'd overlooked and ended up adding nine more. Seven of the nine songs on <em>Innervisions</em> made that 55-song list, which probably tells you how much I still love that album. I've managed to get rid of one more since then, so now I'm at 54, and I'm trying to get it down to 50.</p>

    <p>Here's where I could use some help. Listen to the list and tell me which four songs you'd cut. And if there's a great Stevie Wonder song that I've somehow managed to leave off, <a href="https://ourolddad.com/contact">let me know through the contact page</a>. Of course, that just means I'll have to get rid of five.</p>

    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/playlist?list=PLe9vndU6dOhQ" target="_blank" rel="noreferrer">Watch on YouTube</a>
    </div>
  `,
};

export default post;
