import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';

const post: BlogPost = {
  slug: 'none-of-those-roads',
  title: 'None of Those Roads',
  excerpt: 'A couch, a little blue bus, two laughing kids, and the old-dad math of regret: every smarter road would have missed the moment in front of me.',
  section: 'diary',
  publishedAt: '2026-06-22',
  status: 'Recent',
  heroImage,
  heroAlt: 'An older dad sits on a couch making a silly cartoon-bus voice while two young children laugh under a purple blanket.',
  cardImage,
  cardAlt: 'A close sketch of an older dad making a silly voice while two young children laugh beside him.',
  bodyHtml: `
    <p>Tayo's a little blue bus. Korean cartoon, the kind where everyone's cranked three notches past human — the bus is thrilled to go to work, the traffic light's thrilled to turn green. Raven and Xander vanish into it. So I do the voices. Not well. Loud, and a little stupid, and the joke isn't the voice, it's that a grown man is saying it instead of the cartoon they just got swallowed by. They lose it every time.</p>

    <p>Today they were both tucked into me on the couch, bottles going, while I ran my Tayo bits and rubbed their bellies. Raven asked me about a dozen times if I love her — she does that — and told me how much she loves me in between. Xander nodded along like he was confirming it for the record.</p>

    <p>And I noticed I was full. Not the good-mood kind. The kind that catches in your throat — too much love going both directions at once, and your eyes sting and it isn't happiness, it's closer to awe.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="An older dad makes a silly cartoon-bus voice while two small children laugh with bottles on the couch." loading="lazy" decoding="async" />
    </figure>

    <p>Then the other thing showed up, the way it always does. I started running the tape. The woman years ago who looked at me like I hung the moon, who I got bored of for no reason I could defend today. The roommate who took his career seriously while I screwed around, and who now runs a company. The money I didn't save, the business I didn't start, every fork where I took the dumb road. And here's the strange part: even if I could go back and drive every smarter road, and keep everything good that would've come after — I wouldn't. None of those roads end on this couch.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An older dad sits with two sleeping children while imagined roads and alternate life paths fade behind the couch." loading="lazy" decoding="async" />
    </figure>

    <p>There's a thing Stallone keeps doing in the late <em>Rocky</em> movies, and again in the <em>Creed</em> ones. He's old, he's got the belts, and he's haunted — by the son he didn't father right, the people he loved and didn't tend. He keeps circling it. I used to think that was an actor with one note. Now I think it's the most honest note he's got.</p>

    <p>Because I've got a first set of kids, mostly grown now. By most measures my oldest is crushing it — better than I had any right to expect. And I was there for it. But I always feel like I could have given more. More time, more patience, more of whatever my best self had and didn't always hand over. It was probably enough. It still wasn't everything I had.</p>

    <p>So here's what I'm actually afraid of with these two. Not a disaster. The slow version — looking up in fifteen years, fuller than ever, and realizing it went by while I had more to give than I gave.</p>

    <p>And the job now is to hold all of it together — the money, the month, the what-if-it-all-breaks — without letting the strain of holding it become the reason I'm not all the way here. I can grind through the logistics. The danger is the grind becoming the place I hide.</p>

    <p>Raven asked again if I love her. I said yes. She said she loves me more. I told her that's not how it works and hit her with the Tayo voice, and she lost it, and we were back.</p>
  `,
};

export default post;
