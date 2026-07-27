import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'journey-40-songs-and-a-time-machine',
  title: 'Journey: 40 Songs and a Time Machine',
  excerpt:
    'A Journey playlist turned into a map of memory, bad timing, school dances, and the Steve Perry years.',
  section: 'music-playlists',
  publishedAt: '2026-04-22',
  status: 'Recent',
  heroImage,
  heroAlt: 'Black, cream, neon-gold, and neon-purple OOD Playlists banner for Journey: 40 Songs and a Time Machine, with the bearded skull mascot, a record, and waveform ornaments.',
  cardImage,
  cardAlt: 'Pencil-sketch portrait of Steve Perry singing onstage beneath bright spotlights, with sparse purple accents and a crowd suggested below.',
  bodyHtml: `
    <div class="post-center">
      <strong>OOD PLAYLISTS</strong><br>
      <strong>Journey: 40 Songs and a Time Machine</strong><br>
      <em>Forty tracks from the Steve Perry years—and all the school dances, bad timing, nighttime drives, and unreliable memories attached to them.</em><br>
      40 TRACKS | ARTIST &amp; MEMORY PLAYLIST
    </div>
    <p>OOD Playlists is where the songs get gathered by year, artist, mood, place, memory, or whatever else makes them belong together. The list matters, but the reason for the list is the post.</p>
    <p>This one started with <em>Evolution</em> and turned into 40 Journey songs—more than two and a half hours, almost all of it from the Steve Perry years. I thought I was making a playlist. What I actually made was a map of junior high, high school, girls, dances, cars, bad timing, and one concert memory I’d apparently been editing for years.</p>
    <p>The YouTube and YouTube Music versions are linked at the bottom. The songs are the playlist. Everything attached to them is why these 40 survived.</p>
    <p>I’m not going to rehash the history of Journey. That part is easy to find. What matters to me is where their music lived in my own life.</p>
    <p>Journey hit right as I was coming of age. They were everywhere in junior high and then all through high school, especially those first Steve Perry albums. By the time <em>Escape</em> came out, they were unavoidable in that huge, early-1980s-radio kind of way. After that, I liked each new album a little less, but I kept hanging on, partly out of loyalty and partly out of hope. Even when the newer stuff didn’t land the same way, the older songs never stopped feeling enormous.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Pencil-sketch group portrait of five Journey band members from the classic Steve Perry era, with restrained purple accents." loading="lazy" decoding="async" />
      <figcaption>Journey in the era that still owns most of my memories of the band.</figcaption>
    </figure>
    <p>A lot of my memories have Journey playing in the background. In 1981, I played <em>Escape</em> while driving around with the first girl I ever really drove around. She picked <em>Infinity</em> and <em>Evolution</em> as our basement make-out soundtrack, which sounds more romantic than it ended up being. She eventually dumped me for being too slow, which was probably fair. Most of what I thought I knew about romance back then came secondhand from other teenage boys, which is a terrible way to learn anything.</p>
    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Pencil-sketch view from inside a car at night, with a young couple in the front seats and softly glowing dashboard lights." loading="lazy" decoding="async" />
    </figure>
    <p>Journey also became part of the soundtrack to school dances and all the drama that came with them. I got dumped before homecoming for an older guy, then got rescued by friends who found me another date for the dance, which happened to be themed around “Open Arms.” By senior prom, “Faithfully” was one of the songs in the air, and then later in the car, and then in that whole stretch of life when a song can feel bigger than your actual circumstances.</p>
    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Pencil-sketch scene of a young couple slow dancing at a school dance beneath a disco ball, with other couples blurred behind them." loading="lazy" decoding="async" />
    </figure>
    <p>I saw Journey on the <em>Raised on Radio</em> tour in Indianapolis in 1986. For years, I remembered taking one girl. Later, after checking the timeline, I realized it had actually been someone else entirely—almost a year before I had even met the person I had folded into the memory. That bothered me more than it should have. But memory is like that. It doesn’t just preserve things. It edits. It blends. It lies with total confidence.</p>
    <p>That may be part of why making this playlist hit me harder than I expected. It wasn’t just a ranking project. It was a reminder that songs carry whole eras inside them. You think you are sorting tracks, but really you are sorting versions of yourself.</p>
    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Bright pencil-sketch view of older hands arranging four memory cards showing a nighttime drive, school dance, concert, and turntable, with sparse purple accents." loading="lazy" decoding="async" />
    </figure>
    <p>This playlist also confirmed something I already knew: my Journey is the Steve Perry years. Nothing after that break makes my personal top 40, and not much from the album right before it either. That isn’t a knock on the later version of the band. It’s just where the line falls for me. If somebody handed me a time machine and one ticket to any Journey show ever, I wouldn’t hesitate. I’d go back to the Perry era.</p>
    <p>A few years ago, around the time Journey went into the Rock and Roll Hall of Fame, I got pulled into one of those pointless but irresistible online arguments about whether the later version of the band could really compare to the old one. I said no. Probably more bluntly than necessary. What surprised me was that Jonathan Cain liked the tweet. Since I had admired him going back through The Babys, Journey, and Bad English, that felt like a strange little moment of validation. I eventually backed out of the argument, but last time I checked, he still followed me. Small thing. Slightly ridiculous. Still kind of fun.</p>
    <p>Anyway, here’s the playlist. If you grew up with Journey, it may send you back. If you didn’t, it’s still a hell of a place to start.</p>
    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/watch?v=BPazVAtD-xQ&list=PLJ-R3jWagtQi5xX7mTZadZ74lwbSgyfs_&pp=sAgC" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQi5xX7mTZadZ74lwbSgyfs_&si=kPfLLFYG5HhbjnNW" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
    <p>What did I miss? What belongs on your version of this playlist, and what would you throw off mine? <a href="/contact">Use the contact page</a> and tell me.</p>
  `,
};

export default post;
