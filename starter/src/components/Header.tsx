import { useEffect, useState } from "react";
import { Link, useRouter } from "../router";

const NAV_ITEMS = [
  { to: "/", label: "Home", match: (path: string) => path === "/" },
  { to: "/work", label: "Work", match: (path: string) => path.startsWith("/work") },
  { to: "/about", label: "About", match: (path: string) => path === "/about" },
  { to: "/contact", label: "Contact", match: (path: string) => path === "/contact" },
];

export function Header() {
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          Mira&nbsp;Lin
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`site-nav${menuOpen ? " site-nav-open" : ""}`} aria-label="主导航">
          {NAV_ITEMS.map((item, index) => (
            <span className="site-nav-item" key={item.to}>
              {index > 0 && <span className="site-nav-sep" aria-hidden="true">/</span>}
              <Link
                to={item.to}
                className={item.match(path) ? "is-active" : undefined}
                aria-current={item.match(path) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
      <div className="gold-rule" aria-hidden="true" />
    </header>
  );
}
