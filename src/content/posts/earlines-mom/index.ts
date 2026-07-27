import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImage1 from './body-image-1.webp';
import bodyImage2 from './body-image-2.webp';
import bodyImage3 from './body-image-3.webp';
import bodyImage4 from './body-image-4.webp';

const post: BlogPost = {
  slug: 'earlines-mom',
  title: "Earline's Mom",
  excerpt:
    "A child’s memory, a train fantasy, and the realization that I’m a lot closer to the old woman’s chair than to being young on Pearl Street.",
  section: 'diary',
  publishedAt: '2026-04-24',
  status: 'Recent',
  heroImage,
  heroAlt: 'An elderly woman gently raises one hand toward a frightened girl while three wide-eyed children watch from a farmhouse doorway.',
  cardImage,
  cardAlt: 'A sixty-year-old man sits alone in a parked pickup while a European train conversation appears in the passenger-window reflection.',
  bodyHtml: `
<p>I’m on a train somewhere in Europe. Not actually. I’m in a pickup truck in Aurora, Colorado, sixty years old, half thinking about grading something I do not care about. But in my head I’m on a train, and there’s a woman across the aisle, and we are about to have the conversation that changes everything.</p>
    <p>Inside the fantasy, age drops out. I’m just the guy across from her.</p>
    <p>And then I remember I’m in a truck, and nobody’s across from me.</p>
    <p>When I was eight or nine, my parents sent us to stay with relatives we barely knew: my dad’s uncle Bob and his wife Earline, out in Normal, Illinois. Flat farm country. Nothing to do. The cover story was that we were supposed to go see how they lived. My guess is my parents needed us gone for a night. We never asked why.</p>
    <figure class="post-figure">
      <img src="${bodyImage1}" alt="Three children carrying overnight bags approach a relative’s farmhouse in flat Illinois farm country." loading="lazy" decoding="async" />
    </figure>
    <p>Earline’s mother lived with them. Ninety-something. Slouched in a chair in the corner of a room that smelled like dust and menthol, a few stages short of puddling.</p>
    <p>We walked in. Introductions. You remember Grandma, whatever they called her. And every kid in the room had the same silent scream: <em>Please don’t make me kiss that.</em></p>
    <figure class="post-figure">
      <img src="${bodyImage2}" alt="A younger girl freezes as an adult gently encourages her toward a very elderly woman seated just outside the frame." loading="lazy" decoding="async" />
    </figure>
    <p>I think it was my sister who froze. She was younger. They nudged her forward. Go on. Give her a kiss. My sister locked up.</p>
    <p>And the old woman waved her hand. Not hurt. Not performing anything.</p>
    <p>“No, no. It’s okay. They’re scared of us by this stage.”</p>
    <figure class="post-figure">
      <img src="${bodyImage3}" alt="The elderly woman gently waves away the request for a frightened young girl to kiss her." loading="lazy" decoding="async" />
    </figure>
    <p>She let my sister off the hook. I don’t know if it cost her anything at all by then. I knew her for maybe forty hours, and she has been taking up an unreasonable amount of room in my head ever since.</p>
    <p>I think about her every ten years or so. No warning.</p>
    <p>This time it was a podcast — Kim Krizan doing a Q&amp;A about writing <em>Before Sunrise</em> with Richard Linklater. She was describing a walk they took together, to a convenience store and back, just talking. And she said something that stuck: when you get lost in a conversation like that, you start giving the place credit for what was really happening between two people.</p>
    <p>I used to live at 6th and Pearl in Boulder. Lolita’s, the deli, is on 9th and Pearl. Dot’s Diner used to be right there too — gone now, thirty years. And I had nights, summer nights, where the air was exactly skin temperature, where you could walk outside wearing almost nothing and feel like you were stepping into water that wasn’t there. In love, on a perfect night.</p>
    <p>I’ve gone back. The streets are the same. Lolita’s is still there. The night can still be warm and quiet except for the chirps and hums of insects. But the weightless feeling isn’t. It lived in being young and in love in Boulder, and you can’t get back to the second part by visiting the first.</p>
    <figure class="post-figure">
      <img src="${bodyImage4}" alt="An older man looks down a warm, nearly empty Pearl Street as a younger couple walks into the remembered distance." loading="lazy" decoding="async" />
    </figure>
    <p>That is when the train fantasy kicks in. If the feeling wasn’t in the place, maybe it was in the setup: a stranger, a train ride, a conversation.</p>
    <p>But the fantasy only works because nobody in it is real. I’m not real — I’m me with the years edited out. And the woman across from me isn’t real either. She has no history and no version of this running in her own head. She is just there to make the scene work.</p>
    <p>I’m closer to Earline’s mother’s chair than I am to Pearl Street.</p>
    <p>I was halfway into the fantasy when I remembered where I was. Pickup truck. Aurora. Sixty. Nobody across from me.</p>
    <p>I’m the one the kids don’t want to hug.</p>
    <p>I still don’t want to kiss Earline’s mom, no matter how philosophical it gets.</p>
  `,
};

export default post;
