import { useEffect, useState } from 'react';
import type { SectionGalleryImage } from '../data/siteContent';

type Props = {
  images: SectionGalleryImage[];
  intervalMs?: number;
};

export function RotatingGallery({ images, intervalMs = 6000 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [images.length, intervalMs]);

  const current = images[index];

  if (!current) {
    return null;
  }

  return (
    <div className="rotating-gallery" aria-label="Playlist artwork gallery">
      <div className="rotating-gallery__frame">
        <img
          key={current.src}
          className="rotating-gallery__image"
          src={current.src}
          alt={current.alt}
        />
      </div>
      {images.length > 1 ? (
        <div className="rotating-gallery__dots" aria-hidden="true">
          {images.map((image, imageIndex) => (
            <span
              key={image.src}
              className={`rotating-gallery__dot ${imageIndex === index ? 'is-active' : ''}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
