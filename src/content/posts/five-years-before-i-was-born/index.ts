import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: "five-years-before-i-was-born",
  title: "The Five Years Before I Was Born",
  excerpt: "A five-year musical constraint turned into 150 songs, a classroom math idea, and proof that old music was never one genre.",
  section: "music-playlists",
  publishedAt: "2026-08-23",
  status: "Recent",
  heroImage,
  heroAlt: "OOD Playlists artwork for The Five Years Before I Was Born, featuring the bearded skull mascot and the playlist dates.",
  cardImage,
  cardAlt: "A stack of early-1960s records and modern headphones on a school desk, representing a five-year music constraint.",
  bodyHtml: `
    <p><em>Old music that may surprise you</em></p>
<p><strong>150 songs · January 1, 1960–April 14, 1965</strong></p>
<h2>OOD PLAYLISTS</h2>
<p>OOD Playlists is where the songs get gathered by year, artist, mood, place, memory, or whatever else makes them belong together. The list matters, but the reason for the list is the post.</p>
<p>This one started with Chuck Berry on a Saturday. I was at school prepping and watering the plants, inside one of those rare windows without four kids at home or a hundred and eighty at school. "You Never Can Tell" came on, and my immediate reaction was basically: <em>Jesus, this is still really fucking good.</em></p>
<p>Not important. Not historically significant. Not "good for something recorded sixty years ago."</p>
<p>Just good.</p>
<p>So I started wondering when it had actually come out, and that question turned into a playlist, which turned into a math idea, which turned into me spending an unreasonable amount of time deciding whether Bobby Vinton deserved to survive another round of cuts.</p>
<p>So, normal afternoon.</p>
<h2>The Constraint</h2>
<p>I teach a senior math class called Advanced Quantitative Reasoning, and one of the things we're working on is constraints: the rules that narrow the possible solutions to a problem.</p>
<p>We were already going to play music during work time and cleanup, and I didn't want to turn that into an assignment. No worksheet, no reflection question, no kid explaining to me how a song "made them feel." The music could just play.</p>
<p>But what if the playlist itself had a constraint?</p>
<p>I was born on April 15, 1965. I'm 61 now, which is a sentence I still don't especially enjoy typing. So I backed up to a clean starting point and made the rule:</p>
<p><strong>Every song had to be released from January 1, 1960 through April 14, 1965.</strong></p>
<p>That's it. A little more than five years of music, all of it released before I existed.</p>
<p>The second rule was harder.</p>
<p><strong>I had to actually want to play it in a room full of teenagers in 2026.</strong></p>
<p>That killed the idea of making this some kind of respectable historical survey. A song didn't get in because it was influential, or because we needed a country representative, a jazz representative, three respectable blues songs and something from Latin America so the playlist could demonstrate proper musical diversity.</p>
<p>It had to work.</p>
<p>Catchy. A great groove. Some swagger. Weird enough to make you look up. Instantly recognizable. Or so beautiful that it gets through anyway.</p>
<p>There are great slow songs from this period, and thirteen-minute jazz performances that are probably more important than half this playlist. But I'm trying to get seventeen-year-olds to put their crap away before the bell rings.</p>
<p>Different problem.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A quiet classroom desk with plants, a record playing, and a simple five-year interval suggesting the constraint that started the playlist." loading="lazy" decoding="async" />
    </figure>
<h2>I Thought Finding the Songs Would Be the Hard Part</h2>
<p>It wasn't.</p>
<p>I started by asking AI for a big batch of possibilities, then listened and cut. There were plenty I knew — Chuck Berry, Sam Cooke, Ray Charles, the Beach Boys, early Beatles, early Stones, Motown, Roy Orbison, Patsy Cline, Etta James. Then something would come up that I somehow didn't know.</p>
<p>Dobie Gray's original "The 'In' Crowd" was one of those. I knew the song from Ramsey Lewis's version, but I'd never really heard Gray's. That was exactly what I wanted.</p>
<p>The strange part came when I asked for another fifty. Suddenly there were songs where I thought, <em>how the hell was that not in the first hundred?</em> So I listened again. Cut again. Asked for more.</p>
<p>Then it happened again. And again.</p>
<p>Sam Cooke's "Twistin' the Night Away" didn't show up until ridiculously deep into the process. That's not some obscure acetate discovered in the basement of a record store in Cleveland. It's "Twistin' the Night Away." How did we miss that?</p>
<p>At some point I realized I could probably ask for another fifty songs forever and keep finding a few where I'd have the same reaction. That became more interesting to me than getting the list "right."</p>
<p>I'd started with what seemed like a pretty brutal constraint — only five years of recorded music, roughly sixty years ago, plus my own filter that I had to be willing to play the thing now. And I still couldn't get the damn list down.</p>
<p>It ended at 150 songs. Not because 150 is the correct answer. I just had to stop.</p>
<h2>Old Music Isn't a Genre</h2>
<p>The other thing that disappears when we say "old music" is how much is hiding inside that phrase. These songs are all separated by no more than five years, and they don't sound like one thing.</p>
<p>There's early rock and roll, soul, Motown, surf, country, jazz, blues, pop, Latin, instrumentals, early ska, girl groups, crooners, British bands just starting to show up, and records locked completely to 1961 sitting next to records that don't feel particularly old at all. Put Henry Mancini next to the Kinks next to Etta James next to the Ventures next to Sam Cooke and try to explain to me what genre "old" is.</p>
<p>It isn't one. It's just what we call everything after enough time has passed.</p>
<p>And this particular five-year slice lands in the middle of something else that's easy to flatten when we look backward: who was allowed into the American musical mainstream. Black music had been shaping American popular music for a long time before 1960, so this isn't some neat story where integration begins right when my playlist does. It didn't. But the walls were moving.</p>
<p>You can hear Black artists and white artists, country and R&amp;B, pop and jazz and Motown and surf and the first stirrings of the British invasion all colliding inside the same narrow window. The categories were still real, the racial divides were still very real, but the music was leaking across them anyway.</p>
<p>You don't need a lecture attached to the playlist to hear some of that. That's part of what I like about it.</p>
<p>The constraint makes things visible.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Different instruments and records from rock, soul, jazz, country, surf and pop converging inside one narrow musical era." loading="lazy" decoding="async" />
    </figure>
<h2>The Math Lesson Nobody Has to Do</h2>
<p>This is the part I like most as a teacher.</p>
<p>I'm not going to teach a lesson about this playlist. I'm going to put up one slide —</p>
<p><strong>AUGUST PLAYLIST</strong> <strong>THE CONSTRAINT</strong> <strong>Released January 1, 1960–April 14, 1965</strong></p>
<p>— and hit shuffle. That's the whole lesson.</p>
<p>We need music during work time anyway. We need it while they clean up anyway. Now, every time it plays, the word <em>constraint</em> has a real example attached to it. Some kids won't think about it again. Fine.</p>
<p>But one kid's going to hear a song and say, "Wait, this is from 1963?" Another will recognize something because their parents or grandparents play it. A few will make fun of me for being old — that one I can guarantee. The link goes out with the slide, so any kid who gets curious has a free window into 150 songs from roughly the time of dinosaurs. And somebody might notice the actual point without ever being asked to explain it for points: putting limits around a problem doesn't necessarily leave you with nothing. Sometimes the solution space is still enormous. Sometimes the limits are what send you looking where you wouldn't have looked.</p>
<p>Next month I can change the rule. A different five-year window, another constraint, maybe two of them interacting. The vocabulary keeps getting attached to something real while we're doing something we were going to do anyway. And it doesn't have to stop with constraints — a lot of ideas can get real in the room the same way, by hanging them on something we're already doing instead of stopping everything to manufacture an exercise around the word.</p>
<p>No extra assignment, no grading, no managing another elaborate classroom activity. Just music. That feels a lot more likely to stick.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="High-school students working in class while music plays and a simple 1960-to-1965 interval sits on the board." loading="lazy" decoding="async" />
    </figure>
<h2>The Part AI Actually Changed</h2>
<p>I could've made this playlist a few years ago. I just wouldn't have.</p>
<p>I would've started with whatever artists I could remember, found a few "best songs of the early 60s" lists, bounced between Wikipedia and discographies, cross-referenced release dates, tried to remember what I'd already checked, and spent most of the afternoon trudging around the internet. Completely different experience from this one.</p>
<p>This time I could say "give me fifty songs that fit these rules" and immediately have fifty things to listen to, then react to what I heard:</p>
<p>"More like this."</p>
<p>"What else does Sam Cooke have in the window?"</p>
<p>"More Latin."</p>
<p>"More jazz, but nothing that needs six minutes to get interesting."</p>
<p>"What about Bobby Vinton?"</p>
<p>Then: "Give me fifty more." And every time, something showed up that made me wonder how we'd missed it.</p>
<p>AI wasn't just saving me the trouble of typing titles into a search box. It was doing the cross-referencing that would've taken multiple lists, websites, discographies and release-date checks, and handing the possibilities back in one place. That changes the whole economics of a dumb idea like this.</p>
<p>The strange part is it didn't make the project less enjoyable. It made it more, because almost all my time went to listening to great music and deciding what I liked. AI didn't choose the songs — I did a ridiculous amount of rejecting. It just moved my time from <strong>searching for music</strong> to <strong>listening to music</strong>.</p>
<p>Then <a href="https://soundiiz.com/" target="_blank" rel="noreferrer">Soundiiz</a> killed the other stupid part. Once I had the list, I could import it and turn it into an actual YouTube Music playlist instead of searching for 150 songs all over again and adding them one at a time. Less hunting, less cross-referencing, less copy-paste.</p>
<p>More music. Pretty good trade.</p>
<h2>The Cost of Curiosity Got Cheaper</h2>
<p>I've made lists like this before and posted them. The difference is they used to be projects — I might do one a year, because the digging and checking and organizing made the whole thing bigger than the fun part justified. Now I could do one a month in spare time without it becoming another job.</p>
<p>That doesn't mean AI is making twelve playlists for me. It means I can spend those twelve months doing the part I actually care about: listening, comparing, ranking, finding something I somehow missed, arguing with myself about whether song number 151 really deserves to die.</p>
<p>The cost of following a small curiosity dropped far enough that I can afford to follow a lot more of them.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="Headphones, records and a short candidate list showing the shift from searching for music to listening, judging and cutting songs." loading="lazy" decoding="async" />
    </figure>
<h2>150 Songs Is Plenty</h2>
<p>I did notice one stupid thing about myself before I finally stopped. Once a song made it onto the candidate list, I didn't want to cut it. Which makes no sense — nobody drafted it onto my team, the artist was never going to find out, and there's no trophy ceremony for the 151st-best song released in the five years before I was born. I could just delete it.</p>
<p>Still, I kept thinking, <em>yeah, but that's a pretty good song.</em></p>
<p>Exactly. There are a lot of pretty good songs. That turned out to be the whole point.</p>
<p>Five years of music, sixty years old, run through a second filter built to throw most of it away — and I still had to make myself stop at 150.</p>
<p>That's a constraint I can work with.</p>
<p>What did I miss? If there's something from January 1, 1960 through April 14, 1965 that absolutely belongs here, <a href="https://ourolddad.com/contact">let me know through the contact page</a>.</p>
<div class="post-links">
  <a class="button button--primary" href="https://music.youtube.com/playlist?list=PLJUfw4gzKTx0&si=JaS3265R556-vHzP" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
</div>
  `,
};

export default post;
