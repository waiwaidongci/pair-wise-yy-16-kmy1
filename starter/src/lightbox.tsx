import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { categoryLabel, photoUrl, type Photo } from "./data";
import { useRouter } from "./router";

interface LightboxState {
  /** The ordered collection the lightbox navigates within (e.g. the current filter result). */
  photos: Photo[];
  index: number;
}

interface LightboxContextValue {
  /** Open the lightbox scoped to a specific photo collection. */
  openLightbox: (photos: Photo[], index: number) => void;
}

const LightboxContext = createContext<LightboxContextValue>({
  openLightbox: () => {},
});

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const { path } = useRouter();

  const openLightbox = useCallback((photos: Photo[], index: number) => {
    if (photos.length === 0) return;
    setState({ photos, index });
  }, []);

  const close = useCallback(() => setState(null), []);

  const step = useCallback((direction: 1 | -1) => {
    setState((current) => {
      if (!current) return current;
      const total = current.photos.length;
      return {
        ...current,
        index: (current.index + direction + total) % total,
      };
    });
  }, []);

  // Close the lightbox whenever the route changes.
  useEffect(() => {
    setState(null);
  }, [path]);

  // Keyboard navigation + body scroll lock while open.
  useEffect(() => {
    if (!state) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [state !== null, close, step]);

  const photo = state ? state.photos[state.index] : null;

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      {state && photo && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${photo.title} — ${state.index + 1} / ${state.photos.length}`}
        >
          <div className="lightbox-backdrop" onClick={close} />
          <button
            type="button"
            className="lightbox-close"
            onClick={close}
            aria-label="关闭灯箱"
          >
            ×
          </button>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-prev"
            onClick={() => step(-1)}
            aria-label="上一张"
          >
            ‹
          </button>
          <figure className="lightbox-stage">
            <div className="lightbox-frame">
              <img
                key={photo.id}
                src={photoUrl(photo)}
                alt={photo.altText}
                width={photo.width}
                height={photo.height}
              />
              <figcaption className="lightbox-caption">
                <span className="lightbox-caption-title">{photo.title}</span>
                <span className="lightbox-caption-category">
                  {categoryLabel(photo.category)}
                </span>
                <span className="lightbox-caption-text">{photo.caption}</span>
                <span className="lightbox-caption-counter">
                  {state.index + 1} / {state.photos.length}
                </span>
              </figcaption>
            </div>
          </figure>
          <button
            type="button"
            className="lightbox-arrow lightbox-arrow-next"
            onClick={() => step(1)}
            aria-label="下一张"
          >
            ›
          </button>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
