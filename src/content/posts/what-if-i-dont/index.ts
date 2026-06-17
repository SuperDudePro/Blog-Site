import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';

const post: BlogPost = {
  slug: 'what-if-i-dont',
  title: "What if I don't?",
  excerpt: "A podcast let the doubt back in, and the fear finally turned over: leaving wasn't the gamble. Staying was.",
  section: 'life-education',
  publishedAt: '2026-06-17',
  status: 'Recent',
  heroImage,
  heroAlt: 'A father and two children walk from a dark classroom toward an open door, with fear questions written on the walls.',
  cardImage,
  cardAlt: 'A broken leash and chain on dark wood beside the words The leash was never on the kids.',
  bodyHtml: `
    <p>I was just listening to a podcast — the Self-Directed one, the October episode with Tim Eaton — when someone said out loud the thing I'd only started to let seep in. They were talking about the ordinary fear underneath all of it: that you're doing the wrong thing. That it won't work out. That it'll end badly, and it'll be on you.</p>
    <p>And it caught me flat, because I'd stopped asking. I'd let myself get so convinced this was the right way that I quit pressure-testing it. Somewhere in there I'd traded "am I sure?" for "I'm sure," and never noticed the swap.</p>
    <p>So the questions came back all at once. Was I fucking this up? Was I about to wreck my kids' lives so that I could get out?</p>
    <p>Right then the whole fear turned over, and I don't think it's turning back.</p>
    <p>Because here's what I realized once I let the doubt back in. The fear was never about leaving. It's what if I don't. What if I already know the system is the worse deal for them — know it cold — and I keep them in it anyway, because walking out scares me more than staying does. And then they get shaped by the exact thing I had the keys to walk them out of, and I'm the reason.</p>
    <p>The fear keeps the same questions ready. <em>What if you ruin them? What if they fall behind? What if they end up helpless?</em> Every one of those points the danger outward, past the door, into the dark. None of them asks the honest one. What if the danger's in here, and I already know it?</p>
    <p>So I made myself answer the two questions I usually skip.</p>
    <p>First one: if I love these kids without conditions and actually do the work, what's the worst that can happen that's inside my control? Horrible things exist in the world, sure — that's not what I mean. I mean the realistic downside, the one I'm actually choosing. With unconditional love, attention, stability, and a point to all of it, and me not being a careless idiot about it, that downside collapses fast once you say it out loud. Love and presence and steady correction kill most of the worst-case scenarios before they're ever real. And when something does go sideways — it always does — it's usually fixable.</p>
    <p>The fear wants to dress leaving up as one irreversible door: stay safe, or fall straight into permanent damage. That's not how any of this works. That's a control story.</p>
    <p>Second one, and this is the one that exposes the bullshit: if I give them more room to shape their own path, what actually goes wrong? People talk like the day you step away from school your kid turns into a helpless creature with no future. Look around and be honest. Plenty of people barely did school in any real sense and still built a normal life — a job, a trade, rent paid, food on the table, dignity intact. Even if I botch chunks of the plan, even if we hit messy seasons and wrong turns and full resets, how far off the rails does this really go when the kids are loved and supported and moving somewhere that's actually theirs?</p>
    <p>Not far. Worst case isn't ruin — it's friction. Detours, a gap to backfill, the longer road. The GED's still there, and so are trades, apprenticeships, community college, the military, work — the whole messy menu of ways a person builds a life.</p>
    <p>That's when it landed. The thing I'd been calling the gamble — leaving — was never the gamble. Staying is. The high-stakes feeling I kept pinning on the exit was only ever the fear of the exit. And the system runs on exactly that fear. It needs you a little scared to keep you in the building.</p>
    <p>So here's where I actually am. I'm not afraid of leaving anymore. I'm afraid of the other version — the one where I knew, and stayed anyway, because leaving asked more of my nerve than staying did. That's the one I can't undo. Not a messy season. Not a backfilled gap. Years of my kids shaped by a thing I'd already decided was wrong for them, held in place by nothing but my own flinch.</p>
    <p>That's the trap. Not the leaving. The flinch.</p>
    <p>It sold itself to me as a guardrail — the thing keeping all of us safe on the road. Turns out it's a leash. And the leash was never on the kids.</p>

    <p class="post-footer-note"><em>I'm writing this out as I go — here, and over at <a href="https://lifeeducation.org" target="_blank" rel="noreferrer">LifeEducation.org</a>.</em></p>
  `,
};

export default post;
