import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../contexts/ThemeContext";
import { LocaleProvider } from "../contexts/LocaleContext";
import { CalendarProvider } from "../contexts/CalendarContext";
import { AnimationProvider } from "../contexts/AnimationContext";
import { mockSites } from "../data/mockSites";

import { SiteDetailPanel } from "../components/SiteDetail/SiteDetailPanel";
import { FilterBar } from "../components/FilterBar/FilterBar";
import { SitesTable } from "../components/SitesTable";
import { TimelineScrubber } from "../components/Timeline/TimelineScrubber";
import { AppHeader } from "../components/Layout/AppHeader";
import { AppFooter } from "../components/Layout/AppFooter";

// ponytail: crash-check only, per component per theme. Copy assertions live in
// each component's own test file; theme rarely changes render paths.
const noop = () => {};
const emptyFilters = {
  selectedTypes: [],
  selectedStatuses: [],
  destructionDateStart: null,
  destructionDateEnd: null,
  creationYearStart: null,
  creationYearEnd: null,
  searchTerm: "",
};

const components: Array<[string, () => React.ReactElement]> = [
  ["SiteDetailPanel", () => <SiteDetailPanel site={mockSites[0]} />],
  ["FilterBar", () => <FilterBar filters={emptyFilters} onFilterChange={noop} />],
  [
    "SitesTable",
    () => (
      <SitesTable
        sites={mockSites.slice(0, 5)}
        onSiteClick={noop}
        onSiteHighlight={noop}
        highlightedSiteId={null}
        variant="compact"
      />
    ),
  ],
  ["TimelineScrubber", () => <TimelineScrubber sites={mockSites} />],
  ["AppHeader", () => <AppHeader />],
  ["AppFooter", () => <AppFooter isMobile={false} />],
];

describe("Dark Mode - Component Rendering", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  (["light", "dark"] as const).forEach((theme) => {
    components.forEach(([name, element]) => {
      it(`${name} renders in ${theme} mode`, () => {
        localStorage.setItem("heritage-tracker-theme", theme);
        const { container } = render(
          <BrowserRouter>
            <LocaleProvider>
              <ThemeProvider>
                <CalendarProvider>
                  <AnimationProvider sites={mockSites}>{element()}</AnimationProvider>
                </CalendarProvider>
              </ThemeProvider>
            </LocaleProvider>
          </BrowserRouter>
        );
        expect(container.firstChild).not.toBeNull();
      });
    });
  });
});
