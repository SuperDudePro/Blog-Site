import { ImagePlaceholder } from './ImagePlaceholder';

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

export function FeaturedImage({ src, alt, className }: Props) {
  if (!src) {
    return (
      <ImagePlaceholder
        label="Featured image"
        detail="A visual note from the latest post."
        tall
      />
    );
  }

  return (
    <div className={className ?? 'feature-image'}>
      <img className="feature-image__img" src={src} alt={alt ?? 'Featured image'} />
    </div>
  );
}
