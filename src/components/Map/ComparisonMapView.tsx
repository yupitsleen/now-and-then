import { type ReactNode } from "react";
import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { SiteDetailView } from "./SiteDetailView";
import { COLORS } from "../../config/colorThemes";
import { DateLabel } from "../Timeline/DateLabel";

interface ComparisonMapViewProps {
  sites: Site[];
  highlightedSiteId: string | null;
  /** Earlier/before imagery configuration */
  before: WaybackImagery;
  /** Later/after imagery configuration */
  after: WaybackImagery;
  onSiteClick?: (site: Site) => void;
  /** Before map settings */
  beforeMapSettings?: {
    zoomToSite: boolean;
    onZoomToSiteChange: (enabled: boolean) => void;
    showMarkers: boolean;
    onShowMarkersChange: (enabled: boolean) => void;
  };
  /** After map settings */
  afterMapSettings?: {
    zoomToSite: boolean;
    onZoomToSiteChange: (enabled: boolean) => void;
    showMarkers: boolean;
    onShowMarkersChange: (enabled: boolean) => void;
  };
  /** Overlays pinned to the bottom-center of each map (imagery prev/next) */
  beforeControls?: ReactNode;
  afterControls?: ReactNode;
  /** When provided, the date labels become editable and snap to the nearest release */
  onBeforeDateChange?: (date: string) => void;
  onAfterDateChange?: (date: string) => void;
}

/**
 * Comparison Map View - Shows two satellite maps side-by-side
 *
 * Displays historical satellite imagery for "before" and "after" comparison.
 * Each map is a full SiteDetailView instance with its own tile layer.
 * Maps are synchronized for pan/zoom via Leaflet's built-in sync capabilities.
 *
 * Features:
 * - Side-by-side layout (50% width each)
 * - Comparison Mode toggle button
 * - Both maps respect "Sync Map" and "Zoom to Site" settings
 * - Date labels at the top of each map (1.5x size of wayback scrubber tooltip, 70% opacity)
 *   - Left map: Yellow label (matches yellow scrubber)
 *   - Right map: Green label (matches green scrubber)
 */
export function ComparisonMapView({
  sites,
  highlightedSiteId,
  before,
  after,
  onSiteClick,
  beforeMapSettings,
  afterMapSettings,
  beforeControls,
  afterControls,
  onBeforeDateChange,
  onAfterDateChange,
}: ComparisonMapViewProps) {
  return (
    <div className="relative h-full">
      {/* Side-by-side map layout with gap-2 to match Dashboard */}
      <div className="flex h-full gap-2">
        {/* Left Map - Earlier imagery (before scrubber) */}
        <div
          className="w-1/2 h-full border-2 rounded shadow-xl overflow-hidden relative"
          style={{ borderColor: COLORS.COMPARE_BEFORE }}
        >
          {/* Date label - styled like wayback tooltip but 1.5x larger with 70% opacity */}
          {before.dateLabel && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000]">
              <DateLabel
                date={before.dateLabel}
                variant="before"
                size="md"
                onDateChange={onBeforeDateChange}
              />
            </div>
          )}
          <SiteDetailView
            sites={sites}
            highlightedSiteId={highlightedSiteId}
            customTileUrl={before.tileUrl}
            customMaxZoom={before.maxZoom}
            onSiteClick={onSiteClick}
            comparisonModeActive={true}
            zoomToSiteOverride={beforeMapSettings?.zoomToSite}
            onZoomToSiteChange={beforeMapSettings?.onZoomToSiteChange}
            mapMarkersOverride={beforeMapSettings?.showMarkers}
            onMapMarkersChange={beforeMapSettings?.onShowMarkersChange}
          />
          {beforeControls && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000]">
              {beforeControls}
            </div>
          )}
        </div>

        {/* Right Map - Later imagery (after scrubber) */}
        <div
          className="w-1/2 h-full border-2 rounded shadow-xl overflow-hidden relative"
          style={{ borderColor: COLORS.COMPARE_AFTER }}
        >
          {/* Date label - styled like wayback tooltip but 1.5x larger with 70% opacity */}
          {after.dateLabel && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000]">
              <DateLabel
                date={after.dateLabel}
                variant="after"
                size="md"
                onDateChange={onAfterDateChange}
              />
            </div>
          )}
          <SiteDetailView
            sites={sites}
            highlightedSiteId={highlightedSiteId}
            customTileUrl={after.tileUrl}
            customMaxZoom={after.maxZoom}
            onSiteClick={onSiteClick}
            comparisonModeActive={true}
            zoomToSiteOverride={afterMapSettings?.zoomToSite}
            onZoomToSiteChange={afterMapSettings?.onZoomToSiteChange}
            mapMarkersOverride={afterMapSettings?.showMarkers}
            onMapMarkersChange={afterMapSettings?.onShowMarkersChange}
          />
          {afterControls && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000]">
              {afterControls}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
