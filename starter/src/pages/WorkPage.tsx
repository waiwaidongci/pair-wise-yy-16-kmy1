import { allPhotos, categories, categoryLabel, seriesTitle } from "../data";
import type { Photo } from "../data";
import { useLightbox } from "../lightbox";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";

interface WorkPageProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function WorkPage({ filter, onFilterChange }: WorkPageProps) {
  const { open } = useLightbox();
  const filtered: Photo[] =
    filter === "all" ? allPhotos : allPhotos.filter((p) => p.category === filter);

  return (
    <div className="wrap page">
      <header className="page-head">
        <p className="eyebrow">Portfolio</p>
        <h1 className="page-title">Work</h1>
        <p className="page-sub">
          Fourteen photographs in three series — portraits, highland landscapes
          and pastoral life on the plateau.
        </p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选">
        <button
          type="button"
          className={`chip${filter === "all" ? " is-active" : ""}`}
          aria-pressed={filter === "all"}
          onClick={() => onFilterChange("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip${filter === c.id ? " is-active" : ""}`}
            aria-pressed={filter === c.id}
            onClick={() => onFilterChange(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="masonry">
        {filtered.map((photo, i) => (
          <article className="work-card" key={photo.id}>
            <button
              type="button"
              className="work-card__btn"
              aria-label={`放大查看 ${photo.title}`}
              onClick={() => open(filtered, i)}
            >
              <PhotoImage
                photo={photo}
                sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
              <span className="work-card__overlay" aria-hidden="true">
                <span className="work-card__overlay-title">{photo.title}</span>
                <span className="work-card__overlay-cat">
                  {categoryLabel(photo.category)}
                </span>
                <span className="work-card__view">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  view
                </span>
              </span>
            </button>
            <div className="work-card__meta">
              <span className="work-card__title">{photo.title}</span>
              <span className="work-card__cat">{categoryLabel(photo.category)}</span>
            </div>
            <Link to={`/work/${photo.seriesId}`} className="work-card__series">
              系列 · {seriesTitle(photo.seriesId)} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
