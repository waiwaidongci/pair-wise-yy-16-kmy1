import { photoUrl } from "../data";
import type { Photo } from "../data";

interface PhotoImageProps {
  photo: Photo;
  className?: string;
  eager?: boolean;
  sizes?: string;
  /** Fixed crop ratio (e.g. "4 / 3"); defaults to the photo's true ratio. */
  ratio?: string;
}

/**
 * Renders a photo inside a box whose aspect ratio is reserved up-front from
 * the real width/height metadata, so the layout never shifts while loading.
 */
export function PhotoImage({ photo, className, eager = false, sizes, ratio }: PhotoImageProps) {
  return (
    <span
      className={`ph${className ? ` ${className}` : ""}`}
      style={{ aspectRatio: ratio ?? `${photo.width} / ${photo.height}` }}
    >
      <img
        src={photoUrl(photo)}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
      />
    </span>
  );
}
