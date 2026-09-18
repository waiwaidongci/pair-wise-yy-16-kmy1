import { useEffect, useState } from "react";
import { RouterProvider, useRouter } from "./router";
import { LightboxProvider } from "./lightbox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/Home";
import { WorkPage } from "./pages/Work";
import { SeriesPage } from "./pages/Series";
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import { ALL_FILTER } from "./data";

const FILTER_STORAGE_KEY = "work-filter";

function Routes() {
  const { path } = useRouter();
  // The work filter lives above the routed pages so it survives
  // /work → /work/:seriesId → /work navigation, and is mirrored to
  // sessionStorage so it also survives full page loads.
  const [filter, setFilter] = useState<string>(
    () => window.sessionStorage.getItem(FILTER_STORAGE_KEY) ?? ALL_FILTER,
  );

  useEffect(() => {
    window.sessionStorage.setItem(FILTER_STORAGE_KEY, filter);
  }, [filter]);

  if (path === "/") return <HomePage />;
  if (path === "/work") return <WorkPage filter={filter} onFilterChange={setFilter} />;
  if (path.startsWith("/work/")) {
    return <SeriesPage seriesId={decodeURIComponent(path.slice("/work/".length))} />;
  }
  if (path === "/about") return <AboutPage />;
  if (path === "/contact") return <ContactPage />;
  return (
    <main className="container page-missing">
      <h1>Page not found</h1>
    </main>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <LightboxProvider>
        <div className="site-shell">
          <Header />
          <Routes />
          <Footer />
        </div>
      </LightboxProvider>
    </RouterProvider>
  );
}
