import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';

const post: BlogPost = {
  slug: 'the-teacher-who-thought-nobody-was-listening',
  title: 'The Teacher Who Thought Nobody Was Listening',
  excerpt: "A forgotten story idea from the summer of 2020, when remote teaching, empty classrooms, and an eerily quiet world made me wonder whether I'd died and nobody had told me.",
  section: 'diary',
  format: 'junk-drawer',
  publishedAt: '2026-10-25',
  status: 'Recent',
  heroImage,
  heroAlt: "A weary teacher at a laptop gestures toward an online classroom of dark, silent video tiles.",
  cardImage,
  cardAlt: "A weathered, nearly blank notebook page rests among old folders, papers, and journals, held with a paperclip.",
  bodyHtml: `
    <p><em>The Junk Drawer — Keep That Shit</em></p>
    <p>I've been digging through old files and finding things I wrote years ago, some of which I have absolutely no memory of writing.</p>
    <p>Here's one from July 11, 2020.</p>
    <h2>The original notes</h2>
    <blockquote>
      <p>Teacher loses family in tragic accident or crime.</p>
      <p>Starts making lesson videos for class during blended learning<br />
      In the videos, he rambles a bit, but has a Mr. Rogers quality.<br />
      Kids start to listen and watch even outside of his class.<br />
      Teacher has been simultaneously making videos for his kids<br />
      Life lessons, birthdays, telling them how he is, wondering about them, regret…<br />
      Someone finds out and because of how kids shared their YouTube, are able to copy the videos and post them.<br />
      Videos gain a following without teacher knowing.<br />
      People are somehow struck with kindness because of the pain, loss, love that they see, so they don’t torment him, or tell him that everyone is watching.</p>
      <p>Suddenly, someone does a prank or outs him.<br />
      The channel goes off.<br />
      If my pain is this entertaining to you, then I’d be an asshole to withhold it from you.<br />
      Channel goes back on.</p>
    </blockquote>
    <hr />
    <h2>Where this came from</h2>
    <p>This was the summer of 2020. We'd just finished the 2019–20 school year remotely because of COVID, although calling what we did that spring <em>teaching</em> is being pretty generous.</p>
    <p>Everybody was so worried about how traumatized the kids might be that we were mostly supposed to reassure them, check in, and make sure they were okay. So we did circles. Online circles. Usually with nobody showing up. It was a bit of a shit show.</p>
    <p>Even when kids did show up, nobody turned on their cameras. Nobody said anything or laughed at my jokes. There was no noise, no feedback, nothing.</p>
    <p>And it wasn't just school. My own kids were home in different rooms, doing pretty much the same thing to their teachers that my students were doing to me. They were logged into their classes, cameras off, playing games and doing anything but listening. They were technically there, but not really there either.</p>
    <p>My wife worked in facilities, so she still had to go into school to clean buildings that didn't have any kids in them. Outside, hardly anybody seemed to be going anywhere. Everything was eerily quiet. It felt like the whole world had disappeared.</p>
    <p>I was spending my days talking to a computer and getting absolutely nothing back. Eventually, I started wondering whether I was dead and just hadn't realized it.</p>
    <p>Maybe this was what being dead was like. You wouldn't even know it had happened. You'd just find yourself sitting in an empty house, talking to people who weren't there, waiting for somebody to answer.</p>
    <p>At first, I thought that was pretty funny, but after a while I started getting a little pissed off about it. What the fuck? Maybe this was hell. I was going to spend the rest of eternity alone, in an empty world, and I STILL HAD TO TEACH?</p>
    <p>Then summer came, and we started preparing to begin the 2020–21 school year remotely. I'd already had a taste of what that was like, and now I could imagine months more of broadcasting into the void.</p>
    <p>Apparently, somewhere along the way, I started thinking about a darker version of the experience. What if a man really had lost his family? What if he kept talking to them anyway, making videos that nobody seemed to watch, hoping somehow that somebody was listening?</p>
    <p>I guess that's where this came from.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="An older man speaks toward a laptop webcam in a quiet room, recording another video without knowing who will watch." loading="lazy" decoding="async" />
    </figure>
    <h2>Six years later</h2>
    <p>I'd completely forgotten about this, but I think there's something here.</p>
    <p>I can imagine this old guy spending years making his rambling little videos, getting older and more tired, gradually winding things down because he doesn't think anybody is listening. Especially not the people he really wants to hear him.</p>
    <p>And then, just as he's giving up, the world discovers him.</p>
    <p>Maybe he starts getting this enormous following, and people are genuinely moved by his videos. He's finally reaching all these people, but he stops making them anyway and dies a couple of weeks later.</p>
    <p>Everybody talks about him for about 38 hours. Then everybody finds something else to think about.</p>
    <p>I don't know if that's the story or if there's something better hiding in there. Maybe I'll figure it out someday.</p>
    <p>But I'm not throwing this one out.</p>
    <p><strong>What do you think? Is there a story worth developing here, or was I just losing my mind during COVID?</strong></p>
    <p><a href="https://ourolddad.com/contact">Let me know what you think.</a></p>
  `,
};

export default post;
