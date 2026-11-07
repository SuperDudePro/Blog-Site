import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';

const post: BlogPost = {
  slug: 'grandpa-bought-the-beer',
  title: 'Grandpa Bought the Beer',
  excerpt: "When their parents went out of town, two boys I knew had a reliable way to get beer: bring Grandpa. Parenting my own kids makes that memory look different.",
  section: 'diary',
  format: 'junk-drawer',
  publishedAt: '2026-11-07',
  status: 'Recent',
  heroImage,
  heroAlt: 'Two teenage boys support their frail grandfather at an early-1980s liquor-store counter, with a keg on a hand truck nearby.',
  cardImage,
  cardAlt: 'An elderly hand rests on the customer side of a liquor-store counter beside money and a keg on a hand truck.',
  bodyHtml: `
    <p>Two boys I knew growing up were about a year on either side of me. Their grandfather lived downstairs in their house, in what was basically his own little apartment. When their parents went out of town, the boys would have parties. Grandpa bought the beer.</p>

    <p>He was extremely old and frail. They had to carry him around, but they'd get him up to the liquor-store counter and handle the purchase. I don't remember whether they put the money in his hand or held it for him. They carried out the kegs. Grandpa was basically a prop who met the age requirement.</p>

    <p>I was around for this once or twice, although exactly which parts I went along for are fuzzy now. Sometimes there wasn't even a party. Their parents being gone was enough reason to get beer.</p>

    <p>This was the early '80s, in a pretty ordinary middle-class suburb. (For those of you who weren't there, the early '80s were still pretty much the late '70s. Life didn't reset at midnight on January 1, 1980.) Kids finding somebody to buy beer wasn't especially shocking in the local liquor-store world. Carrying Grandpa in to make the purchase was another matter. The kids knew about that arrangement. Their parents wouldn't have been okay with it.</p>

    <p>Maybe kids still do this kind of stuff all the time. I have no idea. Dealing with my own children's shenanigans now puts my teenage years in a different light. And I'm thinking about everything I got up to back then.</p>

    <p>If I'd been my own parent, I wouldn't have survived.</p>

    <p>How did you get alcohol when you were a kid? <a href="https://ourolddad.com/contact">Tell me your story.</a></p>
  `,
};

export default post;
