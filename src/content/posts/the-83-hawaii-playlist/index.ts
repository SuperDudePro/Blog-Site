import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';

const post: BlogPost = {
  slug: 'the-83-hawaii-playlist',
  title: "The '83 Hawaii Playlist",
  excerpt: 'Forty-five songs from a 1983 senior-class trip to Honolulu. They still do not sound like 1983 to me. They sound like Hawaii.',
  section: 'music-playlists',
  publishedAt: '2026-07-12',
  status: 'Recent',
  heroImage,
  heroAlt: 'Teenagers gather in a 1983 Waikiki hotel nightclub beneath a disco ball, with the beach and Diamond Head visible outside.',
  cardImage,
  cardAlt: "A lively 1983 Waikiki nightclub scene beneath a sign reading The '83 Hawaii Playlist.",
  bodyHtml: `
    <p>In the spring of 1983, I flew to Honolulu with my senior class, a fake Kentucky driver's license, and a hundred dollars I'd soon hand to a stranger who looked like Spicoli. The full story is here: <a href="https://www.ourolddad.com/post/my-friends-had-oregano" target="_blank" rel="noreferrer"><em>My Friends Had Oregano</em></a>.</p>

    <p>This is what that week sounded like.</p>

    <p>Our hotel had a downstairs club that played music every night, and we spent most of the trip in there trying to figure out what people did in a nightclub. We never did figure it out. But the songs stuck. Forty-five of them — "Come On Eileen," "Electric Avenue," "Hungry Like the Wolf," "Total Eclipse of the Heart," "Rock the Casbah" — exactly what was pouring out of every speaker in the spring of 1983.</p>

    <p>Forty-three years later, they still don't sound like 1983 to me. They sound like Honolulu.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A cassette case labeled The '83 Hawaii Playlist sits beside tropical drinks overlooking Waikiki at night." loading="lazy" decoding="async" />
    </figure>

    <div class="post-links">
      <a class="button button--primary" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQiFwZyqZyDIU08fiJGYNz6r" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
      <a class="button button--ghost" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQiFwZyqZyDIU08fiJGYNz6r" target="_blank" rel="noreferrer">Listen on YouTube</a>
    </div>
  `,
};

export default post;
