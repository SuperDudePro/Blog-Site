import type { BlogPost } from '../../postTypes';
import heroDesk from './hero-writing-desk.png';
import patchImage from './dont-be-a-dick-patch.jpg';

const post: BlogPost = {
  slug: 'advice-1-dont-be-a-dick',
  title: 'Hey, Dudes! Advice From an Old Dad, No. 1: Don\'t Be a Dick',
  excerpt:
    "The first rule is not elegant or fancy, but it covers a surprising amount of ground: don't be a dick.",
  section: 'advice',
  publishedAt: '2026-04-27',
  status: 'Starter',
  heroImage: heroDesk,
  heroAlt:
    'A worn wooden desk with a yellow legal pad labeled Advice #1, a pen, reading glasses, a coffee mug, and a small flower doodle.',
  cardImage: patchImage,
  cardAlt:
    'An embroidered circular patch with a smiling flower and the words “DON’T BE A DICK.”',
  bodyHtml: `
    <p>Hey, dudes,</p>
    <p>If I’m going to do this, I should probably do it honestly.</p>
    <p>That’s harder than it sounds.</p>
    <p>It’s easy to be honest when you can hide behind a joke, or make yourself sound better than you are, or sand down the rough spots. It’s a lot harder to say things straight. I’ve got plenty of flaws, and if I’m not careful, they can take up more of the story than they should. Still, if I’m going to write to you, I don’t want to fake my way through it. So I’m going to try to tell the truth, even when it makes me look less polished than I’d like.</p>
    <p>Here’s one truth right away: I worry about how much time I’ll get with you.</p>
    <p>My dad died when he was 53. My youngest sister was 16. I’m older now than he ever got to be, and you two aren’t even here yet. That does something to a man’s mind. It makes time feel precious, and a little loud. Part of the reason I’m writing this stuff down is because I want there to be something here for you someday. And if I’m lucky, really lucky, you’ll read this while I’m still around and still sharp enough to talk with you about it. If that happens, remind me how badly I wanted that.</p>
    <p>You’re coming into a family with a lot of love in it.</p>
    <p>You’re also coming into a family with a pretty solid history of getting things wrong.</p>
    <p>Your brother and sister got the full first-draft version of us as parents. They got the love, but they also got the trial and error. They got the parts where we were figuring it out in real time. So in some ways, getting the chance to raise you feels like a gift. A second shot. A chance to do some things better.</p>
    <p>Of course, it also means I could make a whole new set of mistakes.</p>
    <p>That’s parenting. You try. You fail. You love hard. You hope the love covers more than the failures damage. You keep going.</p>
    <p>When I think about what I really want for you, it comes down to something simple: I hope you learn to listen to that quiet voice inside you. The one that usually knows better. The one that tells you when something is off, when something is right, when you’re about to cross a line, when you’re lying to yourself, when you need to be brave, and when you need to stop.</p>
    <p>I’m still learning how to listen to that voice myself. Maybe we can work on it together. Maybe you’ll even end up teaching me.</p>
    <p>I’m going to try to pass along what I’ve learned, most of it gathered the hard way, because that seems to be my specialty. You’ll make your own mistakes. You should. That’s part of being alive. But you don’t have to make every mistake from scratch. Human beings have been getting things wrong for a very long time. It’s okay to borrow a little wisdom and save yourself some wear and tear.</p>
    <p>So here’s the first piece of advice.</p>
    <p>It’s not elegant. It’s not fancy. But it covers a lot of ground.</p>
    <p><strong>Don’t be a dick.</strong></p>
    <p>That may sound like a joke, but I mean it.</p>
    <p>One day your sister Alexa and I were at Caribou Coffee, and they had one of those chalkboards up asking people to share a piece of advice. Alexa didn’t hesitate. She wrote: <strong>“Don’t be a dick.”</strong></p>
    <p>Her explanation was about as good as the advice itself. She said, basically: if there’s nothing else you can manage, at least manage that. The world does not need one more person acting like a dick. So don’t do it.</p>
    <p>That’s pretty solid. Honestly, it may be better than most of what you’ll hear dressed up in nicer words.</p>
    <figure class="post-figure">
      <img src="${patchImage}" alt="Embroidered circular patch with a smiling flower and the words DON’T BE A DICK." />
      <figcaption>These are real patches. I borrowed the image from the place selling them. No endorsement. I just think it says what it needs to say, and I kind of want one.</figcaption>
    </figure>
    <p>A lot of life can be cleaned up if you start there.</p>
    <p>You don’t always have to be brilliant.</p>
    <p>You don’t always have to be first.</p>
    <p>You don’t always have to win.</p>
    <p>You don’t always have to say the thing that pops into your head.</p>
    <p>You don’t always have to make yourself the center of every room.</p>
    <p>But at the very least, try not to make life worse for the people around you.</p>
    <p>Try not to be cruel when you could be decent.</p>
    <p>Try not to be selfish when you could be generous.</p>
    <p>Try not to be careless with other people’s dignity.</p>
    <p>Try not to turn every bad mood into everyone else’s problem.</p>
    <p>You’ll know when you’re drifting in the wrong direction. Most of the time, people do know. They just hope they can get away with it. That quiet inner voice usually speaks up before the damage is done.</p>
    <p>Listen to it.</p>
    <p>And if you don’t, don’t worry. Your brother and sister will probably be happy to point it out.</p>
    <p>If there’s only one thing you remember from this first little talk, let it be this: put some real effort into not being a dick. It won’t solve every problem, but it will keep you out of a surprising number of them.</p>
    <p>And that’s not a bad place to start.</p>
    <p>Love,<br />Dad</p>
  `,
};

export default post;
