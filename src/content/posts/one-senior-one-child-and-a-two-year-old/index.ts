import type { BlogPost } from '../../postTypes';
import heroImage from './hero-image.webp';
import cardImage from './card-image.webp';
import bodyImageOne from './body-image-1.webp';
import bodyImageTwo from './body-image-2.webp';
import bodyImageThree from './body-image-3.webp';
import bodyImageFour from './body-image-4.webp';

const post: BlogPost = {
  slug: 'one-senior-one-child-and-a-two-year-old',
  title: 'One Senior, One Child, and a Two-Year-Old',
  excerpt: 'At sixty-one, taking a four-year-old and a two-year-old to the pool gives strangers a small social problem to solve.',
  section: 'diary',
  publishedAt: '2026-07-23',
  status: 'Recent',
  heroImage,
  heroAlt: 'An older father with a preschool daughter and toddler son at a public pool counter while a clerk pauses over the admission total.',
  cardImage,
  cardAlt: 'An older father at a pool counter raises one finger as his daughter looks ready to interrupt and his toddler watches the clerk.',
  bodyHtml: `
    <p>When I take Raven and Xander to the pool, I can decide how much confusion I feel like dealing with before I even reach the counter.</p>

    <p>If I don’t have the patience for any of it, I say, “One regular adult, one child, and the other one is two.”</p>

    <p>That tells them exactly what to charge. Xander is free. Raven is a child. I pay the regular adult price. We can all move on with our lives.</p>

    <p>If I know the person has given me the discount before, I say, “One senior, one child, and the other one is two.”</p>

    <p>That version sometimes creates a pause.</p>

    <p>They look at me. They look at Raven and Xander. Then they come back to me.</p>

    <p>I’m old enough for the senior discount.</p>

    <p>I’m also their dad.</p>

    <p>Those two facts don’t always fit together on the first try.</p>

    <p>If I don’t tell them which ticket I want, they occasionally have to ask my age. This creates another problem, because apparently we’re allowed to set prices according to age but aren’t allowed to ask anyone how old they are.</p>

    <p>“Well, if you don’t mind me asking…”</p>

    <p>I don’t mind. I’m sixty-one. It isn’t my PIN.</p>

    <p>Sometimes they ask. Sometimes they give up and charge me the full adult price. Sometimes they remember that they gave me the discount the day before but still seem unsure whether I could have aged into or out of it overnight.</p>

    <p>Teenagers usually ask directly or make an immediate decision. They don’t care enough to turn it into a social problem. People in their forties seem more cautious, perhaps because they can see the border approaching and don’t want anybody asking too many questions when they get there.</p>

    <p>I used to let the whole thing play out because I enjoyed it. Now that we go to the pool all the time, I usually tell them what to do. There are only so many times a week I need to watch somebody solve me.</p>

    <p>The same calculation happens anywhere people take children.</p>

    <p>At Elitch Gardens, we were standing in line for the merry-go-round when an older woman told me my grandchildren were adorable.</p>

    <p>I said thank you.</p>

    <p>There was no reason to correct her. They are adorable.</p>

    <p>A few seconds later, Raven came over, hugged me, and called me Dad. She probably said it more than once. Little children don’t preserve ambiguity for long.</p>

    <p>The woman stopped me.</p>

    <p>“Oh, I’m sorry. I heard her call you Dad. I just assumed.”</p>

    <p>I laughed and told her not to worry about it. She had been friendly, made a reasonable guess, received new information, and corrected it.</p>

    <p>I had also enjoyed watching the correction happen.</p>

    <figure class="post-figure">
      <img src="${bodyImageOne}" alt="A little girl hugs her older father beside a carousel while an older woman realizes the children are his, not his grandchildren." loading="lazy" decoding="async" />
    </figure>

    <p>I can see the calculation, but I can’t read the transcript.</p>

    <p>Some people avoid choosing a title at all.</p>

    <p>“Good for you, having them out today.”</p>

    <p>That could mean I’m a wonderful grandfather giving the parents a break.</p>

    <p>“Are these yours?”</p>

    <p>Still open.</p>

    <p>“Are you Dad?”</p>

    <p>That’s probably the safest option. If I’m Grandpa, I can correct it without much damage. If I’m Dad, they’ve managed to land on the less obvious answer.</p>

    <p>When I was around twenty-five, my grandmother lived in Brooksville, Florida, with her third husband. She had started as a poor tenant-farm girl in a huge family and ended up financially comfortable. Her circumstances had traveled a lot farther than her ideas about what was normal.</p>

    <p>She and her husband knew everything about everybody in their neighborhood. Whenever I visited, they could point at a house and give me a complete report on people I had never met and would never meet.</p>

    <p>Across the street lived an older man with a younger wife and two young children.</p>

    <p>My grandmother and her husband had spoken to him one day and referred to the children as his grandchildren.</p>

    <p>“No,” he told them. “Those are my kids.”</p>

    <p>They saved that story for me.</p>

    <figure class="post-figure">
      <img src="${bodyImageTwo}" alt="A grandmother points across the street while telling her husband and twenty-five-year-old grandson about an older father with a younger wife and two children." loading="lazy" decoding="async" />
    </figure>

    <p>“Can you believe that, Bill?”</p>

    <p>Honestly, I could.</p>

    <p>The wife didn’t look shockingly young. They just looked like there was an age gap. I didn’t think the situation was especially scandalous.</p>

    <p>I did think my grandmother was being a little judgmental for a woman who, in 1935, had married a twenty-seven-year-old when she was seventeen.</p>

    <p>I didn’t say that.</p>

    <p>I acted surprised and mildly scandalized because that was the response the story required, and it kept us from having a deeper conversation about why exactly this man’s family was anybody’s business.</p>

    <p>Now I’m the man across the street.</p>

    <figure class="post-figure">
      <img src="${bodyImageThree}" alt="An older father walks hand in hand with his young daughter and toddler son while two neighbors watch from across the street." loading="lazy" decoding="async" />
    </figure>

    <p>Maybe I even became that man to shock my grandmother in the afterlife.</p>

    <p>Tomorrow at the pool, I’m going to stop making it easy.</p>

    <figure class="post-figure">
      <img src="${bodyImageFour}" alt="A pool clerk pauses over the register while an older father, his young daughter, and toddler son wait for their admission total." loading="lazy" decoding="async" />
    </figure>

    <p>“One senior, one child, and a two-year-old.”</p>

    <p>Then I’m going to wait.</p>

    <p>Raven will probably ruin it before they finish.</p>

    <p>Has anyone ever confidently assigned you the wrong role in your own family? <a href="https://ourolddad.com/contact">Let us know through the contact page.</a></p>
  `,
};

export default post;
