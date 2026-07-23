import type { BlogPost } from '../../postTypes';
import { bodyImageOne, bodyImageThree, bodyImageTwo, cardImage, heroImage } from './images';

const post: BlogPost = {
  slug: 'we-werent-going-to-tell-her-so-soon',
  title: 'We Weren\'t Going to Tell Her So Soon',
  excerpt:
    'Raven recognized me in an old classroom photo. Then she pointed at the twelve-year-old Korean boy beside me and asked if that was her.',
  section: 'diary',
  publishedAt: '2026-07-23',
  status: 'Recent',
  heroImage,
  heroAlt: 'A pencil-sketch portrait of a younger clean-shaven teacher standing with a Korean teenage boy.',
  cardImage,
  cardAlt: 'A close pencil-sketch portrait of a younger teacher with his arm around a Korean teenage boy.',
  bodyHtml: `
    <p>I've been decorating my classroom. One section is built around a Nietzsche poster—the one that starts, "He who has a why..."—with family photos, old student pictures, and photos of me teaching through the years arranged around it. Raven and Xander were helping me put everything together when Raven spotted a picture from around 2010. "Dad, is that you?"</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A four-year-old girl points to an old classroom photo of her father and asks if it is him." loading="lazy" decoding="async" />
    </figure>

    <p>It was. No beard, younger face, dress shirt and tie. Sixteen years ago. Then she pointed to the Korean boy standing under my arm. "Is that me?"</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="An older bearded father says yep as his four-year-old daughter points to the Korean teenage boy in an old photo and asks if it is her." loading="lazy" decoding="async" />
    </figure>

    <p>Every parent likes to believe their kid is exceptionally bright. Then something like this happens and keeps the scouting report honest. Raven is a tiny, tan four-year-old girl with long brown hair. This was a twelve-year-old Korean boy with a bowl cut. They looked absolutely nothing alike. What the fuck do you mean, <em>is that you?</em></p>

    <p>"Yeah," I said. "How could you tell?" She didn't really have an answer. "I didn't think we were going to tell you so soon, but you used to be a small Korean boy."</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="A four-year-old girl protests that she does not want to be a boy while her father tries not to laugh beside the old classroom photo." loading="lazy" decoding="async" />
    </figure>

    <p>"No. I don't want to be a boy."</p>
  `,
};

export default post;
