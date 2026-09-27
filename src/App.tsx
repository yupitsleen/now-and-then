import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CalendarProvider } from "./contexts/CalendarContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";
import { Timeline } from "./pages/Timeline";

export function App() {
  const basename = import.meta.env.PROD ? "/now-and-then/gaza" : "";

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <LocaleProvider>
        <ThemeProvider>
          <CalendarProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Timeline />} />
              </Routes>
            </ErrorBoundary>
          </CalendarProvider>
        </ThemeProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}
