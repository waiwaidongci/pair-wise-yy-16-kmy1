import { seriesList } from "../data";
import { Link } from "../router";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <p className="site-footer__logo">Su Qing</p>
          <p className="site-footer__tag">
            Portraits and highland wilderness — photographs made slowly, between
            the studio and the plateau.
          </p>
        </div>
        <nav className="site-footer__col" aria-label="Site">
          <p className="site-footer__head">Explore</p>
          <Link to="/">Home</Link>
          <Link to="/work">Work</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <nav className="site-footer__col" aria-label="Series">
          <p className="site-footer__head">Series</p>
          {seriesList.map((s) => (
            <Link key={s.id} to={`/work/${s.id}`}>
              {s.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="wrap site-footer__base">
        <span>© 2026 Su Qing. All photographs are the work of the artist.</span>
        <span className="site-footer__note">hello@suqing.photo</span>
      </div>
    </footer>
  );
}
