import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'three-straight-1-radiohead',
  title: 'Straight Greats No. 1: Radiohead',
  excerpt:
    'Radiohead opens Straight Greats with The Bends, OK Computer, and Kid A: three consecutive albums, three different versions of the band, and three Certified skulls.',
  section: 'music-playlists',
  publishedAt: '2026-07-23',
  status: 'Recent',
  heroImage,
  heroAlt:
    "Distressed black, cream, gold, and neon-purple Straight Greats poster certifying Radiohead's run of The Bends, OK Computer, and Kid A as a three-album clean sweep.",
  cardImage,
  cardAlt:
    'Distressed black, cream, gold, and purple Straight Greats No. 1 card for Radiohead, dated 1995, 1997, and 2000.',
  bodyHtml: `
    <p><strong>STRAIGHT GREATS</strong></p>

    <p><strong>THREE STRAIGHT</strong></p>

    <p><strong>☠☠☠ 3 CERTIFIED</strong></p>

    <h2>Radiohead</h2>

    <p><em>The Bends</em> · <em>OK Computer</em> · <em>Kid A</em></p>

    <p>Straight Greats is the series for artists who put together runs of nearly perfect albums, one after another. Some make it to three. A few go further. The point isn't whether every sane person on earth has to agree. The point is that a run holds up start to finish, album after album, with no dead weight and no charity required.</p>

    <p>Radiohead gets three Certified skulls for three albums that could hardly sound less alike and still belong to the same band: <em>The Bends</em>, <em>OK Computer</em>, and <em>Kid A</em>.</p>

    <p>Certified means each one clears the line clean from beginning to end. No asterisk. No mercy ruling.</p>

    <p>And because this is now official, Radiohead is welcome to fill out the contact form to claim its badge.</p>

    <p>For the first one, we could've gone back to the 1960s or 1970s, where these conversations usually begin. There are plenty of obvious candidates there, and we'll get to them. Instead, we're starting in the 1990s with something a little less expected.</p>

    <p>Not exactly shocking, though.</p>

    <p>Radiohead's run from <em>The Bends</em> through <em>OK Computer</em> and <em>Kid A</em> is about as strong a first case as we could make.</p>

    <h2><em>The Bends</em> — 1995</h2>

    <p><em>The Bends</em> is the guitar record.</p>

    <p>That description makes it sound much more ordinary than it is. The guitars don't merely accompany the songs. They swell, scrape, crash, retreat, and then come back twice as large. The album can be delicate for a minute and then suddenly sound as if the walls are coming down.</p>

    <p>&ldquo;Planet Telex&rdquo; opens the record by making it clear that Radiohead wasn't going to spend the rest of its career trying to rewrite &ldquo;Creep.&rdquo; Then come &ldquo;High and Dry,&rdquo; &ldquo;Fake Plastic Trees,&rdquo; &ldquo;Just,&rdquo; &ldquo;My Iron Lung,&rdquo; and &ldquo;Black Star.&rdquo; The album closes with &ldquo;Street Spirit,&rdquo; which somehow sounds beautiful and hopeless at the same time.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Bright charcoal sketch of an anonymous guitarist leaning into an electric guitar as amplifier lines surge across light paper, representing The Bends." loading="lazy" decoding="async" />
      <figcaption><em>The Bends</em>: the guitar record, except that description isn't nearly big enough.</figcaption>
    </figure>

    <p>It's emotional without becoming soft, dramatic without turning ridiculous, and full of guitar rock that sounded enormous then and still does now.</p>

    <p>There isn't a stretch where the record loses its way. There isn't a song that feels like it was included because they needed twelve.</p>

    <p>It's just a great rock album.</p>

    <h2><em>OK Computer</em> — 1997</h2>

    <p>Then Radiohead took everything that worked on <em>The Bends</em> and made the world around it bigger, stranger, and much less comfortable.</p>

    <p><em>OK Computer</em> still has guitars, but calling it a guitar-rock record misses most of what's happening. It feels more like entering an entire anxious little universe. Machines are taking over, people are becoming disconnected from one another, everyone is moving faster, and nobody seems sure where they're going.</p>

    <p>&ldquo;Airbag&rdquo; leads into &ldquo;Paranoid Android,&rdquo; which should be too complicated and too strange to work as well as it does. &ldquo;Let Down&rdquo; may be the prettiest song on the record. &ldquo;Karma Police&rdquo; sounds almost conventional until it doesn't. &ldquo;No Surprises&rdquo; wraps complete exhaustion in something that could almost pass for a lullaby, and &ldquo;Lucky&rdquo; sounds like the end of the world with a guitar solo.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Bright charcoal sketch of a lone figure facing an anxious city of roads, towers, wires, signals, and surveillance, representing OK Computer." loading="lazy" decoding="async" />
      <figcaption><em>OK Computer</em> doesn't feel like a collection of songs. It feels like entering a world.</figcaption>
    </figure>

    <p>Even &ldquo;Fitter Happier,&rdquo; the computer-voice interlude that almost invites people to call it filler, belongs exactly where it is. Nobody is pulling it out to play at a wedding, but remove it and the album becomes less complete. It's part of the atmosphere and part of the argument.</p>

    <p><em>OK Computer</em> isn't merely a collection of great songs. It feels designed to be heard as one thing.</p>

    <p>Then, after making one of the defining rock albums of its time, Radiohead decided not to make another one.</p>

    <h2><em>Kid A</em> — 2000</h2>

    <p>The easy move would've been <em>OK Computer II</em>.</p>

    <p>Instead, <em>Kid A</em> begins with &ldquo;Everything in Its Right Place,&rdquo; and almost nothing is in the place where Radiohead listeners expected to find it. The guitars are no longer running the operation. There are synthesizers, electronic rhythms, processed voices, horns, ambient spaces, and long stretches that feel less like rock songs than transmissions from somewhere cold and far away.</p>

    <p>It should've felt like a band abandoning what it did best. Instead, it sounded like the band had decided that repeating itself would be the real failure.</p>

    <p>&ldquo;The National Anthem&rdquo; lurches forward until the horns seem to be fighting each other. &ldquo;How to Disappear Completely&rdquo; may be one of the most emotionally overwhelming songs they ever recorded. &ldquo;Idioteque&rdquo; sounds panicked and mechanical at the same time. &ldquo;Motion Picture Soundtrack&rdquo; closes the album like something disappearing beneath the water.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Bright charcoal sketch of a pale mountain range breaking into offset lines and sparse purple pixel fragments, representing Kid A." loading="lazy" decoding="async" />
      <figcaption><em>Kid A</em>: cold, strange, disorienting, and completely its own environment.</figcaption>
    </figure>

    <p>&ldquo;Treefingers&rdquo; presents the same challenge as &ldquo;Fitter Happier.&rdquo; It isn't a conventional song, and it probably isn't going onto many casual Radiohead playlists. But this series isn't about whether every track works alone. It's about whether anything feels disposable when you play the album from beginning to end.</p>

    <p>On <em>Kid A</em>, it doesn't.</p>

    <p>The album creates its own environment, and every piece belongs inside it.</p>

    <h2>Where I Was</h2>

    <p>Albums this massive have a way of making the years around them seem bigger. They don't just remind you where you were. They add color and scale to whatever was happening, until parts of your life start feeling more epic simply because that was the music playing through them.</p>

    <p>When <em>The Bends</em> came out in 1995, I was living on my own in Nederland. I was rebuilding after the breakup, trying to figure out what came next and what my life was supposed to look like now.</p>

    <p><em>OK Computer</em> arrived in 1997, which was an even bigger year of transition. I went to Chicago to help my mom after her heart attack, then moved to Boston for the fateful Todd and Continental Trade chapter. There was a lot going on, most of it strange, and not much certainty about where any of it was leading.</p>

    <p>Then <em>Kid A</em> came out in 2000, the year I moved to Montana. It was also the year I signed up for the National Guard, at least partly as a way to get away from my wife in Montana, which is probably not one of the standard recruiting pitches.</p>

    <p>These records could've attached themselves to almost any period of my life and made it memorable. They happened to arrive during years that already had plenty going on.</p>

    <h2>The Way We Did It Then</h2>

    <p>I remember knowing the albums were coming and waiting for them. Then I'd get them as soon as I could, probably from a mall or a record store. This was before music simply appeared on your phone at midnight. You had to go get the album.</p>

    <p>And because we were constantly throwing money away on new music, we developed a whole system for keeping the obsession affordable.</p>

    <p>By the later part of this run, recordable CDs had entered the operation. I'd buy a CD, copy it onto a blank CD, then trade the original back in for credit toward something else. Even better was finding a used copy, recording it, and trading it back before it lost much value.</p>

    <p>Buy, copy, trade, repeat.</p>

    <p>It was a small, morally flexible record-store economy, powered by the fact that there was always another album we needed.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Bright charcoal sketch of a late-1990s CD burner, blank disc, jewel cases, record-store bag, and store-credit slip illustrating a buy-copy-trade cycle." loading="lazy" decoding="async" />
      <figcaption>Buy, copy, trade, repeat: a small, morally flexible record-store economy.</figcaption>
    </figure>

    <p>I still made cassette mixtapes, but recordable CDs changed the scale of the operation. You could keep the music while cycling the same limited amount of money back through the store.</p>

    <p>Then you put the album on and listened to the entire thing.</p>

    <p>With these three, that was exactly the point.</p>

    <h2>Straight Greats</h2>

    <p>Three albums released between 1995 and 2000. Three completely different versions of the same band.</p>

    <p><em>The Bends</em> proved Radiohead could make a great guitar-rock record.</p>

    <p><em>OK Computer</em> proved it could make something much larger.</p>

    <p><em>Kid A</em> proved it didn't have to keep making either one.</p>

    <p>That's a clean sweep: three Certified skulls.</p>

    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/playlist?list=PLEo7Vn003Ekw" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLEo7Vn003Ekw" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
  `,
};

export default post;
