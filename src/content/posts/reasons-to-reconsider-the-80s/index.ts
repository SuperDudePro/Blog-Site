import type { BlogPost } from '../../postTypes';
import hero from './hero.jpg';
import zineInline from './zine-inline.jpg';

const post: BlogPost = {
  slug: 'reasons-to-reconsider-the-80s',
  title: 'Reasons to Reconsider the 80s',
  excerpt:
    'I have spent a lot of years being annoyed by 80s music. This playlist is my reminder that the decade was not all shoulder pads, gated drums, and songs built for shopping malls.',
  section: 'music-playlists',
  publishedAt: '2026-04-26',
  status: 'Recent',
  heroImage: hero,
  heroAlt: 'Rough handmade zine-style collage for an Our Old Dad playlist post about reconsidering 80s music.',
  cardImage: hero,
  cardAlt: 'Photocopied mixtape-zine collage with handwritten notes and cassette imagery for a playlist about the better side of the 80s.',
  bodyHtml: `
    <p>I was the perfect age for 80s music.</p>
    <p>That is the annoying part.</p>
    <figure class="post-figure">
      <img src="${zineInline}" alt="Low-fi collage illustration with cassette tape, handwritten playlist scraps, and rough college-radio zine textures." />
      <figcaption>Skeptical nostalgia, which is about as close to honest as I can get with this decade.</figcaption>
    </figure>
    <p>I was somewhere between 15 and 25 for the decade, which means that music should hit me right in the sentimental machinery. It should be impossible for me to hear it clearly. It should all be wrapped up in first cars, bad hair, part-time jobs, movie theaters, girls I was too scared to talk to, and the general drama of being young enough to think every song was somehow about me.</p>
    <p>And some of it is.</p>
    <p>But I have to be honest: the 80s is one of my least favorite decades musically.</p>
    <p>There. I said it.</p>
    <p>I know that is wrong in some official cultural sense. The 80s have won. They have been recycled, merchandised, playlisted, rebooted, Halloween-costumed, and <em>Stranger Things</em>-ed into permanent victory. People love the 80s now in a way that sometimes makes me feel like maybe I lived through a different decade.</p>
    <p>Because when I think of 80s music, I do not just think of the good stuff. I think of the stuff that makes my teeth hurt.</p>
    <p>Songs with too much shine on them. Drums that sound like they were recorded inside a shipping container. Keyboards trying to do emotional work they were not qualified to do. Videos where everybody looked like they had been styled by a committee made of cocaine and hairspray.</p>
    <p>And yet.</p>
    <p>That is not the whole decade.</p>
    <p>That is the point of this playlist.</p>
    <p>I made it as a corrective. Not because I suddenly decided the 80s were secretly the greatest musical decade, because let’s not get stupid. I made it because I would catch myself talking about 80s music like it was one big neon disease, and that is lazy.</p>
    <p>The 80s gave us plenty of junk. But they also gave us “Age of Consent,” “The Killing Moon,” “The Whole of the Moon,” “Crazy Rhythms,” “This Is the Day,” “Everyday Is Like Sunday,” “I Wanna Be Adored,” “Alex Chilton,” “Gardening at Night,” “Bizarre Love Triangle,” “There She Goes,” and “A Million Miles Away.”</p>
    <p>That is not nothing.</p>
    <p>That is more than not nothing.</p>
    <p>That is a decade mounting a pretty good defense while I am still busy complaining about leg warmers.</p>
    <p>This playlist is not meant to be definitive. It is not a museum exhibit. It is not “The Best Songs of the 80s,” because that kind of list always turns into a fight between people who think music history is something you can win.</p>
    <p>It is more personal than that.</p>
    <p>It is a list of songs I can put on when I need to remember that the decade had shadows and corners and weird little rooms. It had college rock. It had post-punk. It had jangly guitars. It had bands that sounded like they were making music for people who did not want to stand in the middle of the party, but also did not want to leave yet.</p>
    <p>And yes, it had some big obvious songs too.</p>
    <p>I am not pretending “Purple Rain” does not belong. I am not pretending “In the Air Tonight” does not still work. I am not pretending “Don’t You Forget About Me” did not attach itself to a whole generation’s adolescent brainstem and refuse to leave.</p>
    <p>Some songs become obvious because they are overplayed. Some songs become obvious because they are great. Some are both, which is irritating but true.</p>
    <p>The funny thing is that my problem with the 80s might not even be the music itself. It might be the costume people put on top of it later. The decade got reduced to a look: neon, synths, big hair, Rubik’s Cube, mall montage, prom scene, boom box, whatever.</p>
    <p>But the actual decade was messier than the souvenir version.</p>
    <p>The same decade that gave us glossy nonsense also gave us Sonic Youth, The Replacements, The The, The Feelies, Dead Kennedys, R.E.M., New Order, The Cure, The Waterboys, and The Stone Roses. It gave us music that was nervous, bitter, romantic, strange, funny, angry, and sometimes beautiful in a way that did not ask permission first.</p>
    <p>That is the 80s I can still deal with.</p>
    <p>Not the full costume party.</p>
    <p>Not the version where everyone pretends every terrible song was secretly fun just because enough time has passed.</p>
    <p>The other version.</p>
    <p>The version with good songs hiding in plain sight.</p>
    <p>The version that reminds me my taste has always been a little suspicious of whatever everybody else was doing, but not pure enough to avoid “Jessie’s Girl.”</p>
    <p>That is probably the most honest thing about this playlist. It is not cool all the way through. Good. Neither was the decade. Neither was I.</p>
    <p>I made the list to remind myself not to dismiss the whole thing just because some of it annoys me. That is a useful habit outside music too, but let’s not turn this into a life lesson and ruin it.</p>
    <p>Sometimes you just need a playlist that says:</p>
    <p>Fine. The 80s were not all bad.</p>
    <p>Here is the proof.</p>
    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQh0xz7ffma07jAWBIv87Tx5" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQh0xz7ffma07jAWBIv87Tx5&si=C2tAa4I5c3LsvUHq" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>
  `,
};

export default post;
