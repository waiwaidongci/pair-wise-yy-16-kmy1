import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MouseEvent, ReactNode } from "react";

export type Route =
  | { name: "home" }
  | { name: "work" }
  | { name: "series"; seriesId: string }
  | { name: "about" }
  | { name: "contact" }
  | { name: "notfound" };

export function parseRoute(path: string): Route {
  if (path === "/") return { name: "home" };
  if (path === "/work") return { name: "work" };
  const seriesMatch = path.match(/^\/work\/([^/]+)\/?$/);
  if (seriesMatch) return { name: "series", seriesId: decodeURIComponent(seriesMatch[1]) };
  if (path === "/about") return { name: "about" };
  if (path === "/contact") return { name: "contact" };
  return { name: "notfound" };
}

interface RouterValue {
  path: string;
  route: Route;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return;
    window.history.pushState(null, "", to);
    setPath(to);
  }, []);

  return (
    <RouterContext.Provider value={{ path, route: parseRoute(path), navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside <RouterProvider>");
  return ctx;
}

interface LinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
}

/** Client-side link: intercepts plain left-clicks, keeps native behavior otherwise. */
export function Link({ to, className, children, ariaLabel, onClick }: LinkProps) {
  const { navigate } = useRouter();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClick?.();
    navigate(to);
  };
  return (
    <a href={to} className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </a>
  );
}
