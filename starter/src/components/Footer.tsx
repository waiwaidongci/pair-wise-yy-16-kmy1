import { Link } from "../router";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="gold-rule" aria-hidden="true" />
      <div className="site-footer-inner">
        <span className="site-footer-name">Mira Lin</span>
        <nav className="site-footer-nav" aria-label="页脚导航">
          <Link to="/">Home</Link>
          <Link to="/work">Work</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <span className="site-footer-copy">© 2026 Mira Lin. All photographs are her own.</span>
      </div>
    </footer>
  );
}
