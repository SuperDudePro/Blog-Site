import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'bad-company-40-songs-worth-burning-through',
  title: 'Bad Company: 40 Songs Worth Burning Through',
  excerpt:
    'A Bad Company playlist brought back eighth-grade graduation money, a record-store splurge, and a band that still hits harder than I remember.',
  section: 'music-playlists',
  publishedAt: '2026-04-23',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Black, cream, gold, and neon-purple OOD Playlists banner for Bad Company: 40 Songs Worth Burning Through, with the bearded skull mascot, records, equalizer bars, and a waveform.',
  cardImage,
  cardAlt:
    'Charcoal-and-pencil sketch of vinyl records beside headphones and a microphone, with sparse purple accents.',
  bodyHtml: `
    <div class="post-center">
      <strong>OOD PLAYLISTS</strong><br>
      <strong>Bad Company: 40 Songs Worth Burning Through</strong><br>
      <em>Forty tracks from the six Paul Rodgers albums—and the graduation money, record-store spree, and early run attached to them.</em><br>
      40 TRACKS | ARTIST &amp; MEMORY PLAYLIST
    </div>
    <p>OOD Playlists is where the songs get gathered by year, artist, mood, place, memory, or whatever else makes them belong together. The list matters, but the reason for the list is the post.</p>
    <p>This one started Saturday morning when Bad Company’s “Early in the Morning” came on my mix. Whenever I hear that song, I fall into a trance and start playing it on repeat until I get my fix.</p>
    <p>That sent me back through the six Paul Rodgers albums, from the self-titled debut through <em>Rough Diamonds</em>. Even though I know that catalog pretty well, I still manage to underestimate how much the music can move me and how solid those early albums sound from front to back.</p>
    <p>The playlist runs chronologically by album and then by original track order. The YouTube and YouTube Music versions are linked at the bottom. Forty songs made the list. The graduation money, record-store spree, and memories attached to them are why there’s a post.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Charcoal sketch of a turntable playing in early morning light as an anonymous listener reaches to replay the record, with sparse purple accents." loading="lazy" decoding="async" />
    </figure>
    <p><em>Desolation Angels</em> came out in March 1979, right at the end of eighth grade for me. I had already heard plenty of Bad Company on AM and FM radio before then, but I still hadn’t bought one of their albums for myself. Then I heard “Rock ’n’ Roll Fantasy,” got mesmerized, bought the album, and nearly wore it out.</p>
    <p>A couple of months later, I came into what felt like a small fortune at my eighth-grade graduation party: cash, checks, and savings bonds. Back then, giving savings bonds to kids was a pretty standard way for adults to nudge us toward the future and whatever responsible expenses were supposedly waiting there. I’m pretty sure none of my savings bonds from either eighth grade or high school lasted more than a few months. I usually cashed them early, ate the penalty, and felt a little guilty about it. Still do, a little.</p>
    <p>This time around, I took about $200 of my future to the record store and blew it on albums.</p>
    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Charcoal sketch of a teenage record buyer at a 1979 record-store counter with cash and a tall stack of albums, with sparse purple accents." loading="lazy" decoding="async" />
    </figure>
    <p>Until now, that memory had always felt purely joyful. Then I ran $200 in spring 1979 through the <a href="https://www.bls.gov/data/inflation_calculator.htm" target="_blank" rel="noreferrer">BLS inflation calculator</a>. In 2026 money, it’s roughly $930. That hit differently. If one of my kids burned through almost $1,000 on Robux or something equally questionable, I would lose my mind. Apparently my bad money habits didn’t begin recently.</p>
    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Charcoal sketch contrasting savings bonds, cash, and vinyl records with a tablet displaying generic game currency, with restrained purple highlights." loading="lazy" decoding="async" />
    </figure>
    <p>Still, I can’t pretend I regret the music.</p>
    <p>Among the 30 or 40 albums I bought in that glorious spree were <em>Straight Shooter</em>, <em>Run with the Pack</em>, and <em>Burnin’ Sky</em>, the three Bad Company albums that came before <em>Desolation Angels</em>. Those records, along with the self-titled debut and <em>Desolation Angels</em>, make up the version of Bad Company that matters most to me. That run is ridiculously strong.</p>
    <p>Then came <em>Rough Diamonds</em> in 1982, just as I was heading into senior year. It was fine. Not bad, exactly. But after five great albums, “fine” felt like a major letdown. When Paul Rodgers left after that, Bad Company stopped feeling like Bad Company to me. I never really got pulled back in, even when the band found some success again in the mid-to-late 1980s.</p>
    <p>As with my Journey playlist, I guessed I would find about 30 songs worth keeping. Instead, I found 46 and had to cut them down to an even 40. The first three albums made the playlist in full, which tells you a lot right there.</p>
    <p>I sequenced this one the same way I did the Journey playlist: chronological by album, then by track order within each album. That feels right to me for a band like this. But I’ve mostly listened to it on shuffle, and it works that way too.</p>
    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Charcoal sketch of older hands arranging six albums and a handwritten playlist beside a turntable, with sparse purple accents." loading="lazy" decoding="async" />
    </figure>
    <p>The main thing I rediscovered is that Bad Company’s early run is even better than I tend to remember. Every time I go back, I think I’m just revisiting a band I’ve always liked. Then a song grabs me by the collar, and suddenly I remember: no, this was never casual. This was a band I lived with.</p>
    <p>Anyway, here’s the playlist. If you already love Bad Company, you probably won’t need much convincing. If you only know a few songs, this is a very good place to start.</p>
    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/watch?v=LHQ5d6IRaFo&list=PLJ-R3jWagtQivuRNWYOqR38X6I-fuFTBK" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQivuRNWYOqR38X6I-fuFTBK" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
    <p>What did I miss? What belongs on your Bad Company playlist, and what would you throw off mine? <a href="/contact">Use the contact page</a> and tell me.</p>
  `,
};

export default post;
