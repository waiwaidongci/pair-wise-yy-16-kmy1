import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { categoryLabel, photoUrl } from "./data";
import type { Photo } from "./data";
import { useRouter } from "./router";

interface LightboxState {
  /** The exact list the lightbox navigates within — e.g. the currently filtered photos. */
  list: Photo[];
  index: number;
}

interface LightboxContextValue {
  open: (list: Photo[], index: number) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside <LightboxProvider>");
  return ctx;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const { path } = useRouter();

  const open = useCallback((list: Photo[], index: number) => {
    if (list.length === 0) return;
    setState({ list, index });
  }, []);
  const close = useCallback(() => setState(null), []);
  const step = useCallback((dir: 1 | -1) => {
    setState((s) =>
      s ? { ...s, index: (s.index + dir + s.list.length) % s.list.length } : s,
    );
  }, []);

  // Close the lightbox when the route changes underneath it.
  useEffect(() => {
    setState(null);
  }, [path]);

  // Keyboard navigation + body scroll lock while open.
  useEffect(() => {
    if (!state) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [state !== null, close, step]);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {state && <LightboxView state={state} onClose={close} onStep={step} />}
    </LightboxContext.Provider>
  );
}

function LightboxView({
  state,
  onClose,
  onStep,
}: {
  state: LightboxState;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const { list, index } = state;
  const photo = list[index];

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片 ${photo.title}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox__close"
        aria-label="关闭灯箱"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox__arrow lightbox__arrow--prev"
        aria-label="上一张"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox__frame">
          <img
            key={photo.id}
            src={photoUrl(photo)}
            alt={photo.altText}
            width={photo.width}
            height={photo.height}
            className="lightbox__img"
          />
          <figcaption className="lightbox__caption">
            <span className="lightbox__caption-head">
              <span className="lightbox__title">{photo.title}</span>
              <span className="lightbox__cat">{categoryLabel(photo.category)}</span>
              <span className="lightbox__counter">
                {index + 1} / {list.length}
              </span>
            </span>
            <span className="lightbox__text">{photo.caption}</span>
          </figcaption>
        </div>
      </figure>

      <button
        type="button"
        className="lightbox__arrow lightbox__arrow--next"
        aria-label="下一张"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
