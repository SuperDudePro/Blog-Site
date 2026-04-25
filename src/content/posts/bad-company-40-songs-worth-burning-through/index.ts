import type { BlogPost } from '../../postTypes';
import topSquare from './top-square.jpg';
import bandInline from './band-inline.jpg';

const post: BlogPost = {
  slug: 'bad-company-40-songs-worth-burning-through',
  title: 'Bad Company: 40 Songs Worth Burning Through',
  excerpt:
    'A Bad Company playlist brought back eighth-grade graduation money, a record-store splurge, and a band that still hits harder than I remember.',
  section: 'music-playlists',
  publishedAt: '2026-04-23',
  status: 'Featured',
  heroImage: topSquare,
  heroAlt: 'Square image of the Bad Company album Desolation Angels with band autographs across the cover.',
  cardImage: topSquare,
  cardAlt: 'Bad Company Desolation Angels album cover with signatures across it.',
  bodyHtml: `
    <p>Saturday morning, Bad Company’s “Early in the Morning” came on my mix, and that was it. Whenever I hear that song, I fall into a trance and start playing it on repeat until I get my fix.</p>
    <p>After that, I did what these songs usually make me do: I started running through Bad Company’s albums, all the way through their sixth one, <em>Rough Diamonds</em>. Even though I know their catalog pretty well, I still manage to underestimate how much that music can move me and how solid those early albums sound from front to back.</p>
    <figure class="post-figure">
      <img src="${bandInline}" alt="Black-and-white live photo of Bad Company performing to a massive outdoor crowd, seen from behind the drummer." />
      <figcaption>The kind of live shot that reminds you how big this band could feel.</figcaption>
    </figure>
    <p><em>Desolation Angels</em> came out in March 1979, right at the end of eighth grade for me. I had already heard plenty of Bad Company on AM and FM radio before then, but I still had not bought one of their albums for myself. Then I heard “Rock ’n’ Roll Fantasy,” got mesmerized, bought the album, and nearly wore it out.</p>
    <p>A couple of months later, I came into what felt like a small fortune at my eighth-grade graduation party: cash, checks, and savings bonds. Back then, giving savings bonds to kids was a pretty standard way for adults to nudge us toward the future and whatever responsible expenses were supposedly waiting there. I am pretty sure none of my savings bonds from either eighth grade or high school lasted more than a few months. I usually cashed them early, ate the penalty, and felt a little guilty about it. Still do, a little.</p>
    <p>This time around, I took about $200 of my future to the record store and blew it on albums.</p>
    <p>Until now, that memory had always felt purely joyful. Then I looked up what $200 in 1979 would be worth today, and Google told me it comes out to about $748. That hit differently. If one of my kids burned through almost $800 on Robux or something equally questionable, I would lose my mind. Apparently my bad money habits did not begin recently.</p>
    <p>Still, I cannot pretend I regret the music.</p>
    <p>Among the 30 or 40 albums I bought in that glorious spree were <em>Straight Shooter</em>, <em>Run with the Pack</em>, and <em>Burnin’ Sky</em>, the three Bad Company albums that came before <em>Desolation Angels</em>. Those records, along with the self-titled debut and <em>Desolation Angels</em>, make up the version of Bad Company that matters most to me. That run is ridiculously strong.</p>
    <p>Then came <em>Rough Diamonds</em> in 1982, around my junior year of high school. It was fine. Not bad, exactly. But after five great albums, “fine” felt like a major letdown. When Paul Rodgers left after that, Bad Company stopped feeling like Bad Company to me. I never really got pulled back in, even when the band found some success again in the mid-to-late 1980s.</p>
    <p>As with my Journey playlist, I guessed I would find about 30 songs worth keeping. Instead, I found 46 and had to cut them down to an even 40. The first three albums made the playlist in full, which tells you a lot right there.</p>
    <p>I sequenced this one the same way I did the Journey playlist: chronological by album, then by track order within each album. That feels right to me for a band like this. But I have mostly listened to it on shuffle, and it works that way too.</p>
    <p>The main thing I rediscovered is that Bad Company’s early run is even better than I tend to remember. Every time I go back, I think I am just revisiting a band I have always liked. Then a song grabs me by the collar, and suddenly I remember: no, this was never casual. This was a band I lived with.</p>
    <p>Anyway, here’s the playlist.</p>
    <p>If you already love Bad Company, you probably won’t need much convincing.</p>
    <p>If you only know a few songs, this is a very good place to start.</p>
    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/watch?v=LHQ5d6IRaFo&list=PLJ-R3jWagtQivuRNWYOqR38X6I-fuFTBK" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQivuRNWYOqR38X6I-fuFTBK" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
  `,
};

export default post;
