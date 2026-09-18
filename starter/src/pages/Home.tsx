import { categoryLabel, seriesList, seriesPhotos } from "../data";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";
import { useLightbox } from "../lightbox";

export function HomePage() {
  const { openLightbox } = useLightbox();
  const heroPhoto = seriesPhotos("wilderness")[0];

  return (
    <main className="page-home">
      <section className="hero">
        <img
          className="hero-image"
          src={`/${heroPhoto.file}`}
          alt={heroPhoto.altText}
          width={heroPhoto.width}
          height={heroPhoto.height}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">Independent Photographer</p>
          <h1 className="hero-name">Mira Lin</h1>
          <p className="hero-tagline">
            Black-and-white portraits and high-plateau landscapes — quiet studies
            of faces, weather and grazing light.
          </p>
          <Link to="/work" className="hero-cta">
            View the work
          </Link>
        </div>
      </section>
      <div className="gold-rule" aria-hidden="true" />

      <section className="featured container">
        <div className="section-heading">
          <h2>Featured Works</h2>
          <span className="section-heading-rule" aria-hidden="true" />
        </div>
        <div className="featured-grid">
          {seriesList.map((series) => {
            const collection = seriesPhotos(series.id);
            const cover = collection[0];
            return (
              <article className="featured-card" key={series.id}>
                <button
                  type="button"
                  className="featured-card-media"
                  onClick={() => openLightbox(collection, 0)}
                  aria-label={`在灯箱中查看系列《${series.title}》`}
                >
                  <PhotoImage photo={cover} />
                </button>
                <div className="featured-card-body">
                  <p className="featured-card-category">
                    {categoryLabel(series.category)} · {collection.length} 幅
                  </p>
                  <h3 className="featured-card-title">{series.title}</h3>
                  <p className="featured-card-summary">{series.summary}</p>
                  <Link to={`/work/${series.id}`} className="featured-card-link">
                    Enter the series →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
