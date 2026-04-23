import type { BlogPost } from '../../postTypes';
import topSquare from './top-square.jpg';
import bandInline from './band-inline.jpg';

const post: BlogPost = {
  slug: 'journey-40-songs-and-a-time-machine',
  title: 'Journey: 40 Songs and a Time Machine',
  excerpt:
    'A Journey playlist turned into a map of memory, bad timing, school dances, and the Steve Perry years.',
  section: 'music-playlists',
  publishedAt: '2026-04-22',
  status: 'Recent',
  heroImage: topSquare,
  heroAlt: 'Black-and-white concert photo of Steve Perry singing onstage under spotlights.',
  cardImage: topSquare,
  cardAlt: 'Black-and-white concert photo of Steve Perry singing during Journey\'s classic era.',
  bodyHtml: `
    <p>Some bands are good. Some bands are important. And then there are bands that get wired so deeply into your life that making a playlist turns into an accidental memoir.</p>
    <p>Journey is one of those bands for me.</p>
    <figure class="post-figure">
      <img src="${bandInline}" alt="Black-and-white promotional photo of five Journey band members standing together on steps." />
      <figcaption>Journey in the era that still owns most of my memories of the band.</figcaption>
    </figure>
    <p>This started because Journey popped into my head and I put on <em>Evolution</em> from 1979. That led to the usual rabbit hole: one album became another, one song became five, and pretty soon I was not just listening. I was remembering.</p>
    <p>I figured I might find 25 or 30 Journey songs worth keeping. Thirty would have been a strong showing. Instead, I ended up with 40 songs I still genuinely love—more than two and a half hours of music that, for me, never really lost its punch.</p>
    <p>I am not going to rehash the history of Journey. That part is easy to find. What matters to me is where their music lived in my own life.</p>
    <p>Journey hit right as I was coming of age. They were everywhere in junior high and then all through high school, especially those first Steve Perry albums. By the time <em>Escape</em> came out, they were unavoidable in that huge, early-1980s-radio kind of way. After that, I liked each new album a little less, but I kept hanging on, partly out of loyalty and partly out of hope. Even when the newer stuff did not land the same way, the older songs never stopped feeling enormous.</p>
    <p>A lot of my memories have Journey playing in the background.</p>
    <p>In 1981, I played <em>Escape</em> while driving around with the first girl I ever really drove around. She picked <em>Infinity</em> and <em>Evolution</em> as our basement make-out soundtrack, which sounds more romantic than it ended up being. She eventually dumped me for being too slow, which was probably fair. Most of what I thought I knew about romance back then came secondhand from other teenage boys, which is a terrible way to learn anything.</p>
    <p>Journey also became part of the soundtrack to school dances and all the drama that came with them. I got dumped before homecoming for an older guy, then got rescued by friends who found me another date for the dance, which happened to be themed around “Open Arms.” By senior prom, “Faithfully” was one of the songs in the air, and then later in the car, and then in that whole stretch of life when a song can feel bigger than your actual circumstances.</p>
    <p>I saw Journey on the <em>Raised on Radio</em> tour in Indianapolis in 1986. For years, I remembered taking one girl. Later, after checking the timeline, I realized it had actually been someone else entirely—almost a year before I had even met the person I had folded into the memory. That bothered me more than it should have. But memory is like that. It does not just preserve things. It edits. It blends. It lies with total confidence.</p>
    <p>That may be part of why making this playlist hit me harder than I expected. It was not just a ranking project. It was a reminder that songs carry whole eras inside them. You think you are sorting tracks, but really you are sorting versions of yourself.</p>
    <p>This playlist also confirmed something I already knew: my Journey is the Steve Perry years. Nothing after that break makes my personal top 40, and not much from the album right before it either. That is not a knock on the later version of the band. It is just where the line falls for me. If somebody handed me a time machine and one ticket to any Journey show ever, I would not hesitate. I would go back to the Perry era.</p>
    <p>A few years ago, around the time Journey went into the Rock and Roll Hall of Fame, I got pulled into one of those pointless but irresistible online arguments about whether the later version of the band could really compare to the old one. I said no. Probably more bluntly than necessary. What surprised me was that Jonathan Cain liked the tweet. Since I had admired him going back through The Babys, Journey, and Bad English, that felt like a strange little moment of validation. I eventually backed out of the argument, but last time I checked, he still followed me. Small thing. Slightly ridiculous. Still kind of fun.</p>
    <p>Anyway, here’s the playlist.</p>
    <p>If you grew up with Journey, this may send you back.</p>
    <p>If you didn’t, this is still a hell of a place to start.</p>
    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/watch?v=BPazVAtD-xQ&list=PLJ-R3jWagtQi5xX7mTZadZ74lwbSgyfs_&pp=sAgC" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQi5xX7mTZadZ74lwbSgyfs_&si=kPfLLFYG5HhbjnNW" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
  `,
};

export default post;
