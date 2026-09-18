import { photoUrl, type Photo } from "../data";

interface PhotoImageProps {
  photo: Photo;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Renders a photo with its real pixel dimensions baked in as width/height
 * attributes plus an explicit aspect-ratio, so the browser reserves the
 * correct box before the image finishes loading (no layout shift).
 */
export function PhotoImage({ photo, className, loading = "lazy" }: PhotoImageProps) {
  return (
    <img
      className={className}
      src={photoUrl(photo)}
      alt={photo.altText}
      width={photo.width}
      height={photo.height}
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      loading={loading}
      decoding="async"
    />
  );
}
