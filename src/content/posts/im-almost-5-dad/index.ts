import type { BlogPost } from '../../postTypes';
import heroImage from './hero.jpg';
import cardImage from './card.jpg';
import scooterSit from './scooter-sit.jpg';
import pointing from './pointing.jpg';

const post: BlogPost = {
  slug: 'im-almost-5-dad',
  title: "I'm Almost 5, Dad",
  excerpt:
    "Raven turned four and went straight to work on five. A walk to the park, an ant hill, and a four-year-old running a goldfish play I didn't see coming.",
  section: 'diary',
  publishedAt: '2026-05-09',
  status: 'Recent',
  heroImage,
  heroAlt:
    'Pencil-and-watercolor illustration of a small girl in a purple helmet crouched on a sidewalk pointing at the dirt next to a purple scooter.',
  cardImage,
  cardAlt:
    'Illustrated portrait of a small girl in a purple helmet crouched beside a purple scooter, pointing at the ground.',
  bodyHtml: `
    <p>Raven turned four and went straight to work on five.</p>

    <p>She started by telling me she was almost ten. I talked her down. We negotiated. She landed on five, which is technically true if you squint at the calendar and accept that her birthday is in the same hemisphere as the current month. So now she tells me, every day, "I'm almost 5, Dad." Sometimes twice. Sometimes she opens with it before I've had coffee.</p>

    <p>I don't push back anymore. I want her doing this. If I had a single wish for any of my kids, it'd be that they keep pushing to be older, to do more, to take on the next thing before I'm ready to hand it over. I don't want kids who hide inside the version of themselves I already understand.</p>

    <p>The trouble is, I have four of them, and they're not all in the same place. The big two are 17 and 18. With them, I'm counting backwards. I love them out loud and I want them gone &mdash; out into their own lives, making the next mistakes that aren't mine to manage. The little ones break me the other direction. Raven announces she's almost five and I want to scoop her up and hold the line at four. Hold it at three. Hold it at the version of her that still falls asleep mid-sentence on the couch with one shoe on.</p>

    <p>I don't get to do that, so I agree with her. Yes, you're almost five. We talk about all the great things she'll get to do at five.</p>

    <p>Raven is a puzzle. Not a hard one &mdash; a good one. She'll say something that lands sideways, and you realize she's been holding that thought for a while, waiting for the rest of us to catch up. She's patient about it. Generous, even. She lets the adults figure it out at adult speed.</p>

    <figure class="post-figure">
      <img src="${scooterSit}" alt="Raven sitting on her pink scooter in a pink helmet, looking down at her hands clasped together in her lap." loading="lazy" decoding="async" />
    </figure>

    <p>Apparently one of the things a five-year-old gets to do is have a goldfish. I don't know who told her this. I don't know where the goldfish goes. I've been a dad long enough to know not to promise anything until I've already been to the store. So when she brings it up, I ask questions. I agree it sounds interesting. I do not commit.</p>

    <p>Sunday we were walking to the park. Raven on her pink scooter, pink helmet, the whole operation. She stopped at her usual ant hill &mdash; she has a usual ant hill &mdash; and crouched down to point at the baby ants.</p>

    <figure class="post-figure">
      <img src="${pointing}" alt="Raven crouched on the sidewalk in a pink helmet next to her pink scooter, pointing down at the dirt near an ant hill and looking up at the camera." loading="lazy" decoding="async" />
    </figure>

    <p>"Baby ants make very good pets, Dad."</p>

    <p>"I'm not sure they make good pets, sweetie."</p>

    <p>"Lots of people have them as pets."</p>

    <p>"I don't think that's true."</p>

    <p>She thought about it. She watched the ants for another second. Then, casual:</p>

    <p>"Yeah, maybe a goldfish would be better."</p>

    <p>She knew where she was going the whole time. The ant hill was a setup. She walked me into the goldfish through the side door, and I didn't see it until I was already standing in it. Four years old. I'm doomed.</p>

    <p>I'll probably only make her wait until summer break. She's earned the goldfish. She earned it with footwork.</p>
  `,
};

export default post;
