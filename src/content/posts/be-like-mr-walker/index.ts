import type { BlogPost } from '../../postTypes';
import shovelingTheBlock from './shoveling-the-block.jpg';
import shovelAndBoots from './shovel-and-boots.jpg';

const post: BlogPost = {
  slug: 'be-like-mr-walker',
  title: 'Hey, Dudes! Advice for life from an old dad, No. 2',
  excerpt:
    'A nearly-ninety-year-old neighbor shoveling my sidewalk one December morning, an insult disguised as a compliment, and the kind of person I keep wanting to become.',
  section: 'advice',
  publishedAt: '2026-04-27',
  status: 'Recent',
  heroImage: shovelingTheBlock,
  heroAlt:
    'A person shoveling a snow-cleared sidewalk at dusk in a quiet residential neighborhood, with a streetlamp glowing and houses lit warmly along the block.',
  cardImage: shovelingTheBlock,
  cardAlt:
    'A person shoveling a snow-cleared sidewalk at dusk, streetlamp glowing overhead, lit houses along the block.',
  bodyHtml: `
<p>Hey, Dudes! Years ago, I moved back down to Boulder from Nederland. I was still working full time at IBM and also doing work for a friend who owned a computer hardware wholesaler in Boston. Things were going pretty well for me then, if you take my disastrous love life out of the equation.</p>
    <p>Looking back, I can see that the restlessness that brought me down from the mountains was about to disrupt everything completely. But I did not see that then. I just knew it was time. Or maybe more accurately, I just knew I was being directed.</p>
    <p>I rented a nice house in North Boulder, catty-corner from the open space that led to the North Boulder Rec Center. It was my first time living in that part of town, and I liked it.</p>
    <p>Next door lived a man named Mr. Walker. His family had owned the Walker Ranch that was later donated to the Boulder County open space program. He was close to ninety years old.</p>
    <p>At the time, I was living with a woman and her three-year-old son. The boy loved the original Willy Wonka and the Chocolate Factory. When he heard us say &ldquo;Mr. Walker,&rdquo; he thought we were saying &ldquo;Mr. Wonka,&rdquo; and naturally assumed the old man next door was, in fact, Mr. Wonka. I may have done very little to correct that misunderstanding.</p>
    <p>So any time poor Mr. Walker was out in the yard, the boy would yell, &ldquo;Mr. Wonka! Mr. Wonka!&rdquo; and Mr. Walker, being Mr. Walker, just let him. He was always kind about it.</p>
    <p>Then one morning in December, I woke up and looked outside and saw Mr. Walker shoveling the sidewalk in front of my house.</p>
    <p>That got my attention.</p>
    <p>There I was, about thirty-one, healthy, strong, and asleep inside while my nearly ninety-year-old neighbor was outside shoveling my sidewalk. I did not make a speech to myself about it. I just knew it was not going to happen again.</p>
    <p>So after that, every time it snowed, I got up before dawn and shoveled. Not just my sidewalk. I started at our corner and worked my way down the block in both directions. Back then I was in a lot better shape than I am now, so I also did driveways and the walks up to people&rsquo;s houses. I did not want anybody to know it was me. I was trying to get it done before anyone else was up.</p>
    <p>One morning, while I was working my way down the block, a woman a few doors away came out and tried to give me money. I told her no thanks. It was my pleasure.</p>
    <p>She looked at me and said, &ldquo;You know what? You&rsquo;re just like Mr. Walker.&rdquo;</p>
    <p>Then she said, &ldquo;I don&rsquo;t understand you guys.&rdquo;</p>
    <p>To be clear, she was not admiring me. She was making fun of me. She thought there was something wrong with doing all that work for no reason. No money. No recognition. No audience. Just cold hands, early hours, and effort spent on people who were still asleep.</p>
    <p>And that was the moment it all became clear to me.</p>
    <p>I realized that I did want to be like Mr. Walker, and I was ashamed that I wasn&rsquo;t.</p>
    <p>Every once in a while you get a moment like that, where what matters becomes obvious and a bunch of other things suddenly look cheap and pointless. It does not happen often. But when it does, you need to catch it.</p>
    <p>She meant it as an insult. Instead, she gave me one of the best compliments I have ever received.</p>
    <figure class="post-figure">
      <img src="${shovelAndBoots}" alt="A snow shovel leaning against a wooden porch column at night, beside a pair of worn work boots and leather gloves, with a soft glow from the doorway." />
      <figcaption>Done before anyone else was up.</figcaption>
    </figure>
    <p>A lot of people can understand doing something good if there is some reward attached to it. Money. Praise. Credit. At least a thank you. But there is a different kind of person who will do what needs doing anyway.</p>
    <p>That was Mr. Walker.</p>
    <p>And that is the kind of person I want you to become.</p>
    <p>Not the flashy kind. Not the kind that needs to be seen doing the right thing. I mean the kind people can trust. The kind who quietly carries a share of the load. The kind shallow people do not understand.</p>
    <p>That last one matters more than you might think. If you do this right, some people will think there is something wrong with you. They will think you are a sucker. They will think you are wasting your effort. Fine. Let them think it. Better that than building your life around the approval of people with a broken compass.</p>
    <p>I wish I could tell you I have stayed on that track ever since. I have not. I go in and out of Mr. Walker mode. Sometimes I find that path again, and sometimes I drift a long way from it. I get distracted, selfish, bitter, restless, tired, and lazy in spirit.</p>
    <p>But I know this much: when I am at my best, I am somewhere near that track.</p>
    <p>And when I think about the kind of people I hope you become, I do not first think of the flashy ones, or the rich ones, or the admired ones. I think of the man next door, pushing ninety, outside in the snow, shoveling somebody else&rsquo;s sidewalk because that was simply the kind of neighbor he was.</p>
    <p>Be like Mr. Walker.</p>
    <p>And expect nothing for it.</p>
    <p>With all my love.</p>
  `,
};

export default post;
