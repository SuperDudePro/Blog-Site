import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'the-83-hawaii-playlist',
  title: 'The ’83 Hawaii Playlist',
  excerpt: 'Forty-five songs from a 1983 senior-class trip to Honolulu. They still do not sound like 1983 to me. They sound like Hawaii.',
  section: 'music-playlists',
  publishedAt: '2026-07-12',
  status: 'Recent',
  heroImage,
  heroAlt: 'OOD Playlists banner for The ’83 Hawaii Playlist with the bearded skull mascot, Waikiki imagery, records, and cassette art.',
  cardImage,
  cardAlt: 'Teenagers gather beneath a disco ball in a 1983 Waikiki hotel club with Diamond Head visible beyond the windows.',
  bodyHtml: `
    <div class="post-center">
      <strong>OOD PLAYLISTS</strong><br>
      <strong>The ’83 Hawaii Playlist</strong><br>
      <em>Forty-five songs. One senior trip. Honolulu forever.</em><br>
      45 SONGS | HONOLULU | SPRING 1983
    </div>

    <p>OOD Playlists is where the songs get gathered by year, artist, mood, place, memory, or whatever else makes them belong together. The list matters, but the reason for the list is the post.</p>

    <p>In the spring of 1983, I flew to Honolulu with my senior class, a fake Kentucky driver's license, and a hundred dollars I'd soon hand to a stranger who looked like Spicoli. The full story is here: <a href="https://ourolddad.com/post/my-friends-had-oregano" target="_blank" rel="noreferrer"><em>My Friends Had Oregano</em></a>.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A teenage traveler in bright tropical clothes waits at a 1983 airport gate for a flight to Honolulu." loading="lazy" decoding="async" />
    </figure>

    <p>This is what that week sounded like.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A teenager wearing headphones listens to a portable cassette player in a Waikiki hotel room overlooking Honolulu." loading="lazy" decoding="async" />
    </figure>

    <p>Our hotel had a downstairs club that played music every night, and we spent most of the trip in there trying to figure out what people did in a nightclub. We never did figure it out. But the songs stuck. Forty-five of them — "Come On Eileen," "Electric Avenue," "Hungry Like the Wolf," "Total Eclipse of the Heart," "Rock the Casbah" — exactly what was pouring out of every speaker in the spring of 1983.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="High-school seniors crowd a Waikiki hotel nightclub beneath a disco ball during a spring 1983 class trip." loading="lazy" decoding="async" />
    </figure>

    <p>Forty-three years later, they still don't sound like 1983 to me. They sound like Honolulu.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="An empty Waikiki hotel club overlooks Honolulu at night with headphones and a cassette left beside an open window." loading="lazy" decoding="async" />
    </figure>

    <div class="post-links">
      <a class="button button--primary" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQiFwZyqZyDIU08fiJGYNz6r" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
      <a class="button button--ghost" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQiFwZyqZyDIU08fiJGYNz6r" target="_blank" rel="noreferrer">Listen on YouTube</a>
    </div>

    <p>What songs still sound like a place you haven't been in decades?</p>

    <div class="post-links">
      <a class="button button--ghost" href="/contact">Tell me through the Our Old Dad contact page</a>
    </div>
  `,
};

export default post;
