import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImageOne from './body-image-1.webp';

const post: BlogPost = {
  slug: 'the-cloud-is-just-another-box',
  title: 'The Cloud Is Just Another Box',
  excerpt: "A box of printed photos became a cloud of digital ones. Somehow I've ended up with the same job all over again.",
  section: 'diary',
  format: 'junk-drawer',
  publishedAt: '2026-11-07',
  status: 'Recent',
  heroImage,
  heroAlt: 'An overflowing box of printed family photographs sits beside a laptop filled with digital photo thumbnails.',
  cardImage,
  cardAlt: 'A worn cardboard box packed with old printed family photographs, with a few more pictures scattered beside it.',
  bodyHtml: `
    <p><em>The Junk Drawer</em></p>
    <p>Years ago, I had a box of printed photographs that I was finally going to sort through. Separate the wheat from the chaff, keep what was worth keeping, and get rid of the rest.</p>
    <p>That project did give us <a href="https://ourolddad.com/post/little-tommy">Little Tommy</a>, so there was that.</p>
    <p>I was thinking about it again and realized I've got the exact same problem now. Only the box is the cloud.</p>
    <p>My grandparents had a photo or two. I've got thousands. Probably tens of thousands. I don't have time to sort through them, much less decide what to keep. But I keep adding to the pile anyway.</p>
    <p>It's another task that makes me feel like a rat in a cage.</p>
    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A rat sits in a cage between an old photograph box and a laptop spilling digital pictures." loading="lazy" decoding="async" />
    </figure>
    <p>At least the old box had a bottom.</p>
    <p>Do you ever actually go back through your digital photos, or just keep adding to the pile? <a href="https://ourolddad.com/contact">Let me know.</a></p>
  `,
};

export default post;
