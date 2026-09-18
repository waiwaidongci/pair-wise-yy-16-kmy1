import { allPhotos, categoryLabel, seriesList, seriesPhotos } from "../data";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";

const heroPhoto = allPhotos.find((p) => p.id === "landscape-01") ?? allPhotos[0];

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__media">
          <PhotoImage photo={heroPhoto} eager sizes="100vw" ratio="21 / 9" />
        </div>
        <div className="hero__scrim" aria-hidden="true" />
        <div className="wrap hero__content">
          <p className="eyebrow">Photographer</p>
          <h1 className="hero__name">Su Qing</h1>
          <p className="hero__tag">
            Black-and-white portraits and the quiet highlands — photographs made
            slowly, between the studio and the plateau.
          </p>
          <div className="hero__actions">
            <Link to="/work" className="btn btn--gold">
              View Work
            </Link>
            <Link to="/about" className="btn btn--ghost">
              About
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2 className="section-title">Featured Works</h2>
          <span className="section-rule" aria-hidden="true" />
        </div>
        <div className="series-grid">
          {seriesList.map((series) => {
            const cover = seriesPhotos(series)[0];
            return (
              <Link
                key={series.id}
                to={`/work/${series.id}`}
                className="series-card"
                ariaLabel={`查看系列 ${series.title}`}
              >
                <span className="series-card__media">
                  <PhotoImage
                    photo={cover}
                    ratio="4 / 3"
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                </span>
                <span className="series-card__body">
                  <span className="series-card__cat">
                    {categoryLabel(series.category)}
                  </span>
                  <span className="series-card__title">{series.title}</span>
                  <span className="series-card__summary">{series.summary}</span>
                  <span className="series-card__cta">
                    Enter series
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M4 12h15m-6-7 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
