import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Site } from "../../types";
import { GAZA_CENTER, DEFAULT_ZOOM, SITE_DETAIL_ZOOM, HISTORICAL_IMAGERY, MARKER_CLASSNAMES, type TimePeriod } from "../../constants/map";
import { SITE_MARKER_CONFIG } from "../../constants/timeline";
import { MapUpdater, ScrollWheelHandler, MapResizeHandler } from "./MapHelperComponents";
import { TimeToggle } from "./TimeToggle";
import { SitePopup } from "./SitePopup";
import { MapMarkers } from "./MapMarkers";
import { DateLabel } from "../Timeline/DateLabel";
import { useAnimation } from "../../contexts/AnimationContext";
import { getImageryPeriodForDate } from "../../utils/imageryPeriods";
import { useTranslation } from "../../contexts/LocaleContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useWaybackReleases } from "../../hooks/useWaybackReleases";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SiteDetailViewProps {
  sites: Site[];
  highlightedSiteId: string | null;
  // Optional custom tile URL (e.g., for Wayback imagery)
  customTileUrl?: string;
  // Optional custom max zoom for custom tiles
  customMaxZoom?: number;
  // Optional date label to display at top of map
  dateLabel?: string;
  // When provided, the date label becomes an editable date field
  onDateLabelChange?: (date: string) => void;
  // Optional callback for when user clicks "See More" in popup
  onSiteClick?: (site: Site) => void;
  // Optional flag to indicate if comparison mode is active (disables adaptive zoom)
  comparisonModeActive?: boolean;
  // Optional override for zoom to site setting (used in comparison mode for independent control)
  zoomToSiteOverride?: boolean;
  // Optional callback for zoom to site change (used in comparison mode for independent control)
  onZoomToSiteChange?: (enabled: boolean) => void;
  // Optional override for map markers visibility (used in comparison mode for independent control)
  mapMarkersOverride?: boolean;
  // Optional callback for map markers change (used in comparison mode for independent control)
  onMapMarkersChange?: (enabled: boolean) => void;
}

/**
 * Satellite aerial view that zooms in on selected heritage sites
 * Shows Gaza overview when no site is selected
 * Desktop only - always displays satellite imagery
 * Supports historical imagery comparison (2014, Aug 2023, Current)
 * Can sync imagery periods with timeline playback when enabled
 */
export function SiteDetailView({
  sites,
  highlightedSiteId,
  customTileUrl,
  customMaxZoom,
  dateLabel,
  onDateLabelChange,
  onSiteClick,
  comparisonModeActive = false,
  zoomToSiteOverride,
  onZoomToSiteChange,
  mapMarkersOverride,
  onMapMarkersChange,
}: SiteDetailViewProps) {
  // Get animation context for timeline sync and zoom toggle
  const { currentTimestamp, syncActive, zoomToSiteEnabled: contextZoomToSite, mapMarkersVisible: contextMapMarkers, setZoomToSiteEnabled: contextSetZoomToSite, setMapMarkersVisible: contextSetMapMarkers } = useAnimation();
  const translate = useTranslation();
  const t = useThemeClasses();

  // Use override values if provided (comparison mode), otherwise use context values
  const zoomToSiteEnabled = zoomToSiteOverride !== undefined ? zoomToSiteOverride : contextZoomToSite;
  const mapMarkersVisible = mapMarkersOverride !== undefined ? mapMarkersOverride : contextMapMarkers;
  const setZoomToSiteEnabled = onZoomToSiteChange || contextSetZoomToSite;
  const setMapMarkersVisible = onMapMarkersChange || contextSetMapMarkers;

  // Time period state for historical imagery (defaults to the newest available imagery)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("CURRENT");

  // Newest Wayback release backs the "CURRENT" period, so its label/tiles stay accurate
  // as ESRI publishes new imagery. Falls back to the HISTORICAL_IMAGERY constant if the
  // API is unreachable. Skipped when custom imagery is supplied (comparison mode).
  const { releases } = useWaybackReleases();
  const latestRelease = customTileUrl ? undefined : releases[releases.length - 1];

  // Sync satellite imagery with timeline (only if syncActive is true)
  useEffect(() => {
    if (!syncActive) return; // Skip sync if not enabled or temporarily disabled

    // Use dynamic period calculation utility
    const period = getImageryPeriodForDate(currentTimestamp);
    setSelectedPeriod(period);
  }, [currentTimestamp, syncActive]);

  // Find the highlighted site
  const highlightedSite = useMemo(() => {
    if (!highlightedSiteId) return null;
    return sites.find((site) => site.id === highlightedSiteId) || null;
  }, [sites, highlightedSiteId]);

  // Get tile URL and maxZoom
  // If custom URL provided (e.g., Wayback imagery), use that instead of period-based imagery
  const { url: tileUrl, maxZoom: periodMaxZoom } = useMemo(() => {
    if (customTileUrl) {
      return {
        url: customTileUrl,
        maxZoom: customMaxZoom || 19,
      };
    }
    if (selectedPeriod === "CURRENT" && latestRelease) {
      return { url: latestRelease.tileUrl, maxZoom: latestRelease.maxZoom };
    }
    // Otherwise use standard historical imagery periods
    return HISTORICAL_IMAGERY[selectedPeriod];
  }, [customTileUrl, customMaxZoom, selectedPeriod, latestRelease]);

  // Determine map center and zoom level (clamped to period's max zoom)
  // When zoomToSiteEnabled is OFF, only show marker without zooming in
  const { center, zoom } = useMemo(() => {
    if (highlightedSite && zoomToSiteEnabled) {
      // Adaptive zoom: Use closer zoom for newer imagery (2022-04-27+), but only when NOT in comparison mode
      // This provides better satellite detail when available, while keeping comparison maps at consistent zoom
      let targetZoom = SITE_DETAIL_ZOOM; // Default: 17

      if (!comparisonModeActive && dateLabel) {
        // Check if imagery is from 2022-04-27 or later (when higher zoom rendering became available)
        const imageryDate = new Date(dateLabel);
        const highResThreshold = new Date("2022-04-27");

        if (imageryDate >= highResThreshold) {
          // Use zoom 18 for newer imagery with better resolution
          targetZoom = 18;
        }
      }

      // Zoom in on selected site, but don't exceed the period's max zoom
      return {
        center: highlightedSite.coordinates,
        zoom: Math.min(targetZoom, periodMaxZoom),
      };
    }
    // Default: Gaza overview (or keep current position if zoomToSite is OFF)
    return {
      center: GAZA_CENTER,
      zoom: DEFAULT_ZOOM,
    };
  }, [highlightedSite, periodMaxZoom, zoomToSiteEnabled, comparisonModeActive, dateLabel]);

  // Create a custom marker icon for the highlighted site
  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: MARKER_CLASSNAMES.CUSTOM_ICON,
      html: `
        <div class="w-5 h-5 bg-[#ed3039] border-[3px] border-white rounded-full shadow-md"></div>
      `,
      iconSize: SITE_MARKER_CONFIG.ICON_SIZE,
      iconAnchor: SITE_MARKER_CONFIG.ICON_ANCHOR,
    });
  }, []);

  return (
    <div className="relative h-full">
      {/* Date label - shown when provided (e.g., from Wayback imagery) */}
      {dateLabel && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000]">
          <DateLabel
            date={dateLabel}
            variant="single"
            size="md"
            onDateChange={onDateLabelChange}
          />
        </div>
      )}

      {/* Time period toggle - hide when using custom Wayback imagery */}
      {!customTileUrl && (
        <TimeToggle
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          latestReleaseDate={latestRelease?.releaseDate}
        />
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Custom scroll wheel handler for Ctrl+Scroll zoom */}
        <ScrollWheelHandler />

        {/* Re-render tiles when the container resizes (e.g. sidebar collapse) */}
        <MapResizeHandler />

        {/* Map updater for smooth transitions */}
        <MapUpdater center={center} zoom={zoom} />

        {/* Satellite tile layer - supports historical imagery via Wayback */}
        <TileLayer
          key={tileUrl} // Force re-render when the imagery source changes
          url={tileUrl}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={periodMaxZoom}
          minZoom={1}
        />

        {/* Show markers - only if markers are visible */}
        {mapMarkersVisible && (
          <>
            {highlightedSite ? (
              /* Show single marker for highlighted site when zoomed in */
              <Marker position={highlightedSite.coordinates} icon={markerIcon}>
                <Popup className="heritage-popup" maxWidth={320} maxHeight={400}>
                  <SitePopup site={highlightedSite} onViewMore={() => onSiteClick?.(highlightedSite)} />
                </Popup>
              </Marker>
            ) : (
              /* Show all site markers when zoomed out (no site selected) */
              <MapMarkers
                sites={sites}
                highlightedSiteId={highlightedSiteId}
                onSiteClick={onSiteClick}
                currentTimestamp={currentTimestamp}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Map settings - show on Dashboard (no custom tiles) or when override props provided (comparison/timeline mode) */}
      {(!customTileUrl || (onZoomToSiteChange !== undefined && onMapMarkersChange !== undefined)) && (
        <div className={`absolute bottom-2 left-2 z-[1000] ${t.bg.panel} backdrop-blur-sm border ${t.border.primary} rounded px-2 py-1.5 shadow-md`}>
          <div className="flex flex-col gap-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <input
                type="checkbox"
                checked={zoomToSiteEnabled}
                onChange={(e) => setZoomToSiteEnabled(e.target.checked)}
                className="w-3 h-3 cursor-pointer"
              />
              <span className={t.text.body}>{translate("timeline.zoomToSite")}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <input
                type="checkbox"
                checked={mapMarkersVisible}
                onChange={(e) => setMapMarkersVisible(e.target.checked)}
                className="w-3 h-3 cursor-pointer"
              />
              <span className={t.text.body}>{translate("timeline.showMapMarkers")}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
