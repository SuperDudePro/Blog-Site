import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';

const post: BlogPost = {
  slug: '1985-the-wrong-algorithm',
  title: '1985: The Wrong Algorithm',
  excerpt: 'A 1985 playlist becomes a Purdue time capsule about analog college life, wrong lessons learned well, and the scattered music of a young man getting good at a game he did not respect.',
  section: 'music-playlists',
  publishedAt: '2026-06-12',
  status: 'Recent',
  heroImage,
  heroAlt: 'Students walking and biking under a Purdue University gateway on a bright spring day.',
  cardImage,
  cardAlt: 'A Sony Walkman, cassette tapes, and a handwritten 1985 road mix on a wooden desk.',
  bodyHtml: `
    <p>I was at Purdue in 1985, coming out of sophomore year and heading into junior year, which is a dangerous age if you are just smart enough to figure things out and nowhere near smart enough to know what they mean.</p>

    <p>That was the year I started cracking the college algorithm.</p>

    <p>Not learning, exactly. That was available too, and I am sure I bumped into some of it by accident. I mean the other algorithm. The one where you figure out how to miss class, still get by, run campus organizations, meet the right people, sound like you have a plan, and become competitive for jobs you probably should have known you wanted nothing to do with.</p>

    <p>I was getting good at a game I did not actually respect.</p>

    <p>That is not wisdom. That is a problem with better shoes.</p>


    <p>And the funny part is, it was fun. I do not want to revise the whole thing into some fake tragedy where I was walking around Purdue under a dark cloud, wasting my youth while a sad violin played. That is not what it was. The highs were real, and some of them were the kind you do not get to schedule and cannot quite believe later.</p>

    <p>Here is one, so you know I am not inventing the fun. We had a bong named Rootin Tootin, and one week we decided he deserved a birthday party. Not a joke. A real one — a full keg, a rented party bus, and a pickup route, because the only way to assemble fifty people in 1985 was to go physically collect them, one porch at a time. No group text. No shared location. Just a list and a lot of faith. Over fifty showed up. For a bong. On a Tuesday. And by ten o'clock every last one of them had folded — face-down, lights out, done — except me, my roommate, and the driver, who neither drank nor smoked and had obviously made better life decisions than the crowd he had just chauffeured into oblivion.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A crowded 1980s college house party with students cheering around Rootin Tootin." loading="lazy" decoding="async" />
    </figure>

    <p>It did not end there. The next week a couple of renegade sorority girls kidnapped Rootin Tootin and ran a full ransom operation. Notes. Demands. Calls placed to pay phones at appointed times, because that was the available technology for a hostage negotiation in 1985. Whether we paid, whether he ever came home, I genuinely could not tell you. I was, at the relevant moments, too high to retain the information. Somewhere back there is a ransom drop I will never recover.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A handwritten Rootin Tootin ransom note taped beside a pay phone." loading="lazy" decoding="async" />
    </figure>

    <p>That world had electricity in it. Things came easily to me then. I could get myself into a room, into a night, into a situation, almost without trying, and some of those nights turned on a single lean across a table and went somewhere none of us had planned. I am not going to lie about that part to make the rest of the story cleaner.</p>

    <p>Some of what I learned was useful. How to walk into a room, how to talk to people, how to make something happen without waiting for instructions. Some of it was real. Some of it was costume. At twenty, the line is not always obvious.</p>

    <p>And some of it was just the old college education that never appears in a course catalog. You could be standing next to somebody one minute and kissing them a few minutes later, even though you did not expect to. Or maybe you did expect to. Or hoped to. Or had built some ridiculous internal theory about it and then life ignored the theory and did whatever it wanted. There was no phone in your pocket to rescue you, locate you, document you, or give you something to stare at when the room got uncomfortable.</p>

    <p>You had to be there. Actually there.</p>

    <p>That is the time-capsule part of all this. It is not just the songs. It is the operating system around them. We had fully functional lives, somehow, without cell phones, GPS, group texts, shared locations, or an algorithm smoothing the next move. You found people because you knew where they might be. You waited because there was no update. You got lost because maps were paper and confidence was cheaper than accuracy.</p>

    <p>And yet it worked. Not perfectly. Not romantically. We were morons. We were just analog morons. The stupidity had fewer receipts.</p>

    <p>That is one mercy of the age.</p>

    <p>Here is the part that is harder to put down.</p>

    <p>I was good at the game, too. Good enough that people followed me into things. Good enough that the system kept handing me positions, interviews, and proof that I was turning into exactly the kind of person it knew how to reward. That is the high that keeps you on the path. It lets you feel superior and successful at the same time, which is a dangerous drug if you already have a high opinion of yourself.</p>

    <p>And while all of that was going right, I was missing the people who actually mattered.</p>

    <p>Two of the most important women in my life ran through those years. Both extraordinary. And I went distant on both of them right when the thing became real. Not because anything was wrong. Because real was never something I knew how to want. I wanted the chase, the not-yet, the door I had not walked through. The second something was in my hands it stopped glowing, and I started looking past it.</p>

    <p>I only wanted what I did not have. And I was miserable inside more good fortune than most people get.</p>

    <p>That is a cleaner indictment than anything I said before. It was not only that I chased status I did not respect. It was that I could not value anything once it was present. Campus, careers, people, whole stretches of a charmed and lucky life — I was standing in the middle of it scanning the exits.</p>

    <p>I was not lost in the obvious way. I was lost efficiently.</p>

    <p>That is worse.</p>

    <p>We talked about the split back then as party versus professional. You could waste a night, then put on the other face and become the responsible future business guy, and somehow that was supposed to add up to a life. I could see enough to sneer at the path and never enough to leave it. Maybe I wanted the title and the room and the recognition, but not the obedience required to actually live that life.</p>

    <p>Contempt without courage. Allergic to submission, hungry for approval.</p>

    <p>Excellent combination. Very stable. Highly recommended.</p>

    <p>The music was better than the plan.</p>

    <p>This was prime concert-going time for me, and music still required effort then. You did not summon the entire recorded history of the world from a rectangle in your hand while standing in line for coffee. You heard things from people. You borrowed records. You made tapes. You bought something blind because the cover looked promising, or because some guy in a record store acted like you were an idiot for not already knowing it. There was no algorithm politely sanding the corners off your taste. You had to wander into things.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A bright 1980s rock concert with a singer, band, stage lights, and a packed crowd." loading="lazy" decoding="async" />
    </figure>

    <p>That is probably why the year sounds so scattered to me now. It refuses to sort. The Cult next to Whitney Houston. R.E.M. near Ratt. Prince and Megadeth living in the same twelve months and neither one asking the decade for permission. Tears for Fears making pop that sounded like world conquest with better production. The Replacements sounding like the truth had been drinking. Dire Straits taking six minutes to make adulthood sound expensive and lonely. Run-D.M.C. and LL Cool J making it very clear the future was not going to wait politely outside.</p>

    <p>And then there was Mellencamp, who did not let me off the hook. I did not need to be from a small town to understand "Small Town." I was in Indiana, in the middle of the Midwest, surrounded by exactly the kind of places that song was talking about whether they liked it or not. He still had enough rock in him to keep the songs from turning into postcards, and enough ache in him to know the postcards were lying. "Rain on the Scarecrow" was not mall nostalgia. It had dirt under its nails.</p>

    <p>That mattered to me, even if I would not have admitted it then.</p>

    <p>Some of these songs I chose. Some of them just moved into the air supply and refused to leave. "Take on Me" did not ask permission. "Don't You Forget About Me" attached itself to an entire generation of people who were probably not as misunderstood as we thought but were absolutely committed to the bit. That is the thing about a year's worth of music. It is not a best-of list, no matter what you call it. It is a time machine with poor boundaries. It does not just bring back the songs. It brings back the lighting, the walk across campus, the smell of somebody else's microwave popcorn, the feeling that everyone else had a plan and you were the only one improvising.</p>

    <p>The playlist should stay random, because sorting it would lie. Memory does not arrive by genre. College did not arrive by genre. One minute you were trying to act like a future professional, the next minute you were at a show, the next minute you were in some conversation you did not yet know would matter, and a song came on and made the whole thing feel meaningful even though nobody involved knew what they were doing.</p>

    <p>Especially then.</p>

    <p>So maybe 1985 is not the year everything went wrong. That is too neat, and I do not trust neat explanations. It was more like the year a lot of currents started moving at once. Some were good. Some were stupid. Some were the kind of fun you cannot quite believe later. Some were laying track for a decade I would later have to crawl out of. I was becoming socially capable and personally unmoored at the same time — comfortable almost anywhere and not really comfortable anywhere.</p>

    <p>I do not want to throw the kid away. He had nerve and energy and no searchable playbook. Whatever he built, he built by watching, guessing, talking, bluffing, recovering, and occasionally getting lucky. There is something to respect in that, even if I want to grab him by the collar and aim him somewhere better — at the people right in front of him, for a start.</p>

    <p>He would not have listened. I know that because I was him.</p>

    <p>I hear these songs now and I am back there, somewhere between sophomore year and junior year, between home and whatever came next, between the person I was pretending to be and the person I had not become yet. Walking across campus with too much momentum and not enough wisdom. Late for a class I have decided is optional. Headed to a meeting for something I have made too important. Thinking about jobs, music, status, escape, and the next thing I did not have yet.</p>

    <p>Mostly myself, if I am honest.</p>

    <p>That is the embarrassing truth of being young. You think you are looking at the world, but half the time you are using the world as a mirror.</p>

    <p>1985 was a hell of a mirror. Scattered, loud, overconfident, restless, occasionally brilliant, sometimes ridiculous, and not nearly as organized as it thought it was.</p>

    <p>So was I.</p>

    <div class="post-links">
      <a class="button button--primary" href="https://www.youtube.com/playlist?list=PLJ-R3jWagtQg7RQ2IxTkCDqkQBI-boRNo" target="_blank" rel="noreferrer">Watch on YouTube</a>
      <a class="button button--ghost" href="https://music.youtube.com/playlist?list=PLJ-R3jWagtQg7RQ2IxTkCDqkQBI-boRNo&amp;si=HTB8EtXMl0miRbeB" target="_blank" rel="noreferrer">Listen on YouTube Music</a>
    </div>

  `,
};

export default post;
