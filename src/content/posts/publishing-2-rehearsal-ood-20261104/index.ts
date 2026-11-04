import type { BlogPost } from '../../postTypes';
import cardImage from './card-image.webp';
import heroImage from './hero-image.webp';
import body1 from './body-image-1.webp';
import body2 from './body-image-2.webp';
import body3 from './body-image-3.webp';
import body4 from './body-image-4.webp';
const post: BlogPost = {
slug: 'publishing-2-rehearsal-ood-20261104',
title: 'Publishing 2.0 OOD Rehearsal - Test Only',
excerpt: 'Synthetic Publishing 2.0 test only; never merge or publish.',
section: 'diary', publishedAt: '2026-11-04', status: 'Draft',
cardImage, cardAlt: 'Plain synthetic card image.',
heroImage, heroAlt: 'Plain synthetic hero image.',
bodyHtml: `
<p>This is a controlled synthetic test. It must never be merged or published.</p>
<figure class="post-figure"><img src="${body1}" alt="Plain synthetic body illustration 1." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body2}" alt="Plain synthetic body illustration 2." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body3}" alt="Plain synthetic body illustration 3." loading="lazy" decoding="async" /></figure>
<figure class="post-figure"><img src="${body4}" alt="Plain synthetic body illustration 4." loading="lazy" decoding="async" /></figure>
<p><a href="/contact">Contact us.</a></p>
`,
};
export default post;
