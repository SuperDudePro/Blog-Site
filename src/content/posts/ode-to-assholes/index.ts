import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImage1 from './body-image-1.webp';
import bodyImage2 from './body-image-2.webp';
import bodyImage3 from './body-image-3.webp';
import bodyImage4 from './body-image-4.webp';

const post: BlogPost = {
  slug: 'ode-to-assholes',
  title: 'Ode to Assholes',
  excerpt: 'Sometimes an asshole does you a favor by making you leave. I only had to cross a couple of ball fields to find somewhere better.',
  seoTitle: "Ode to Assholes: When Bad Coworkers Push You Somewhere Better",
  seoDescription: "Sometimes the assholes in one place do you a favor by making you leave. This time, the better place was only a couple of ball fields away.",
  section: 'diary',
  publishedAt: '2026-10-14',
  status: 'Recent',
  heroImage,
  heroAlt: 'A man crosses baseball and softball fields between a darker PK–8 school and a brighter high school.',
  cardImage,
  cardAlt: 'A man with a purple-accented backpack walks away from an angry group of gesturing people.',
  bodyHtml: `
    <p>Some people make your life better by helping you. Others do it by being such assholes that leaving becomes the only reasonable option.</p>
    <p>I seem to have benefited from more of the second group than I care to admit.</p>
    <p>And they're everywhere. Bosses, coworkers, boyfriends, girlfriends, roommates, neighbors, classmates. Sometimes it's somebody you've known for years. Sometimes it's somebody you barely know. Sometimes they make a situation so miserable that leaving starts looking pretty damn attractive.</p>
    <p>In this particular encounter with an asshole, the asshole happened to be at work.</p>
    <p>I've never been particularly good at staying somewhere I'm miserable. Maybe I've left jobs too easily. The calculation is different when you're a father and a decision affects more than just you, and I know that. But when I look back at the places I've left, I have a hard time remembering one I wish I'd stayed in.</p>
    <p>After coming back from the Philippines, I'd somehow ended up teaching middle school, even though I'd taught high school before and knew I preferred it. And for whatever reason, I just kept following that path. I wasn't really thinking about going back to high school. I was thinking about finding a better middle school.</p>
    <p>So in the summer of 2020, I moved to a new PK–8 school. It seemed like a better place to work, and I could bring my kids with me, which was a pretty big deal. I had every reason to think it was a good move.</p>
    <p>There's something about a new beginning that I absolutely love. A new job, a new place to live, a new city, a new relationship, whatever it might be. There's almost a smell to it, a taste, a feeling in the air. Everything seems full of possibility. You haven't discovered what's wrong with the place yet, or which people are going to make your life miserable. All you know is that something new is starting, and you can't wait to see what happens.</p>
    <p>That's how I felt when I walked into that PK–8 school. I couldn't wait to get started.</p>
    <figure class="post-figure">
  <img src="${bodyImage1}" alt="A man steps through an open doorway into a sunlit landscape, excited by a fresh beginning." loading="lazy" decoding="async" />
</figure>
    <p>Now, granted, this was COVID. Schools were trying to figure out how to function while the rules changed every other day. Nobody knew what the hell they were doing half the time, and I don't think it's fair to judge people too harshly for struggling through that mess. You have to give them some slack.</p>
    <p>But even allowing for all of that, these people were still fucking assholes. More than usual.</p>
    <p>Eventually, the same building I'd been so excited to walk into became a place I dreaded going every morning.</p>
    <figure class="post-figure">
  <img src="${bodyImage2}" alt="A weary figure walks down a long, empty school hallway whose gray atmosphere feels oppressive." loading="lazy" decoding="async" />
</figure>
    <p>By the end of that year, I was finished. I wasn't going to make a career out of proving how much misery I could tolerate.</p>
    <p>The funny part is how little distance it took to leave.</p>
    <p>The PK–8 school and the high school are at opposite ends of the same campus. There are baseball and softball fields between them. I went from one building to the other, back to teaching high school, which was what I'd wanted to do in the first place. I didn't need some grand reinvention. I needed to get across the fields.</p>
    <figure class="post-figure">
  <img src="${bodyImage3}" alt="A man crosses a school baseball field past the backstop toward the high school in the distance." loading="lazy" decoding="async" />
</figure>
    <p>I'm not going to pretend the people who drove me away were secretly doing something noble. They were being assholes. I happened to do something useful with the situation they created.</p>
    <p>And before anybody gets the idea that I'm somehow exempt from all this, I'm not. I've been the asshole plenty of times myself. I'm sure there are people out there who could write a pretty good ode to me.</p>
    <figure class="post-figure">
  <img src="${bodyImage4}" alt="A scruffy man stares into a bathroom mirror at his own exaggeratedly angry reflection." loading="lazy" decoding="async" />
</figure>
    <p>But this isn't their ode. This one's mine, and it's dedicated to those particular assholes at that particular school. I doubt they'd recognize it as a thank-you. That's fine. They don't need the satisfaction.</p>
    <p>I can still look across those fields at the building where I spent that year. It's right there.</p>
    <p>I still don't want to go back in.</p>
    <p>But I'm pretty damn glad you pushed me across the fields.</p>
    <hr />
    <p>And if I've ever been the asshole in your story, I'd love to hear about it. Seriously. <a href="https://ourolddad.com/contact">Write and tell me about it.</a></p>
    <p>Who knows? Maybe I deserve an ode of my own.</p>
  `,
};

export default post;
