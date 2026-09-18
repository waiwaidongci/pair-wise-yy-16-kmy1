import { useMemo } from "react";
import {
  ALL_FILTER,
  categories,
  categoryLabel,
  filterPhotos,
  getSeries,
} from "../data";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";
import { useLightbox } from "../lightbox";

interface WorkPageProps {
  filter: string;
  onFilterChange: (next: string) => void;
}

export function WorkPage({ filter, onFilterChange }: WorkPageProps) {
  const { openLightbox } = useLightbox();

  // The lightbox is opened with exactly this filtered collection, so its
  // prev/next navigation can never leave the current filter result.
  const visiblePhotos = useMemo(() => filterPhotos(filter), [filter]);

  return (
    <main className="page-work container">
      <header className="page-heading">
        <h1>Work</h1>
        <p className="page-heading-sub">
          {visiblePhotos.length} photographs — {filter === ALL_FILTER ? "all series" : categoryLabel(filter)}
        </p>
      </header>

      <div className="filter-bar" role="group" aria-label="按分类筛选">
        {[{ id: ALL_FILTER, label: "全部" }, ...categories].map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`filter-pill${filter === cat.id ? " is-active" : ""}`}
            aria-pressed={filter === cat.id}
            onClick={() => onFilterChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="work-grid">
        {visiblePhotos.map((photo, index) => {
          const series = getSeries(photo.seriesId);
          return (
            <figure className="work-item" key={photo.id}>
              <div className="work-item-frame">
                <button
                  type="button"
                  className="work-item-button"
                  onClick={() => openLightbox(visiblePhotos, index)}
                  aria-label={`在灯箱中查看《${photo.title}》`}
                >
                  <PhotoImage photo={photo} className="work-item-image" />
                  <span className="work-item-overlay" aria-hidden="true">
                    <span className="work-item-overlay-title">{photo.title}</span>
                    <span className="work-item-overlay-category">
                      {categoryLabel(photo.category)}
                    </span>
                    <span className="work-item-overlay-view">◉ view</span>
                  </span>
                </button>
                {series && (
                  <Link
                    to={`/work/${series.id}`}
                    className="work-item-series"
                    aria-label={`查看系列《${series.title}》`}
                  >
                    系列《{series.title}》→
                  </Link>
                )}
              </div>
              <figcaption className="work-item-caption">
                <span className="work-item-caption-title">{photo.title}</span>
                <span className="work-item-caption-category">
                  {categoryLabel(photo.category)}
                </span>
                {series && (
                  <Link to={`/work/${series.id}`} className="work-item-caption-series">
                    进入系列《{series.title}》→
                  </Link>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </main>
  );
}
