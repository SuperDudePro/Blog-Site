import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'sure-you-will',
  title: 'Sure You Will',
  excerpt:
    'A 1989 sidewalk promise, a friend calling bullshit, and the useful trap of saying the thing out loud before I\'m ready to back it up.',
  section: 'diary',
  publishedAt: '2026-06-16',
  status: 'Recent',
  heroImage,
  heroAlt: 'Young adults on a nighttime Chicago sidewalk as motorcycles pass under streetlights.',
  cardImage,
  cardAlt: 'Two young men face each other on a nighttime city sidewalk with motorcycle headlights blurred behind them.',
  bodyHtml: `
    <p>I dream out loud constantly. I&#x27;ll see something I want and announce it to whoever&#x27;s standing there — not because saying it makes it real, but because once it&#x27;s out, I&#x27;m stuck with it. Somebody heard me. Now there&#x27;s a witness.</p>

    <p>Lakeview, Chicago, 1989. Just out of school, no real idea what was supposed to happen next. Scott Kell, a white girl from Zimbabwe I was trying to impress, a couple of her friends I couldn&#x27;t tell you a single thing about now — thirty-five years has scrubbed everything off that night except that they were girls and I had an audience. Harleys came rolling past on Belmont, loud enough to kill the conversation, and I watched them go and announced to the whole sidewalk that I&#x27;d own one. Kell didn&#x27;t even pause. He looked at me sideways with that flat Kell face and told me I was full of shit. No heat in it. Just flat disbelief that I was standing there making promises to strangers about a motorcycle I had no money for.</p>

    <p>He was right.</p>

    <p>It was pure talk. But that was the point. Now Kell had heard it. So had the girl from Zimbabwe. So had her friends. Backing off meant admitting I was exactly as full of shit as he&#x27;d just said, out loud, in front of everybody I was trying to impress.</p>

    <p>So my brain went to work. Not because I willed it — because I&#x27;d backed myself into a corner and the only way out was through. Five years later I owned two. A &#x27;67 XLCH Sportster first, shifter and brake on the reversed sides from every other bike on the road, so it took a few weeks before my feet quit arguing with me. Then a &#x27;96 1200 Custom.</p>


    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A young man stands at a gritty nighttime city corner while motorcycles streak past under purple neon." loading="lazy" decoding="async" />
    </figure>

    <p>I&#x27;ve done this my whole life. It isn&#x27;t vision-boarding and it isn&#x27;t manifesting. I&#x27;m not disciplined and I&#x27;m not patient. What I can&#x27;t stand is being the guy who said the thing and didn&#x27;t do it — so I say it on purpose, in front of people who&#x27;ll remember, and then I&#x27;ve got no choice but to go become the guy who can back it up.</p>

    <p>The motorcycle was just the version I could see. Standing on that sidewalk in 1989, broke and aimless, I didn&#x27;t know the same mouth had already been doing it to the bigger stuff — talking me into a professional corner I never sat down and chose, pointing me down a road before I knew I&#x27;d picked one. Some part of me underneath was doing it on purpose. I just thought I was running my mouth.</p>


    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An older man looks back over a layered memory of young men, motorcycles, and a nighttime city street." loading="lazy" decoding="async" />
    </figure>

    <p>But here&#x27;s the part that actually mattered, and it took me years to see it: none of it works without Kell calling it. He didn&#x27;t nod along and tell me that was awesome. He took what I&#x27;d said and held it up against what he knew about my actual life — no money, nothing behind it — and the math didn&#x27;t work, so he said so. Without that, there&#x27;s no corner to fight out of. Just a guy talking on a sidewalk while everybody nods.</p>

    <p>That&#x27;s what I miss. People who&#x27;d test what you said against what you actually did. It wasn&#x27;t pretty, it was unfair as hell half the time, and nobody was managing your feelings while they did it. But it kept you honest. You couldn&#x27;t float around on your own talk, because somebody in the room would put your feet back on the ground before you got too high off the sound of your own voice.</p>

    <p>Nobody does that to me anymore. We all got older. The guys I came up with would&#x27;ve called it the second it left my mouth — that&#x27;s just what young guys did to each other, and it kept everybody honest without anybody calling it that. Now the rooms are polite. Everybody&#x27;s supportive, everybody&#x27;s proud, and when I say I&#x27;m going to do something the whole table just nods. &quot;You got this&quot; is free. Calling bullshit costs something, sometimes a friendship, and somewhere along the way everybody quietly stopped being willing to spend it. I miss it more than I expected to.</p>

    <p>So I&#x27;ll spend it on myself, out loud, in front of you. I&#x27;m building a course. I&#x27;m going to slow-travel the world with my two youngest kids. I&#x27;m putting Life Education out where people can read it and tell me it&#x27;s garbage. All of it announced before I&#x27;m anywhere near ready — because I know my own mouth. I know exactly how good I am at sounding like a man who&#x27;s about to do something.</p>

    <p>So look at me sideways and tell me &quot;sure you will.&quot; Tell me I&#x27;m full of shit. You&#x27;d be doing me a favor.</p>
  `,
};

export default post;
