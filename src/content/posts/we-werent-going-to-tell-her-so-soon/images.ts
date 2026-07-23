import heroImageChunkOne from './image-data-mini/hero-image-chunk-1';
import heroImageChunkTwo from './image-data-mini/hero-image-chunk-2';
import cardImageChunkOne from './image-data-mini/card-image-chunk-1';
import cardImageChunkTwo from './image-data-mini/card-image-chunk-2';
import bodyImageOneChunkOne from './image-data-mini/body-image-1-chunk-1';
import bodyImageOneChunkTwo from './image-data-mini/body-image-1-chunk-2';
import bodyImageOneChunkThree from './image-data-mini/body-image-1-chunk-3';
import bodyImageTwoChunkOne from './image-data-mini/body-image-2-chunk-1';
import bodyImageTwoChunkTwo from './image-data-mini/body-image-2-chunk-2';
import bodyImageTwoChunkThree from './image-data-mini/body-image-2-chunk-3';
import bodyImageTwoChunkFour from './image-data-mini/body-image-2-chunk-4';
import bodyImageThreeChunkOne from './image-data-mini/body-image-3-chunk-1';
import bodyImageThreeChunkTwo from './image-data-mini/body-image-3-chunk-2';
import bodyImageThreeChunkThree from './image-data-mini/body-image-3-chunk-3';

const dataUri = (...chunks: string[]) => `data:image/webp;base64,${chunks.join('')}`;

export const heroImage = dataUri(heroImageChunkOne, heroImageChunkTwo);
export const cardImage = dataUri(cardImageChunkOne, cardImageChunkTwo);
export const bodyImageOne = dataUri(bodyImageOneChunkOne, bodyImageOneChunkTwo, bodyImageOneChunkThree);
export const bodyImageTwo = dataUri(
  bodyImageTwoChunkOne,
  bodyImageTwoChunkTwo,
  bodyImageTwoChunkThree,
  bodyImageTwoChunkFour,
);
export const bodyImageThree = dataUri(
  bodyImageThreeChunkOne,
  bodyImageThreeChunkTwo,
  bodyImageThreeChunkThree,
);
