import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';

const post: BlogPost = {
  slug: 'joe-walsh-34-songs-and-a-familiar-kind-of-crazy',
  title: 'Joe Walsh: 34 Songs and a Familiar Kind of Crazy',
  excerpt:
    'A Joe Walsh playlist brought back a strange stretch of Chicago radio, Caribou Ranch, and a catalog whose writing gets better the closer I listen.',
  section: 'music-playlists',
  publishedAt: '2026-07-12',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Sketch-style collage of Joe Walsh at a radio microphone and the mountains around Caribou Ranch, with restrained purple accents.',
  cardImage,
  cardAlt:
    'Close sketch-style portrait of Joe Walsh wearing headphones at a radio microphone, with restrained purple accents.',
  bodyHtml: `
    <p>Joe Walsh got into my head long before I knew much about the James Gang, <em>Barnstorm</em>, or most of the records represented on this playlist.</p>

    <p>Sometime in the early 1980s, Steve Dahl went on vacation and Walsh filled in for him on Chicago radio. I think he did it more than once, and I remember at least one stretch lasting a week or two, but forty-some years have made the details unreliable. I went looking for the exact dates and couldn&rsquo;t find them. I found enough to know I didn&rsquo;t invent the whole thing, which is about the best I can usually hope for with memories from high school.</p>

    <p>What I remember clearly is Joe Walsh saying, &ldquo;How ya doin&rsquo;?&rdquo;</p>

    <p>He said it in this slow, stretched-out voice that sounded a lot like Spicoli before most of us knew who Spicoli was. Every time he said it, he sounded slightly more amused and slightly less connected to the ordinary rules of human behavior.</p>

    <p>To us as high school boys, he seemed completely crazy in exactly the right way. Not dangerous crazy. More like somebody had handed control of a Chicago radio station to the funniest guy at the party and nobody from management had noticed yet.</p>

    <p>We loved him.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Sketch-style image of Joe Walsh wearing headphones and speaking into a radio microphone." loading="lazy" decoding="async" />
      <figcaption>The version of Joe Walsh who sounded perfectly suited to taking over a Chicago radio station.</figcaption>
    </figure>

    <p>That was the version of Joe Walsh I carried around for a long time: great guitar player, strange voice, funny songs, Eagles, &ldquo;Life&rsquo;s Been Good,&rdquo; and a general sense that the whole operation could come off the tracks at any moment.</p>

    <p>Making this playlist pushed me past that version.</p>

    <p>I usually hear these playlists quite a few times before I release them. I build one, move songs around, play it in the car, hear something I missed, and go back into the albums again. By the time I&rsquo;m done, I&rsquo;ve usually changed at least part of my mind about the artist.</p>

    <p>The more I listened to this one, the more impressed I became with Joe Walsh&rsquo;s entire body of work.</p>

    <p>The guitar playing is obvious. It announces itself. What took longer for me to notice was everything happening underneath it: the layered parts, the little sounds moving through the background, the changes in rhythm, and the way songs keep opening up after you think you already understand them.</p>

    <p>Listening through the early records also brought me back to Caribou Ranch.</p>

    <p>Walsh recorded some of his most important early work there in the 1970s. <em>Barnstorm</em> was the first album recorded at the ranch, and parts of <em>The Smoker You Drink, the Player You Get</em> were made there too.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Sketch-style image combining the Caribou Ranch mountain setting with artwork recalling the Barnstorm era." loading="lazy" decoding="async" />
      <figcaption>Caribou Ranch: part of Walsh&rsquo;s early recording history, and later part of mine.</figcaption>
    </figure>

    <p>About twenty years later, I lived there. My girlfriend at the time had grown up on the ranch while the studio was still operating, and she was the reason I got to live there in the first place. One weekend the two of us babysat for Jimmy Guercio&rsquo;s kids, and somewhere in that house I found what I thought were somebody&rsquo;s old bowling trophies &mdash; dusty, labels falling off. They were Grammys.</p>

    <p>That&rsquo;s the only time I&rsquo;ve been near a Grammy.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Sketch-style image of dusty Grammy trophies sitting on a shelf like forgotten bowling trophies." loading="lazy" decoding="async" />
      <figcaption>Not bowling trophies.</figcaption>
    </figure>

    <p>I also think Walsh&rsquo;s writing ability is underrated. His personality gets there first. The jokes, the voice, and the whole slightly damaged space-cadet act can make it easy to miss how good some of these songs are. He can build a song around a riff that sounds like it was dug out of the ground, then turn around and write something as bruised and human as &ldquo;Help Me Thru the Night&rdquo; or &ldquo;Tomorrow.&rdquo;</p>

    <p>He can be funny without making the music disposable. Even the long pieces have enough going on inside them to reward another listen.</p>

    <p>I kept both versions of &ldquo;Turn to Stone.&rdquo; They aren&rsquo;t duplicates once you actually listen to them.</p>

    <p>The playlist starts with the James Gang, moves through <em>Barnstorm</em> and Walsh&rsquo;s solo albums in chronological order, and finishes with a couple of additions outside the main sequence. I put the soundtrack version of &ldquo;In the City&rdquo; near the back, then ended with the seventeen-minute live version of &ldquo;Lost Woman&rdquo; from Carnegie Hall.</p>

    <p>By the time that final track ends, you&rsquo;ve either had enough Joe Walsh or you finally understand the point of the entire playlist.</p>

    <p>Working through these albums also gave me another idea. I&rsquo;m thinking about starting a series called <strong>Three Straight</strong>, devoted to bands or artists who released three consecutive great albums all the way through.</p>

    <p>Not three albums with enough good singles to create a greatest-hits collection. Three records you can put on at the beginning and let run without having to rescue the experience.</p>

    <p>I already have a few candidates. I&rsquo;m sure people will explain why all of them are wrong.</p>

    <p>Anyway, here are 34 songs and almost three hours of Joe Walsh. The hits are here, but they aren&rsquo;t really the reason I keep playing it.</p>

    <p>How ya doin&rsquo;?</p>

    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQjmWo_p3pw1-H7-p3CyRMFL" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQjmWo_p3pw1-H7-p3CyRMFL&amp;si=2393_nHP3GJ2GiwC" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
  `,
};

export default post;
