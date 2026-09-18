import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LightboxProvider } from "./lightbox";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { SeriesPage } from "./pages/SeriesPage";
import { WorkPage } from "./pages/WorkPage";
import { Link, RouterProvider, useRouter } from "./router";

const TITLES: Record<string, string> = {
  home: "Su Qing — Photography",
  work: "Work — Su Qing",
  series: "Series — Su Qing",
  about: "About — Su Qing",
  contact: "Contact — Su Qing",
  notfound: "Not found — Su Qing",
};

function Routes() {
  const { route } = useRouter();
  // The /work filter lives above the routed pages so it survives
  // navigation to a series detail page and back.
  const [workFilter, setWorkFilter] = useState<string>("all");

  useEffect(() => {
    document.title = TITLES[route.name] ?? TITLES.notfound;
  }, [route.name]);

  switch (route.name) {
    case "home":
      return <HomePage />;
    case "work":
      return <WorkPage filter={workFilter} onFilterChange={setWorkFilter} />;
    case "series":
      return <SeriesPage seriesId={route.seriesId} />;
    case "about":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    default:
      return (
        <div className="wrap page">
          <header className="page-head">
            <p className="eyebrow">404</p>
            <h1 className="page-title">Page not found</h1>
            <p className="page-sub">
              This page doesn’t exist.{" "}
              <Link to="/" className="text-link">
                Back home →
              </Link>
            </p>
          </header>
        </div>
      );
  }
}

export default function App() {
  return (
    <RouterProvider>
      <LightboxProvider>
        <div className="site">
          <Header />
          <main className="site-main">
            <Routes />
          </main>
          <Footer />
        </div>
      </LightboxProvider>
    </RouterProvider>
  );
}
