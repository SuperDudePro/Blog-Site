import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImage1 from './body-image-1.webp';
import bodyImage2 from './body-image-2.webp';
import bodyImage3 from './body-image-3.webp';
import bodyImage4 from './body-image-4.webp';

const post: BlogPost = {
  slug: "why-arent-you-complaining",
  title: "Why Aren't You Complaining?",
  excerpt: "I've been called a complainer for most of my life. But I've also fixed a lot of problems. Why aren't more people complaining about what doesn't work?",
  seoTitle: "Why Aren't You Complaining? When Complaints Fix Bad Systems",
  seoDescription: "From a Purdue fraternity to years of teaching, I've learned that complaining can be the first step toward fixing systems everybody else tolerates.",
  section: "advice",
  publishedAt: "2026-10-14",
  status: "Recent",
  heroImage,
  heroAlt: "A frustrated observer stands among desks, files and workers in a chaotic office.",
  cardImage,
  cardAlt: "An enormous heap of office paperwork with a purple pencil across the front.",
  bodyHtml: `
    <p>People have been telling me I complain too much for most of my life. Bosses, coworkers, take your pick. Guilty. But I've always had a question for the people who don't complain. You've been at your company, your school, your office for twenty years. You've been on this planet your whole life. And you're telling me you haven't noticed?</p>
    <p>Why aren't you complaining?</p>
    <p>Things are obviously fucked up, and you've been watching them be fucked up for twenty years. Somehow you don't have a list. I mean the stuff that wastes everybody's time, the stuff nobody can explain, the stuff people walk around every day like a pothole they quit seeing years ago. I can't get through a week without adding to mine, and it drives me fucking crazy that so few people will say theirs out loud.</p>
    <p>When I was nineteen or twenty, I was recording secretary of my fraternity at Purdue, which is about as low as an office gets while still requiring a pen. From down there I could see nobody was really supervising the chapter's smaller offices, so I complained about it. Then I read the bylaws, figured out how an amendment actually got passed, and wrote one creating a second vice president to oversee the minor offices. The chapter approved it. Then I ran for the new job I'd just invented, because nobody knew it better than I did and because I figured it'd be a pretty good road to president. It was. The guys running things knew the problem was real. They just couldn't come up with a good argument against a fix that worked, and they couldn't figure out how to take it away from me either.</p>
    <p>People figured I'd lucked into it. I hadn't. I'd complained and then done the homework.</p>
    <p>I like that guy.</p>
    <figure class="post-figure">
  <img src="${bodyImage1}" alt="A young fraternity officer studies bylaws and handwrites proposed amendments." loading="lazy" decoding="async" />
</figure>
    <p>And it kept going. For a big chunk of my career, complaining and fixing was literally the job. As a business and process analyst, I got paid to figure out why systems didn't do what they were supposed to, chase down problems that had been dragging on for years, and get the people using the software and the people building it to understand each other. I became the guy they handed the broken program to, and I fixed a lot of them. Nobody ever gives the complainer enough credit for that part. I'd get it if there wasn't a string of fixes attached, but there is.</p>
    <figure class="post-figure">
  <img src="${bodyImage2}" alt="A business analyst studies documents, workflow diagrams and software processes." loading="lazy" decoding="async" />
</figure>
    <p>Then I went into teaching, and for more than twenty years that part of me mostly sat on the bench. Teachers don't get handed broken systems to fix. We just get handed the broken systems. Recently I finally got back in the game with a brand-new math course at my school. I saw an opening, talked to the right person at the district early, and planned every step it took to get it approved. It's the first time in a long time I've gotten to work at that level, and it feels damn good. Some coworkers talk about it like it just fell into place. It didn't just fall into place. I spent a lot of time making sure it would, and most places I've worked could use a lot more of that.</p>
    <h2>Hire me to complain</h2>
    <p>Almost every organization I've ever worked for has said it wants continuous improvement, and almost every one of them treated the people pointing out what needed improving like a morale problem.</p>
    <p>So here's my proposal. Make me a school district's official complainer. Hell, I'd even get back into the corporate game for a job like that, but give me a district first. Even better, give me a school. The dysfunction may start at the top, but it's strangling the schools. Let me talk to the teachers, secretaries, custodians, administrators, students and parents who deal with the machinery every day. Some of what I hear will be bullshit, and I'll sort that out too, but a lot of it will be real problems nobody's bothered to fix. A lot of the time the fix is embarrassingly simple. Stop doing the stupid thing. Don't send it to a committee, and don't assemble seventeen stakeholders to discuss whether we should study the possibility of investigating the issue. Pick a problem, agree on what fixed looks like, and let me go.</p>
    <figure class="post-figure">
  <img src="${bodyImage3}" alt="Committee members debate around a conference table buried in paperwork." loading="lazy" decoding="async" />
</figure>
    <p>Then measure it. Count the steps we cut, the hours we saved, the people who stopped cursing at the same form every single year. I guarantee I can find problems worth fixing, I guarantee I can fix a lot of them, and I'll put the job on it. If I don't deliver, I'm out. I'd like to know who else has offered that deal.</p>
    <p>There's one condition. We have to stop covering problems up with lingo and doublespeak and worrying about hurting somebody's feelings. If something's broken because the person in charge of it doesn't know how to do the job, I have to be able to say that out loud. Otherwise the job's a setup.</p>
    <p>The bigger payoff is what happens once the small stupid stuff is gone. Right now the hard things, money and staffing and the questions people genuinely disagree about, are buried under a thousand little irritations, and everybody's too worn out by the paperwork to deal with the real stuff. Clear out the junk and you can actually see what's broken.</p>
    <figure class="post-figure">
  <img src="${bodyImage4}" alt="A steep pile of paperwork and binders sits behind a purple pencil." loading="lazy" decoding="async" />
</figure>
    <p>And I'd bring help. I rewired a fraternity at nineteen with nothing but a copy of the bylaws. Imagine what I'll do with AI. I wouldn't just be bringing my own ideas, either. I'd be bringing the advice and thinking of a lot of brilliant people in that district who've been ignored for a long time.</p>
    <h2>Yes, I can be a pain in the ass</h2>
    <p>I've been collecting evidence on that for about sixty years. I've also been right about a lot of it, and somehow that part never comes up. It's a lot easier to argue about whether I'm annoying than about whether I'm right.</p>
    <p>So yes, I complain too much. I'm also right a lot. Let's start hearing some complaints. We might end up with workplaces people can tolerate and systems that actually fucking work.</p>
    <p>Have you got a problem at work everybody knows about but nobody seems to fix? <a href="https://ourolddad.com/contact">Tell us about it through the contact page.</a></p>
  `,
};

export default post;
