import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
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

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Maps fill the first screen minus the stepper bar (~56px) */}
      <div className="h-[calc(100dvh-56px)] p-2">
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

      {/* Seam bar: at the screen bottom on load, at the top of the list once scrolled */}
      <SiteStepper
        sites={sites}
        highlightedSiteId={highlightedSiteId}
        onSelect={onSiteHighlight}
      />

      {/* Sites list — same embedded compact table as the desktop sidebar,
          fixed height, scrolls internally. Tapping a row highlights the site
          (repositioning the maps); no detail modal in phase 1. */}
      <div className={`h-[60vh] overflow-y-auto ${t.border.primary2}`}>
        <SitesTable
          embedded
          sites={sites}
          onSiteClick={(site) => onSiteHighlight(site.id)}
          onSiteHighlight={onSiteHighlight}
          highlightedSiteId={highlightedSiteId}
          visibleColumns={["status", "dateDestroyed"]}
          nameClickOnlyWhenHighlighted
        />
      </div>

      {/* Slim footer */}
      <footer className={`py-2 text-center text-[11px] ${t.text.muted}`}>
        {translate("footer.title")} ·{" "}
        <a
          href="https://github.com/yupitsleen/HeritageTracker"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {translate("footer.github")}
        </a>
      </footer>
    </div>
  );
}
