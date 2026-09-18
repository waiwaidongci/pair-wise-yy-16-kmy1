import { Fragment } from "react";
import { categoryLabel, seriesById, seriesList, seriesPhotos } from "../data";
import { useLightbox } from "../lightbox";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";

export function SeriesPage({ seriesId }: { seriesId: string }) {
  const { open } = useLightbox();
  const series = seriesById(seriesId);

  if (!series) {
    return (
      <div className="wrap page">
        <header className="page-head">
          <p className="eyebrow">Series</p>
          <h1 className="page-title">Not found</h1>
          <p className="page-sub">
            There is no series named “{seriesId}”.{" "}
            <Link to="/work" className="text-link">
              Back to all work →
            </Link>
          </p>
        </header>
      </div>
    );
  }

  const photos = seriesPhotos(series);
  const cover = photos[0];
  const quotePhoto = photos[Math.floor(photos.length / 2)];
  const seriesIndex = seriesList.findIndex((s) => s.id === series.id);
  const nextSeries = seriesList[(seriesIndex + 1) % seriesList.length];

  return (
    <article className="series">
      <header className="series-hero">
        <div className="series-hero__media">
          <PhotoImage photo={cover} eager sizes="100vw" ratio="16 / 9" />
        </div>
        <div className="series-hero__scrim" aria-hidden="true" />
        <div className="wrap series-hero__content">
          <p className="eyebrow">{categoryLabel(series.category)} · 系列</p>
          <h1 className="series-hero__title">{series.title}</h1>
          <p className="series-hero__summary">{series.summary}</p>
        </div>
      </header>

      <div className="wrap series-body">
        <p className="series-back">
          <Link to="/work" className="text-link">
            ← Back to Work
          </Link>
        </p>

        {photos.map((photo, i) => (
          <Fragment key={photo.id}>
            <section className={`series-row${i % 2 === 1 ? " series-row--flip" : ""}`}>
              <button
                type="button"
                className="series-row__media"
                aria-label={`放大查看 ${photo.title}`}
                onClick={() => open(photos, i)}
              >
                <PhotoImage
                  photo={photo}
                  sizes="(max-width: 860px) 100vw, 58vw"
                />
              </button>
              <div className="series-row__text">
                <span className="series-row__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="series-row__title">{photo.title}</h2>
                <p className="series-row__caption">{photo.caption}</p>
                <span className="gold-rule" aria-hidden="true" />
              </div>
            </section>

            {i === 1 && (
              <blockquote className="pull-quote">
                <span className="pull-quote__rule" aria-hidden="true" />
                <p>“{quotePhoto.caption}”</p>
                <cite>
                  —— 《{series.title}》 · {quotePhoto.title}
                </cite>
                <span className="pull-quote__rule" aria-hidden="true" />
              </blockquote>
            )}
          </Fragment>
        ))}

        <nav className="series-nav" aria-label="Series navigation">
          <Link to="/work" className="text-link">
            ← All Work
          </Link>
          <Link to={`/work/${nextSeries.id}`} className="text-link">
            Next Series · {nextSeries.title} →
          </Link>
        </nav>
      </div>
    </article>
  );
}
