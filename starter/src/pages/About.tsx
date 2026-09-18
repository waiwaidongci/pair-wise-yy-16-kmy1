import { seriesPhotos } from "../data";
import { PhotoImage } from "../components/PhotoImage";
import { useLightbox } from "../lightbox";

const TIMELINE = [
  {
    year: "2015",
    title: "First camera",
    text: "Began photographing while studying literature in Chengdu — friends, markets, long train rides west.",
  },
  {
    year: "2017",
    title: "Turn to portraiture",
    text: "Committed to black-and-white close-ups; the first sittings that would become 《凝视》.",
  },
  {
    year: "2019",
    title: "First solo exhibition",
    text: "“Uninhabited” opened in Chengdu — early highland landscapes shown as large silver prints.",
  },
  {
    year: "2021",
    title: "The highland project",
    text: "Started returning to the plateau each season, living with herder families across Sichuan and Xinjiang.",
  },
  {
    year: "2024",
    title: "《高原牧歌》 completed",
    text: "Finished the pastoral series and began editorial commissions alongside personal work.",
  },
];

export function AboutPage() {
  const { openLightbox } = useLightbox();
  const portraitCollection = seriesPhotos("gaze");
  const portrait = portraitCollection[1];

  return (
    <main className="page-about container">
      <div className="about-grid">
        <div className="about-media">
          <button
            type="button"
            className="about-media-button"
            onClick={() => openLightbox(portraitCollection, 1)}
            aria-label={`在灯箱中查看《${portrait.title}》`}
          >
            <PhotoImage photo={portrait} loading="eager" />
          </button>
          <p className="about-media-note">《{portrait.title}》, from the series 《凝视》</p>
        </div>

        <div className="about-body">
          <h1>About</h1>
          <p className="about-lede">
            Mira Lin is an independent photographer working between black-and-white
            portraiture and the open country of the high plateau.
          </p>
          <p>
            Her portrait work is made slowly, in close quarters: a single window of
            light, a long conversation, and frames that stay near the eyes and the
            texture of skin. The series 《凝视》 gathers five years of these sittings.
          </p>
          <p>
            Since 2021 she has spent part of every year above 3,000 metres, walking
            ridgelines for 《无人之境》 and living alongside herder families for
            《高原牧歌》 — recording how people, cattle and weather share the same
            slopes.
          </p>

          <div className="gold-rule" aria-hidden="true" />

          <h2 className="about-timeline-heading">Milestones</h2>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li className="timeline-item" key={item.year}>
                <span className="timeline-dot" aria-hidden="true" />
                <span className="timeline-year">{item.year}</span>
                <div className="timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
