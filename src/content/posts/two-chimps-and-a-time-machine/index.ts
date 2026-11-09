import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';

const post: BlogPost = {
  slug: 'two-chimps-and-a-time-machine',
  title: 'Two Chimps and a Time Machine',
  excerpt: 'What if a chimp met other chimps two thousand years in the future? And what if we tried that same experiment with humans?',
  section: 'diary',
  format: 'junk-drawer',
  publishedAt: '2026-11-09',
  status: 'Recent',
  heroImage,
  heroAlt: 'A puzzled chimpanzee watches four others behaving in unfamiliar ways in a forest clearing.',
  cardImage,
  cardAlt: 'A skeptical chimp watches another chimpanzee drink tea from a china cup, thinking this guy is crazy.',
  bodyHtml: `
    <p><em>The Junk Drawer</em></p>
    <p>I was wondering the other day what would happen if you put a chimpanzee in a time machine.</p>
    <p>Let's say you take a chimp from somewhere deep in an African forest and transport him a thousand years into the future. Or two thousand. Put him back in a forest that hasn't been encroached upon by humans. No roads, buildings, farms, or anything else to give away the fact that time has passed.</p>
    <p>Would he notice anything different? Would he look around at the other chimps and think, <em>What the fuck happened to you guys?</em> Or would it just be a bunch of chimps basically just chimping around?</p>
    <p>Now try the same thing with humans.</p>
    <p>Take a person from today and a person from a thousand years ago. Have them enter the same forest from opposite directions. No technology or anything around them to establish what century they're in. Just two people meeting each other.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="Two ordinary men separated by a thousand years stare at each other in mutual bewilderment in a forest clearing." loading="lazy" decoding="async" />
    </figure>
    <p>I have a feeling that encounter would be pretty fucking strange.</p>
    <p>They might not even speak anything resembling the same language. But that's part of what's interesting. Maybe they'd just assume the other person was some weirdo from somewhere else. The language barrier might actually make it harder to recognize just how different they were.</p>
    <p>But what about everything else? Their behavior, their expectations, the way they understood other people, what they thought was normal. Would they recognize each other as basically the same sort of person, or would both of them be wondering what the hell was going on?</p>
    <p>We read stories about people who lived hundreds or thousands of years ago, and we tend to imagine they're pretty much like us, only without modern technology. Different clothes, different circumstances, but essentially the same people.</p>
    <p>I'm not so sure.</p>
    <p>And maybe I'm being unfair to the chimps. Apparently, chimpanzees have their own cultures, traditions, and ways of doing things that differ between communities. So perhaps a chimp from two thousand years ago would find the modern chimps just as bizarre as I'd find somebody from the year 26.</p>
    <p>Or maybe they'd all just be chimping.</p>
    <p>I don't know. I haven't gotten much further than that. But I like the question, and I'm going to throw it in the drawer until I feel like messing with it again.</p>
    <p>Would either pair notice that something was off, or would everybody just assume they'd met a weirdo? <a href="https://ourolddad.com/contact">Let me know through the contact page.</a></p>
  `,
};

export default post;
