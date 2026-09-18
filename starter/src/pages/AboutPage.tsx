import { allPhotos } from "../data";
import { Link } from "../router";
import { PhotoImage } from "../components/PhotoImage";

const portraitPhoto =
  allPhotos.find((p) => p.id === "portrait-01") ?? allPhotos[0];

const TIMELINE = [
  {
    year: "2015",
    text: "Picked up a medium-format camera while studying literature; began the black-and-white portrait studies that would become “Gaze”.",
  },
  {
    year: "2017",
    text: "First solo exhibition, “Gaze” — close-cropped portraits on exposure, guardedness and trust in front of a lens.",
  },
  {
    year: "2019",
    text: "First long stay on the high plateau; began the ongoing fieldwork that grew into “Wilderness” and “Highland Pastoral”.",
  },
  {
    year: "2022",
    text: "Published the monograph “无人之境”, four seasons of unpopulated ridgelines, meadows and weather.",
  },
  {
    year: "2024",
    text: "Returned to the plateau herding communities for a fourth year, continuing the long documentary arc of “Highland Pastoral”.",
  },
];

export function AboutPage() {
  return (
    <div className="wrap page">
      <div className="about-grid">
        <div className="about-grid__media">
          <PhotoImage photo={portraitPhoto} eager sizes="(max-width: 900px) 100vw, 42vw" />
        </div>

        <div className="about-grid__body">
          <p className="eyebrow">About</p>
          <h1 className="page-title">Su Qing</h1>

          <p className="about-bio">
            Su Qing is a photographer working between two very different rooms:
            the small, controlled dark of a portrait studio, and the open,
            weather-driven expanse of the high plateau. Her black-and-white
            portraits stay close — an eyelid, a hairline, a held breath — while
            her landscape and pastoral work steps back until people and animals
            become small figures inside geology and light.
          </p>
          <p className="about-bio">
            Across both, she is interested in the same question: what a subject
            chooses to show, and what the frame politely leaves in shadow. She
            works slowly, prints by hand, and returns to the same places and
            people for years at a time.
          </p>

          <h2 className="about-subhead">Timeline</h2>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li className="timeline__item" key={item.year}>
                <span className="timeline__year">{item.year}</span>
                <p className="timeline__text">{item.text}</p>
              </li>
            ))}
          </ol>

          <span className="gold-rule" aria-hidden="true" />
          <p className="about-cta">
            For prints, commissions and exhibitions —{" "}
            <Link to="/contact" className="text-link">
              get in touch →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
