import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import body1 from './body-image-1.webp';
import body2 from './body-image-2.webp';
import body3 from './body-image-3.webp';
import body4 from './body-image-4.webp';
const post: BlogPost = {
slug: 'publishing-2-pr-gate-rehearsal-20261107',
title: 'Publishing 2.0 OOD Rehearsal - Test Only',
excerpt: 'Synthetic Publishing 2.0 test only; never merge or publish.',
section: 'diary', publishedAt: '2026-11-04', status: 'Recent',
cardImage, cardAlt: 'Plain synthetic card image.',
heroImage, heroAlt: 'Plain synthetic hero image.',
bodyHtml: `
<p>This is a controlled synthetic test. It must never be merged or published.</p><p>This rehearsal uses a deliberately longer block of synthetic text to exercise full article rendering rather than a placeholder. It checks that the site builds a readable static post, resolves the approved image imports into emitted assets, preserves the link to the contact page, and keeps all outputs contained on a draft GitHub branch. None of this text has editorial approval, and the entire page must remain outside production.</p>
<figure class="post-figure"><img src="${body1}" alt="Plain synthetic body illustration 1." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body2}" alt="Plain synthetic body illustration 2." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body3}" alt="Plain synthetic body illustration 3." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body4}" alt="Plain synthetic body illustration 4." loading="lazy" decoding="async" /></figure>
<p><a href="/contact">Contact us.</a></p>
`,
};
export default post;
