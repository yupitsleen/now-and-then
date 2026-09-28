import { useMemo } from "react";
import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { sortByEffectiveDestructionDate } from "../../utils/format";
import { ComparisonMapView } from "../Map/ComparisonMapView";
import { SitesTable } from "../SitesTable";
import { SiteStepper } from "./SiteStepper";
import { AppHeader } from "../Layout/AppHeader";

interface TimelineMobilePortraitProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSiteHighlight: (siteId: string | null) => void;
  onSiteClick: (site: Site) => void;
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
  onSiteClick,
  before,
  after,
}: TimelineMobilePortraitProps) {
  const orderedSites = useMemo(() => sortByEffectiveDestructionDate(sites), [sites]);

  const highlightedSite = sites.find((site) => site.id === highlightedSiteId) ?? null;

  return (
    // Whole view fits one viewport, no scrolling — 100svh (toolbar-shown height)
    // guarantees the bottom row never drops below the fold on mobile browsers.
    <div className="h-[100svh] flex flex-col overflow-hidden">
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

      {/* Before a site is selected, show the same lockup as the desktop header;
          once Next has stepped to a site, swap in its single table row (same
          embedded compact table as the desktop sidebar). */}
      <div className="flex-shrink-0">
        {highlightedSite ? (
          <SitesTable
            embedded
            sites={[highlightedSite]}
            onSiteHighlight={onSiteHighlight}
            onSiteClick={onSiteClick}
            clickableRow
            highlightedSiteId={highlightedSiteId}
            visibleColumns={["type", "name", "dateDestroyed"]}
            autoScrollHighlighted={false}
            hideHeader
          />
        ) : (
          <AppHeader centered />
        )}
      </div>

      <div className="flex-shrink-0">
        <SiteStepper
          sites={orderedSites}
          highlightedSiteId={highlightedSiteId}
          onSelect={onSiteHighlight}
        />
      </div>
    </div>
  );
}
