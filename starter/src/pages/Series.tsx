import { categoryLabel, getSeries, seriesList, seriesPhotos } from "../data";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";
import { useLightbox } from "../lightbox";

interface SeriesPageProps {
  seriesId: string;
}

export function SeriesPage({ seriesId }: SeriesPageProps) {
  const { openLightbox } = useLightbox();
  const series = getSeries(seriesId);

  if (!series) {
    return (
      <main className="container page-missing">
        <h1>Series not found</h1>
        <p>
          <Link to="/work">← Back to all work</Link>
        </p>
      </main>
    );
  }

  // Single source of truth: everything below comes from photos.json.
  const collection = seriesPhotos(series.id);
  const cover = collection[0];
  const seriesIndex = seriesList.findIndex((s) => s.id === series.id);
  const nextSeries = seriesList[(seriesIndex + 1) % seriesList.length];

  return (
    <main className="page-series">
      <section className="series-hero">
        <img
          className="series-hero-image"
          src={`/${cover.file}`}
          alt={cover.altText}
          width={cover.width}
          height={cover.height}
          fetchPriority="high"
          decoding="async"
        />
        <div className="series-hero-shade" aria-hidden="true" />
        <div className="series-hero-content">
          <p className="series-hero-kicker">
            {categoryLabel(series.category)} · Series
          </p>
          <h1 className="series-hero-title">{series.title}</h1>
        </div>
      </section>

      <div className="container">
        <p className="series-intro">{series.summary}</p>
        <div className="gold-rule" aria-hidden="true" />

        <div className="series-narrative">
          {collection.map((photo, index) => (
            <div key={photo.id}>
              <section
                className={`series-row${index % 2 === 1 ? " series-row-flip" : ""}`}
              >
                <button
                  type="button"
                  className="series-row-media"
                  onClick={() => openLightbox(collection, index)}
                  aria-label={`在灯箱中查看《${photo.title}》`}
                >
                  <PhotoImage photo={photo} />
                </button>
                <div className="series-row-text">
                  <span className="series-row-index">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(collection.length).padStart(2, "0")}
                  </span>
                  <h2 className="series-row-title">{photo.title}</h2>
                  <p className="series-row-caption">{photo.caption}</p>
                  <span className="series-row-meta">
                    {categoryLabel(photo.category)} · {photo.width} × {photo.height}
                  </span>
                </div>
              </section>
              {index % 2 === 1 && collection[index + 1] && (
                <blockquote className="pull-quote">
                  <p>“{collection[index + 1].caption}”</p>
                  <cite>
                    — {collection[index + 1].title}, 《{series.title}》
                  </cite>
                </blockquote>
              )}
            </div>
          ))}
        </div>

        <nav className="series-footer-nav" aria-label="系列导航">
          <Link to="/work" className="series-back">
            ← Back to all work
          </Link>
          <Link to={`/work/${nextSeries.id}`} className="series-next">
            Next series: {nextSeries.title} →
          </Link>
        </nav>
      </div>
    </main>
  );
}
