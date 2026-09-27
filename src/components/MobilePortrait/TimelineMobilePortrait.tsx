import { useMemo } from "react";
import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { getEffectiveDestructionDate } from "../../utils/format";
import { ComparisonMapView } from "../Map/ComparisonMapView";
import { SitesTable } from "../SitesTable";
import { SiteStepper } from "./SiteStepper";

interface TimelineMobilePortraitProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSiteHighlight: (siteId: string | null) => void;
  before: WaybackImagery;
  after: WaybackImagery;
}

const noop = (): void => {};
// Force zoom-to-site on; markers off. Overlays are hidden in stacked mode,
// so the onChange handlers never fire.
const forcedMapSettings = {
  zoomToSite: true,
  onZoomToSiteChange: noop,
  showMarkers: false,
  onShowMarkersChange: noop,
};

/**
 * Portrait-phone layout: stacked before/after maps (the hero), a Prev/Next
 * site stepper at the seam, a scrollable mobile sites list, and a slim footer.
 * No header. See docs/superpowers/specs/2026-09-27-mobile-portrait-design.md.
 */
export function TimelineMobilePortrait({
  sites,
  highlightedSiteId,
  onSiteHighlight,
  before,
  after,
}: TimelineMobilePortraitProps) {
  const t = useThemeClasses();
  const translate = useTranslation();

  // Order sites by effective destruction date (ascending) — mirrors the table's
  // default sort: useTableSort compares the getEffectiveDestructionDate strings
  // (ISO dates sort chronologically as text) with nulls last. Matching it here
  // makes Prev/Next walk straight down the visible rows instead of jumping.
  const orderedSites = useMemo(() => {
    return [...sites].sort((a, b) => {
      const av = getEffectiveDestructionDate(a);
      const bv = getEffectiveDestructionDate(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const as = av.toLowerCase();
      const bs = bv.toLowerCase();
      if (as < bs) return -1;
      if (as > bs) return 1;
      return 0;
    });
  }, [sites]);

  return (
    <div className="flex flex-col">
      {/* First screen: exactly one (small) viewport tall, so the maps fill the
          remaining space and the Prev/Next bar is always pinned visible at the
          bottom — 100svh (toolbar-shown height) guarantees it never drops below
          the fold on mobile browsers. */}
      <div className="h-[100svh] flex flex-col">
        <div className="flex-1 min-h-0 p-2">
          <ComparisonMapView
            sites={sites}
            highlightedSiteId={highlightedSiteId}
            before={before}
            after={after}
            onSiteClick={(site) => onSiteHighlight(site.id)}
            beforeMapSettings={forcedMapSettings}
            afterMapSettings={forcedMapSettings}
            stacked
          />
        </div>

        {/* Seam bar: pinned at the bottom of the first screen; scrolls up to sit
            above the list as the user scrolls down. */}
        <div className="flex-shrink-0">
          <SiteStepper
            sites={orderedSites}
            highlightedSiteId={highlightedSiteId}
            onSelect={onSiteHighlight}
          />
        </div>
      </div>

      {/* Sites list — same embedded compact table as the desktop sidebar,
          fixed height, scrolls internally. Tapping a row highlights the site
          (repositioning the maps); no detail modal in phase 1. */}
      <div
        className={`h-[60vh] overflow-y-auto backdrop-blur-sm rounded ${t.border.primary2} ${t.containerBg.opaque}`}
      >
        <SitesTable
          embedded
          sites={orderedSites}
          onSiteClick={(site) => onSiteHighlight(site.id)}
          onSiteHighlight={onSiteHighlight}
          highlightedSiteId={highlightedSiteId}
          visibleColumns={["type", "name", "status"]}
          nameClickOnlyWhenHighlighted
          autoScrollHighlighted={false}
        />
      </div>

      {/* Slim footer — same green as AppFooter on larger sizes */}
      <footer className={`py-2 text-center text-[11px] text-[#fefefe] ${t.flag.greenBg}`}>
        {translate("footer.title")} ·{" "}
        <a
          href="https://github.com/yupitsleen/HeritageTracker"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#fefefe]/80 transition-colors"
        >
          {translate("footer.github")}
        </a>
      </footer>
    </div>
  );
}
