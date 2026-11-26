import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import bodyImage1 from './body-image-1.webp';
import bodyImage2 from './body-image-2.webp';
import bodyImage3 from './body-image-3.webp';
import bodyImage4 from './body-image-4.webp';

const post: BlogPost = {
  slug: "building-a-personal-operating-system",
  title: "Building a Personal Operating System",
  excerpt: "We're building AI-assisted personal operating systems at three very different stages of life: early childhood, the beginning of adulthood and sixty years in.",
  section: "life-education",
  publishedAt: "2026-11-26",
  status: "Recent",
  heroImage,
  heroAlt: "A workbench with childhood toys, a laptop and decades of records connected by a purple cord.",
  cardImage,
  cardAlt: "Three generations of hands work in three notebooks with symbols for childhood, adulthood and life planning.",
  bodyHtml: `
    <p>I'm building something for my kids that I wish somebody had started building for me a long time ago.</p>
    <p>Over the last year or so, I've been using AI to help organize and manage more and more of my life. What started as a bunch of separate projects has gradually turned into a system I call Wilbert. My finances, health, teaching, writing, retirement plans and the education of my kids are all in there, and increasingly, those projects are working together.</p>
    <p>Somewhere along the way, I started wondering what a system like this might look like for somebody who didn't already have sixty years' worth of shit to sort through.</p>
    <p>We're now building these systems at three very different stages of life.</p>
    <h2>The old guy</h2>
    <p>Mine is by far the most complicated. Part of that is because I've got so many things going on, but a lot of it is because I'm constantly going backwards to organize stuff that should've been organized years ago.</p>
    <p>I was pretty damn convinced from the beginning that all of this should be possible. We went down one road after another, some of which were dead ends and some of which just aren't workable yet. It took me a while to come to terms with the fact that we were going to have to build around what AI could actually do at any given time rather than what I thought it ought to be able to do. We'll keep building and rebuilding pieces of it as the technology catches up.</p>
    <p>I've spent an absurd amount of time figuring out where to keep information, how to keep it updated, how to get my projects talking to one another and how to make sure I don't lose everything I've built.</p>
    <figure class="post-figure">
  <img src="${bodyImage1}" alt="An older man works at a computer surrounded by notebooks and crossed-out diagrams." loading="lazy" decoding="async" />
</figure>
    <p>One of the more interesting things that's come out of this is how often I'm making connections between things I've been working on independently for years. Something I'm doing in my classroom gives me an idea for LifeEducation, which gets me thinking about what I'm doing with my own kids, which sometimes sends me right back to what I'm doing in the classroom.</p>
    <p>That used to happen occasionally. Now it seems to happen almost daily.</p>
    <h2>Adult Boot Camp</h2>
    <p>Alexa is at the other end of her adult life. We're going to spend some time doing what I've been calling Adult Boot Camp.</p>
    <p>She's going to have to learn to deal with doctors, insurance companies, banks, employers, taxes, car maintenance and all the other stuff that suddenly becomes her problem. We're going to build her a starter version of her own personal operating system as we work through those things. She already uses AI, so we're not starting from scratch.</p>
    <figure class="post-figure">
  <img src="${bodyImage2}" alt="A young adult studies her laptop beside keys, a calculator and paperwork." loading="lazy" decoding="async" />
</figure>
    <p>What really interests me about this is when the learning takes place. When she gets a job that offers a retirement plan, what better time to learn about retirement plans? She's got an actual decision to make about her own money.</p>
    <p>As a teacher, I'd love to be able to teach kids things at the point in their lives when they actually give a damn about them. Try doing that with thirty kids in a classroom, all at different stages of their lives and interested in completely different things.</p>
    <p>We may finally have a practical way to do some of that.</p>
    <p>I'm curious to see what Alexa's system could become if she keeps adding to it over the next forty or fifty years. Unfortunately, I'll be long dead by then, so I guess I'll have to settle for getting her started.</p>
    <h2>The little ones</h2>
    <p>With Raven and Xander, I get to start much earlier. They're too young to do much with any of this, but there's no reason I can't start organizing their information now. Their medical histories, educational experiences, interests and the things we're learning about each of them as they grow up.</p>
    <p>As they get older, they can start using what we've put together and adding to it themselves.</p>
    <p>Say one of them wants to buy something. How much money have they got? How much more do they need? How long will it take them to save it? There's a whole bunch of math and personal finance we can get into right there, and nobody has to invent a word problem. It's their money and something they actually want.</p>
    <figure class="post-figure">
  <img src="${bodyImage3}" alt="Two small children count stacks of coins beside a piggy bank and toy truck." loading="lazy" decoding="async" />
</figure>
    <p>Little by little, I'd like to turn more of the responsibility over to them. By the time they're Alexa's age, they could already have years of experience managing a system of their own.</p>
    <p>I'm trying to give them a head start on something I'm just figuring out at sixty.</p>
    <h2>Let's see where this goes</h2>
    <p>We're working on all three of these things at the same time, so I'm going to write about them as we go. I'll get into what we're collecting for the little ones, how Adult Boot Camp is going with Alexa and how I've put Wilbert together.</p>
    <p>You'll also get to hear about the stuff that doesn't work. I've already gone down some pretty ridiculous rabbit holes building my own system, and I'm sure there are more ahead.</p>
    <p>What I'm particularly looking forward to is seeing what Alexa does with hers once I've stopped messing with it.</p>
    <figure class="post-figure">
  <img src="${bodyImage4}" alt="An older hand passes a leather journal with a purple band to younger hands." loading="lazy" decoding="async" />
</figure>
    <hr />
    <p>Are you building anything similar for yourself or your kids? I'd love to hear what you're doing. <a href="https://ourolddad.com/contact">Get in touch here.</a></p>
  `,
};

export default post;
