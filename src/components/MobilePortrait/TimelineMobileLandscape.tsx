import { useMemo } from "react";
import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { formatDateStandard, sortByEffectiveDestructionDate } from "../../utils/format";
import { ComparisonMapView } from "../Map/ComparisonMapView";
import { SiteStepper } from "./SiteStepper";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";

interface TimelineMobileLandscapeProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSiteHighlight: (siteId: string | null) => void;
  onSiteClick: (site: Site) => void;
  before: WaybackImagery;
  after: WaybackImagery;
}

const noop = (): void => {};
// Force zoom-to-site on; markers off. Overlays are hidden in compact mode,
// so the onChange handlers never fire.
const forcedMapSettings = {
  zoomToSite: true,
  onZoomToSiteChange: noop,
  showMarkers: false,
  onShowMarkersChange: noop,
};

/**
 * Landscape-phone layout: side-by-side before/after maps (full height, like
 * desktop) plus a narrow right-hand rail — current site name/status on top,
 * Prev/Next stepper below. No header, no timeline scrubber, no filters, no
 * table: there isn't the vertical room for them.
 */
export function TimelineMobileLandscape({
  sites,
  highlightedSiteId,
  onSiteHighlight,
  onSiteClick,
  before,
  after,
}: TimelineMobileLandscapeProps) {
  const t = useThemeClasses();
  const translate = useTranslation();
  const orderedSites = useMemo(() => sortByEffectiveDestructionDate(sites), [sites]);
  const highlightedSite = sites.find((site) => site.id === highlightedSiteId) ?? null;

  return (
    <div className="h-[100svh] flex overflow-hidden p-2 gap-2">
      <div className="flex-1 min-h-0">
        <ComparisonMapView
          sites={sites}
          highlightedSiteId={highlightedSiteId}
          before={before}
          after={after}
          onSiteClick={(site) => onSiteHighlight(site.id)}
          beforeMapSettings={forcedMapSettings}
          afterMapSettings={forcedMapSettings}
          compact
        />
      </div>

      <div className="flex-shrink-0 w-28 flex flex-col gap-2">
        <button
          type="button"
          disabled={!highlightedSite}
          onClick={() => highlightedSite && onSiteClick(highlightedSite)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 rounded p-1 text-center disabled:cursor-default ${t.containerBg.semiTransparent}`}
        >
          {highlightedSite && (
            <>
              <span className={`text-xs font-semibold leading-tight ${t.text.heading}`}>
                {highlightedSite.name}
              </span>
              <span className={`text-xs ${t.text.subheading}`}>
                {highlightedSite.dateDestroyed
                  ? formatDateStandard(highlightedSite.dateDestroyed)
                  : translate("common.unknown")}
              </span>
            </>
          )}
        </button>

        <div className="flex-1 min-h-0">
          <SiteStepper
            sites={orderedSites}
            highlightedSiteId={highlightedSiteId}
            onSelect={onSiteHighlight}
            orientation="vertical"
          />
        </div>
      </div>
    </div>
  );
}
