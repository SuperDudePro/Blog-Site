import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'did-i-shit-myself',
  title: 'Did I Shit Myself?',
  excerpt: 'A suspicious smell follows an old dad and two kids into the library, where a diaper investigation, two staring babies, and one attractive mother prove almost nothing.',
  section: 'diary',
  publishedAt: '2026-07-22',
  status: 'Recent',
  heroImage,
  heroAlt: 'An older father drives while two young children wave excitedly toward a phone during a call with Grandma.',
  cardImage,
  cardAlt: 'An older father looks awkward in a children’s library while a baby points at him and his two young children play nearby.',
  bodyHtml: `
    <p>There comes a point in every old dad’s life when he smells shit and can no longer automatically blame the toddler. Today was that day.</p>

    <p>I first smelled it while driving to the library. I was talking to my mother for the first time in a while, with Raven and Xander in the back seat yelling, “Hi, Grandma! Hi, Grandma! Hi! Hi! Hi!”</p>

    <p>That was partly why I called her with them in the car. It keeps the conversation from getting too serious. Every few seconds, one of the kids interrupts to say hi, and she has to say hi back. She gets attention, they get to talk to Grandma, and I get credit for calling without having to carry much of the conversation. Everybody wins.</p>

    <p>Somewhere during all the hi-ing, I caught a faint smell of shit. That didn’t necessarily mean anything. One of the kids could’ve farted. The smell could’ve come through the vents from outside. My teenage daughter Alexa maintains a rotating collection of dead food in the back of the car. Still, I made a mental note to check everyone before we went inside.</p>

    <p>When we parked, I could definitely smell something, so I assumed Xander. I pulled the back of his diaper away, looked inside, and smelled around. He wasn’t especially wet, there was no visible shit, and nothing about the close-range investigation suggested he was responsible. I put everything back together and got the kids out of the car.</p>

    <p>Xander insisted that I carry him from the parking lot. On the way toward the library, I could still smell it, which meant it had to be him. I stopped at a ledge outside the building and checked again, this time pulling the diaper away in the back and then checking from the front. Close-range investigation had now cleared Xander twice. That should’ve been good news, but instead it eliminated the obvious suspect.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="An older father checks his toddler son’s diaper on a ledge outside the library." loading="lazy" decoding="async" />
    </figure>

    <p>We went inside. Somewhere in the lobby, before we reached the children’s section, the next possibility occurred to me.</p>

    <p>Maybe it was me.</p>

    <p>That created a logistical problem. How do you check whether you’ve shit yourself while supervising two small children in a public library? I couldn’t leave them alone while I went into the bathroom and conducted a full investigation. I figured I could sit somewhere by myself, away from the car and away from Xander, and see whether the smell followed me.</p>

    <p>I sat down and couldn’t smell anything, but that proved very little. I’m in the middle of summer break, which means I’m half full-time babysitter, half obsessive project worker, and half whatever else I’m supposed to be doing. I don’t always know what day it is, and I couldn’t immediately remember when I’d last showered. I wasn’t confessing. I was acknowledging weaknesses in the investigation.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An older father sits alone in a children’s library chair, thinking through the unresolved smell." loading="lazy" decoding="async" />
    </figure>

    <p>I wasn’t dressed in a way that inspired confidence. I looked the way my dad used to look on a Saturday when he was working outside: old T-shirt and pants that didn’t fit quite right. My beard was reasonably controlled, and my hair only needed a haircut. I hadn’t reached full Christopher Lloyd yet. Altogether, I looked like an old semi-slob who had somehow been placed in charge of two small children.</p>

    <p>Then she came in. Tall, beautiful, maybe thirty-five, with a mixed baby who looked about a year old. The baby noticed me immediately, pointed at me, and tried to get his mother to look. She seemed to understand why he was doing it, like maybe I reminded him of somebody. Maybe his dad. Possibly another old white one.</p>

    <p>I’m sixty-one, but in my head I’m still about thirty-one. So when I see an attractive woman who’s thirty-five, part of my brain thinks she’s approximately my age. In my head, I should have a pretty good shot.</p>

    <p>In reality, I’m twenty-six years older than she is, dressed like I was interrupted while cleaning the garage, sitting with two toddlers, and quietly trying to determine whether I’ve shit myself.</p>

    <p>Pretty soon, I’ll start finding older women attractive—women who are forty-five. In reality, they’ll still be sixteen years younger than I am. I’m maturing, just not on the correct calendar.</p>

    <p>The mother and baby settled into the children’s area. Raven and Xander were playing nearby. At one point, I walked over to tell Xander to share, and the baby turned completely around to watch me walk away. Then he kept staring—not crying or reaching, just staring like he’d seen somebody he knew.</p>

    <p>For a second, I considered the flattering explanation. Maybe I reminded him of his father. Maybe I had one of those faces babies trusted. Maybe there was still something working for me here.</p>

    <p>Then another baby started staring.</p>

    <p>It must be the shit.</p>

    <p>The beautiful mother eventually started gathering her child’s toys. She bent over to pick some up, and I thought, <em>This is outstanding.</em></p>

    <p>Then Xander got my attention. He’d found an older boy willing to humor him through a truck battle. They crashed the trucks together, made engine noises, and the older kid let Xander feel like he’d found a real opponent without taking over or getting rough. It was fun to watch.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A toddler crashes toy trucks with an older boy while his father watches and a mother carrying a baby leaves the library." loading="lazy" decoding="async" />
    </figure>

    <p>When I turned back, the mother and baby were gone. I waited a few minutes before looking around because I didn’t want it to seem like I was looking around. Then I looked around. They were completely gone. I hadn’t seen which way they left, and by then I couldn’t smell it anymore.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="An older father buckles his toddler into the car while his daughter stands nearby asking a question." loading="lazy" decoding="async" />
    </figure>

    <p>In the parking lot, while I was buckling Xander into the car, Raven said, “Hey Dad. What smells?”</p>

    <p>Which proved nothing.</p>
  `,
};

export default post;
