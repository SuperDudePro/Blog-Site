import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';

const post: BlogPost = {
  slug: 'supporting-characters',
  title: 'Supporting Characters',
  excerpt:
    'Most people do not get remembered the way the story says they should. A reflection on invisible help, supporting roles, and the hard peace of never knowing which part was yours.',
  section: 'diary',
  publishedAt: '2026-07-11',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Sketch illustration of a lone man walking down a quiet street past a wall painted with the words “Nobody knows. Nobody cares. The light gets carried five feet at a time.” with restrained purple accents.',
  cardImage,
  cardAlt:
    'Sketch illustration of an older man and a child sitting together on a bench overlooking a dense city beneath a tree with purple leaves.',
  bodyHtml: `
    <p>The woman who owned our house before us bought it in the seventies, around the same time my parents bought their escape-from-Chicago house in the suburbs. She's my mother's age now, living in a retirement place somewhere. Every once in a while the next-door neighbor mentions a story from the old days. Otherwise nobody has stopped by to wonder what the hell happened to Betty.</p>

    <p>Fifty years in one house. What remains is an occasional story from the guy next door.</p>

    <p>It's like that everywhere now. I teach, which means I work in a field full of women — the people who are supposed to do the remembering for the rest of us — and even there, nobody remembers you once you're gone. Half the conversations in the workroom are archaeology: what's-his-face, the one who got in the fight with that dick in the science department, was that '22 or '23? Nobody knows. Nobody cares. You give a place twenty years and become a squint and a guess.</p>

    <p>That's hard to sit with, after everything we've been told about being the main character of our own story.</p>

    <p>I had it bad. Main character syndrome, before anybody called it that. The first time I seriously considered that I might not be one, it threw me. Why would I even be here if I wasn't the main character? Even writing this now, I can see how much of my thinking still aims at some kind of worldly success — being the main character is just the loudest version of it. I understand that in one sense there are nine billion main characters walking around. But really — not that many.</p>

    <p>Not everyone can be the main character. Most people aren't. Some carry the light five feet and hand it to somebody who carries it farther. That may be the more common kind of heroism.</p>

    <p>The record doesn't work that way, though. People love the story about their grandpa being the first man to can corn in eastern Colorado. Family history records the man who crossed the ocean and forgets whoever told him where the ship was leaving from. It records the woman who moved to Chicago and forgets whoever watched her baby during the factory shift. It records the kid who made it out and loses every person who kept her alive long enough to leave.</p>

    <p>The help matters more than the clean family story admits. A person can thank you decades later for something you barely remember doing. Maybe you gave them a ride, told them about a job, treated them like they belonged somewhere, or said one ordinary sentence when they were close to giving up. You didn't think twice about it. They talk about it like it changed their life, and you can't understand why it mattered as much as it did.</p>

    <p>You can't understand it because nobody can. The web is real — every ride, every sentence, every hour of attention moves through it — but we're nowhere near intelligent or intuitive enough to trace it. I'm not a theologian. The quiet, still voice is just my clumsy name for something a lot bigger than me — something I've spent most of my life ignoring while I listened for applause. The web doesn't care whether we understand it. We can still move through it with intention.</p>

    <p>That used to be ordinary. There was a time — if it ever really existed — when any adult was free to say something to a kid who was fucking around. I picked the habit back up after a career of teaching. It's natural now to correct anyone kid-age who's acting like an idiot, as long as they don't look like they'll kill me for it. But the thing I'm imitating wasn't really the correcting. It was the knowing. The adults who said something knew you, knew your mother, knew what your family was carrying that month. The correction had standing behind it. The knowing is what's gone. You can't say something to a kid you've never seen before and won't see again, and that's most kids, most adults, most streets. Betty can leave her house of fifty years and the web barely registers it.</p>

    <p>So there are two ways to be satisfied. The satisfied I went after in the last post is the dead kind — settled-for, furniture-comfortable, miserable but not moving. The other kind belongs to people who never thought they were main characters at all. They gave the supporting role everything they had, and once in a while that's exactly what turned one of them into a main character. It doesn't run in reverse. Chasing main character produces pretenders — that's most of politics. Not main characters. Pretenders. The people who feel imposter syndrome and deserve it.</p>

    <p>I learned the difference in an eight-by-eight cell in the Philippines.</p>

    <p>The school I had worked for and quit paid the NBI to put me in jail over some form of libel, and found a judge to go along with it. They came to my house and took me. That's a five-day story, and it will get its own posts. The part that belongs here is the cell: eight feet by eight feet, five other men, and me. They gave me the raised wooden bed because I was the guest. They took care of me. They kept me from losing my mind. When my children came to visit, those men pretended to be my employees so my kids wouldn't have to know their father was in jail.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="Sketch illustration of a spare jail cell with a single raised bed, purple cloth hanging on the wall, and a handwritten sign reading ‘8x8. Five days. Five men. One bed.’" loading="lazy" decoding="async" />
    </figure>

    <p>Most of them were in there for good reasons. The internet would judge every one of them harshly, and the internet wouldn't be entirely wrong. But I was in no position to judge anyone, and stranger than that — I didn't feel like judging anyone. That doesn't happen to me often. Five men with nothing gave the new guy the bed and invented a cover story to protect children they'd never met.</p>

    <p>When I got out, I went to their families — gifts for some, messages carried out for others. And I wanted more than that. It made me want to dedicate my life to people who were stuck the way they were stuck, people in legal trouble with no one to move for them. There aren't a lot of main characters in that kind of work. The ones who show up acting like main characters are frauds, because there's a reason main characters don't go there. Nobody's watching. The light gets carried five feet at a time, in the dark, by people no record will keep.</p>

    <p>That cell is where my question finally fell apart. Why would I be here if I wasn't a main character? Wrong question. For five days I was the main character of the worst story I've ever lived, and it felt nothing like the thing I'd spent my life wanting. What held me together were five supporting characters — carrying a stranger, for nothing anybody would ever record.</p>

    <p>The harder peace came later, when I had to give up the last piece of the fantasy — the piece where I at least get to know what my part is. Maybe my part is Xander. Maybe it's Raven. Maybe it's one sentence I say to a stranger at the right moment, and I never find out, and it was never about my family at all. Those five men will never know what those five days did. That's the deal. You don't get the receipt.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Sketch illustration of an open notebook beside a purple mug, with handwritten lines about maybe being Xander, Raven, or one sentence to a stranger, ending with ‘You don’t get the receipt.’" loading="lazy" decoding="async" />
    </figure>

    <p>The kids don't need money or wisdom to carry light. A smile, a real question, actual interest — a child's attention can make a person feel visible. I just don't want them treating other people as scenery in their adventure. Every interaction changes the web a little, in directions none of us will ever see.</p>

    <p>The inheritance isn't only the right to choose a different life. It's a stake in humanity itself, and the price of holding it is paying it back without ever knowing if you have.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="Sketch illustration of a pair of worn black sneakers with bright purple laces beside a handwritten note that says ‘Take care of each other. Carry the light. –Dad’." loading="lazy" decoding="async" />
    </figure>

    <p>So I'm starting with the only thing that isn't pretending. Taking a little more time to notice the people around me, however that ends up looking. Paying attention, saying the thing, letting it go where it goes. I'll never know if any of it mattered.</p>

    <p>That's not the sad part anymore.</p>
  `,
};

export default post;
