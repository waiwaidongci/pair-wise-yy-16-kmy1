import { useEffect, useState } from "react";
import { Link, useRouter } from "../router";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link to="/" className="logo" ariaLabel="Su Qing — home">
          Su&nbsp;Qing
        </Link>

        <button
          type="button"
          className={`nav-toggle${menuOpen ? " is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item, i) => (
            <span className="site-nav__item" key={item.to}>
              {i > 0 && (
                <span className="site-nav__sep" aria-hidden="true">
                  /
                </span>
              )}
              <Link
                to={item.to}
                className={`site-nav__link${isActive(item.to) ? " is-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
