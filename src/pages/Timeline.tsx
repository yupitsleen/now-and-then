import { lazy, Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/LocaleContext";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useFilteredSites } from "../hooks/useFilteredSites";
import { useDefaultFilterRanges } from "../hooks/useDefaultFilterRanges";
import { useTableResize } from "../hooks/useTableResize";
import { Modal } from "../components/Modal/Modal";
import { AppHeader } from "../components/Layout/AppHeader";
import { AppFooter } from "../components/Layout/AppFooter";
import { Button } from "../components/Button";
import { FilterBar } from "../components/FilterBar/FilterBar";
import { FiltersToggleButton } from "../components/FilterBar/FiltersToggleButton";
import { SitesTable } from "../components/SitesTable";
import { TimelineHelpModal } from "../components/Help";
import { mockSites } from "../data/mockSites";
import { SkeletonMap } from "../components/Loading/Skeleton";
import { useWaybackReleases } from "../hooks/useWaybackReleases";
import { WaybackSlider, WaybackSettings, WaybackNav } from "../components/AdvancedTimeline";
import { AnimationProvider } from "../contexts/AnimationContext";
import type { Site } from "../types";
import type { FilterState } from "../types/filters";
import { createEmptyFilterState } from "../types/filters";
import type { ComparisonInterval } from "../types/waybackTimelineTypes";
import { DEFAULT_COMPARISON_INTERVAL } from "../config/comparisonIntervals";
import { calculateBeforeDate, findClosestReleaseIndex } from "../utils/intervalCalculations";
import { BREAKPOINTS, CONTENT_GAP_PX, Z_INDEX } from "../constants/layout";
import { useActiveFilters } from "../hooks/useActiveFilters";
import { PalestinianFlagTriangle } from "../components/Decorative";

// Lazy load the map, timeline, and modal components
// Note: About and Stats are now dedicated pages at /about and /stats for better performance
const SiteDetailView = lazy(() =>
  import("../components/Map/SiteDetailView").then((m) => ({ default: m.SiteDetailView }))
);
const ComparisonMapView = lazy(() =>
  import("../components/Map/ComparisonMapView").then((m) => ({ default: m.ComparisonMapView }))
);
const TimelineScrubber = lazy(() =>
  import("../components/Timeline/TimelineScrubber").then((m) => ({ default: m.TimelineScrubber }))
);
const SiteDetailPanel = lazy(() =>
  import("../components/SiteDetail/SiteDetailPanel").then((m) => ({ default: m.SiteDetailPanel }))
);

/** Default "before" imagery baseline — pre-destruction reference point */
const WAYBACK_BASELINE_DATE = new Date("2019-06-05");

/**
 * Timeline Page
 * Full-screen satellite map with Wayback imagery (historical versions)
 * Timeline scrubber for site filtering
 * Reuses SiteDetailView and TimelineScrubber from home page
 */
export function Timeline() {
  const { isDark } = useTheme();
  const t = useThemeClasses();
  const translate = useTranslation();

  // Fetch Wayback releases
  const { releases, isLoading, error } = useWaybackReleases();

  // Wayback state - will be set to most recent release once loaded
  const [currentReleaseIndex, setCurrentReleaseIndex] = useState(0);

  // Set initial release to most recent (last in array) when releases are loaded
  useEffect(() => {
    if (releases.length > 0 && currentReleaseIndex === 0) {
      // Only set on initial load (when still at index 0)
      setCurrentReleaseIndex(releases.length - 1);
    }
  }, [releases, currentReleaseIndex]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(createEmptyFilterState());

  // Combined side panel (Sites / Filters / Settings) is drag-resizable
  const tableResize = useTableResize();

  // Get default filter ranges (calculated once from all sites)
  const { dateRange: defaultDateRange, yearRange: defaultYearRange } = useDefaultFilterRanges(mockSites);

  // Site filtering state
  const [highlightedSiteId, setHighlightedSiteId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // "See on Map" deep-link from Data page
  const [searchParams] = useSearchParams();
  const initialSiteIdFromUrl = useRef(searchParams.get('siteId'));
  const initialSiteHandled = useRef(false);

  // Sync Map toggle - when enabled, clicking timeline dots syncs map to nearest Wayback release
  // Default OFF so the initial Wayback scrubber positions survive the first dot click
  const [syncMapOnDotClick, setSyncMapOnDotClick] = useState(false);

  // Comparison Mode toggle - when enabled, shows two maps side-by-side
  // Default to ON for first-load comparison view
  const [comparisonModeEnabled, setComparisonModeEnabled] = useState(true);

  // Before release index for comparison mode (earlier imagery)
  // Will be set to the release closest to the baseline below once loaded
  const [beforeReleaseIndex, setBeforeReleaseIndex] = useState(0);
  const beforeReleaseInitialized = useRef(false);

  // Set initial "before" release to closest to Jun 5, 2019 when releases are loaded.
  // Runs once only - a ref guard (not "index === 0") because 0 is also a real,
  // user-selectable release index (the earliest/Feb 2014 release).
  useEffect(() => {
    if (releases.length > 0 && !beforeReleaseInitialized.current) {
      beforeReleaseInitialized.current = true;
      setBeforeReleaseIndex(findClosestReleaseIndex(releases, WAYBACK_BASELINE_DATE));
    }
  }, [releases]);

  // Comparison interval - controls time gap between before/after imagery
  const [comparisonInterval, setComparisonInterval] = useState<ComparisonInterval>(
    DEFAULT_COMPARISON_INTERVAL
  );

  // Map settings for before/after maps (independent controls)
  const [beforeMapZoomToSite, setBeforeMapZoomToSite] = useState(true);
  const [beforeMapShowMarkers, setBeforeMapShowMarkers] = useState(false);
  const [afterMapZoomToSite, setAfterMapZoomToSite] = useState(true);
  const [afterMapShowMarkers, setAfterMapShowMarkers] = useState(false);

  // Map settings for single map mode
  const [singleMapZoomToSite, setSingleMapZoomToSite] = useState(true);
  const [singleMapShowMarkers, setSingleMapShowMarkers] = useState(false);

  // Modal states for footer and help
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Imagery slider on by default; turning it off in Advanced Settings leaves no tabs.
  const [showImagerySlider, setShowImagerySlider] = useState(true);
  // View option: tabs (default) vs. both timelines stacked, as they used to be
  const [separateTimelines, setSeparateTimelines] = useState(false);
  const [timelineTab, setTimelineTab] = useState<"imagery" | "sites">("sites");

  // Full-screen sites table (same expanded variant the Data page uses)
  const [tableExpanded, setTableExpanded] = useState(false);
  // Owned here, not in FilterBar: the expanded table lays out around the rail.
  const [sidebarRailed, setSidebarRailed] = useState(false);
  // Railed leaves no rail behind — the re-open button lives in the header.
  const sidebarWidth = sidebarRailed ? 0 : tableResize.tableWidth;
  // The expanded table is a region, not a dialog — the filter sidebar stays live
  // beside it — so focus moves in but is never trapped. What the backdrop dims
  // (maps, timeline) goes `inert` instead, so Tab can't reach what's hidden.
  const expandedPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!tableExpanded) return;
    expandedPanelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setTableExpanded(false);
    document.addEventListener("keydown", onKeyDown);
    // The overlay is positioned against the desktop row (sidebar + map); below md that
    // layout stacks, so close rather than leave a misplaced panel behind.
    const onResize = () =>
      window.innerWidth < BREAKPOINTS.MOBILE && setTableExpanded(false);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [tableExpanded]);

  // Clicking the layout's own padding/gaps (never a child) also leaves the expanded view.
  // ponytail: target === currentTarget beats a ref-based outside-click listener here.
  const exitExpandedOnOutsideClick = tableExpanded
    ? (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) setTableExpanded(false);
      }
    : undefined;

  // Three layouts: sites only (default), tabbed, stacked.
  const stacked = showImagerySlider && separateTimelines;
  const tabbed = showImagerySlider && !separateTimelines;

  // Tabbed mode: both panels fill the shared grid cell (h-full on the panel's own
  // bordered container too), so the visible box is identical on either tab.
  const tabPanelClass = stacked ? "" : "h-full [&>*]:h-full";

  // The per-map imagery nav only makes sense while the imagery slider is on screen.
  const imageryVisible = stacked || (tabbed && timelineTab === "imagery");

  // Tab roles only apply while the tabs are on screen; the stacked layout has no
  // tablist, so the panels are just sections.
  const timelinePanelProps = (tab: "imagery" | "sites") =>
    !tabbed
      ? {}
      : {
          role: "tabpanel",
          id: `timeline-panel-${tab}`,
          "aria-labelledby": `timeline-tab-${tab}`,
        };

  // Get current release (for "after" imagery or single map mode)
  const currentRelease = releases.length > 0 ? releases[currentReleaseIndex] : null;

  // Get before release (for "before" imagery in comparison mode)
  const beforeRelease = releases.length > 0 ? releases[beforeReleaseIndex] : null;

  // Apply filters to sites using shared hook
  const { filteredSites } = useFilteredSites(mockSites, filters);
  const { activeFilterCount } = useActiveFilters(filters);

  // Filter handlers
  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearAllFilters = () => {
    setFilters(createEmptyFilterState());
  };

  /**
   * Find the earliest Wayback release that occurred AFTER the destruction date
   * This shows the satellite imagery from right after the site was destroyed
   *
   * @param targetDate - The destruction date to search for
   * @returns Index of the nearest release, or last release if no releases available after
   * @throws Never throws - returns last release index for invalid inputs
   */
  const findNearestWaybackRelease = useCallback(
    (targetDate: Date): number => {
      // Guard: Empty releases array
      if (releases.length === 0) return 0;

      // Guard: Invalid date
      if (!targetDate || isNaN(targetDate.getTime())) {
        console.warn('findNearestWaybackRelease: Invalid target date provided, using last release');
        return releases.length - 1;
      }

      const targetTime = targetDate.getTime();

      // Find the EARLIEST release that occurred AFTER the target date
      // We iterate through all releases and return the first one after the target
      for (let i = 0; i < releases.length; i++) {
        const releaseDate = new Date(releases[i].releaseDate);

        // Guard: Invalid release date
        if (isNaN(releaseDate.getTime())) {
          console.warn(`findNearestWaybackRelease: Invalid release date at index ${i}, skipping`);
          continue;
        }

        const releaseTime = releaseDate.getTime();

        // Return the first release that's after the target date
        if (releaseTime > targetTime) {
          return i;
        }
      }

      // If no release found after the target date, return the last release
      // This handles cases where the destruction happened after the last imagery
      return releases.length - 1;

    },
    [releases]
  );

  /**
   * Handle site selection from timeline. Wayback positioning is handled by the
   * sync effect below, so this is just selection.
   */
  const handleSiteHighlight = useCallback((siteId: string | null) => {
    setHighlightedSiteId(siteId);
  }, []);

  /**
   * Sync map versions to the highlighted site's destruction date.
   *
   * An effect (not a click handler) so that changing the interval — or turning
   * sync on — re-applies immediately to the site already selected, instead of
   * leaving the sliders wherever the last interval put them.
   * Manual mode never runs this: the user's dates stay put.
   */
  useEffect(() => {
    if (!syncMapOnDotClick || !highlightedSiteId || releases.length === 0) return;

    const site = mockSites.find((s: Site) => s.id === highlightedSiteId);
    if (!site?.dateDestroyed) return;

    const destructionDate = new Date(site.dateDestroyed);

    // "after" imagery (post-destruction) is always the release just after
    // destruction — "as_large_as_possible" widens the interval on the "before"
    // side only, otherwise every site would show the same (newest) imagery.
    setCurrentReleaseIndex(findNearestWaybackRelease(destructionDate));

    if (comparisonModeEnabled) {
      const beforeDate = calculateBeforeDate(destructionDate, comparisonInterval, releases);
      setBeforeReleaseIndex(findClosestReleaseIndex(releases, beforeDate));
    }
  }, [
    syncMapOnDotClick,
    highlightedSiteId,
    comparisonModeEnabled,
    comparisonInterval,
    findNearestWaybackRelease,
    releases,
  ]);

  // Apply the deep-linked site once releases are available
  useEffect(() => {
    if (!initialSiteHandled.current && initialSiteIdFromUrl.current && releases.length > 0) {
      initialSiteHandled.current = true;
      handleSiteHighlight(initialSiteIdFromUrl.current);
    }
  }, [releases, handleSiteHighlight]);

  /**
   * Reset wayback sliders to the same positions they load with
   * Green slider (after) goes to last release (most recent)
   * Yellow slider (before) goes back to the baseline release, not the earliest
   */
  const handleWaybackReset = useCallback(() => {
    if (releases.length > 0) {
      setCurrentReleaseIndex(releases.length - 1); // Most recent
      setBeforeReleaseIndex(findClosestReleaseIndex(releases, WAYBACK_BASELINE_DATE));
    }
  }, [releases]);

  /**
   * Reload page to retry loading Wayback releases
   */
  const handleRetryClick = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className={`min-h-screen relative transition-colors duration-200 ${t.layout.appBackground}`}
    >
      {/* Palestinian Flag Red Triangle - Background Element */}
      <PalestinianFlagTriangle width={800} zIndex={Z_INDEX.BASE} />

      {/* Header - shared across all pages */}
      <AppHeader
        // Lockup parks at the green map's left edge with the panel open, and stays
        // there when it rails — so railing doesn't slide it onto the toggle.
        titleLeft={16 + tableResize.tableWidth + 8}
        leading={
          sidebarRailed ? (
            <FiltersToggleButton
              onClick={() => setSidebarRailed(false)}
              activeFilterCount={activeFilterCount}
            />
          ) : undefined
        }
      />

      {/* Main content */}
      {/* Relative positioning creates stacking context above z-0 triangle */}
      {/* 67px = 40px header + 27px fixed footer; py-2 keeps equal breathing room top and bottom */}
      <main
        className="h-[calc(100vh-67px)] px-4 py-2 flex flex-col gap-2 relative"
        onClick={exitExpandedOnOutsideClick}
      >
        {/* Loading state */}
        {isLoading && (
          <div className={`flex-1 flex items-center justify-center rounded ${t.border.primary2} ${t.containerBg.semiTransparent} shadow-xl`}>
            <div className="text-center">
              <div className={`text-xl mb-2 ${t.text.heading}`}>Loading Wayback Archive...</div>
              <div className={`text-sm ${t.text.muted}`}>Fetching historical imagery versions...</div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={`flex-1 flex items-center justify-center rounded ${t.border.primary2} ${t.containerBg.semiTransparent} shadow-xl`}>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 text-red-600">Error Loading Archive</div>
              <div className={`text-sm mb-4 ${t.text.muted}`}>{error}</div>
              <Button onClick={handleRetryClick} variant="primary" size="sm">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Success state - Map + Wayback controls */}
        {!isLoading && !error && releases.length > 0 && (
          <AnimationProvider sites={filteredSites}>
            {/* Sidebar + map on top; the Wayback slider and scrubber span full width below */}
            <div
              className="flex flex-col gap-2 flex-1 min-h-0 relative"
              onClick={exitExpandedOnOutsideClick}
            >
              {/* Top row: filter sidebar beside the map */}
              <div
                className="flex flex-col md:flex-row gap-2 flex-1 min-h-0"
                onClick={exitExpandedOnOutsideClick}
              >
                {/* Expanded: the sidebar lifts above the backdrop and stretches to the full
                    content height so it matches the table; a spacer holds its place in the
                    row so the maps behind don't reflow. */}
                {tableExpanded && (
                  <div style={{ width: sidebarWidth }} className="flex-shrink-0" aria-hidden="true" />
                )}
                {/* Full content height, no vertical inset: the sidebar's top edge doesn't
                    move when the table expands, it only grows downward past the timeline. */}
                <div className={tableExpanded ? "absolute inset-y-0 left-0 z-40 flex" : "contents"}>
                <FilterBar
                  variant="sidebar"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  sites={mockSites}
                  defaultDateRange={defaultDateRange}
                  defaultYearRange={defaultYearRange}
                  showActions={true}
                  totalSites={mockSites.length}
                  filteredSites={filteredSites.length}
                  onClearAll={clearAllFilters}
                  resize={{
                    width: tableResize.tableWidth,
                    isResizing: tableResize.isResizing,
                    onResizeStart: tableResize.handleResizeStart,
                  }}
                  sitesExpanded={tableExpanded}
                  onSitesExpandToggle={() => setTableExpanded(true)}
                  sidebarCollapsed={sidebarRailed}
                  onSidebarCollapsedChange={setSidebarRailed}
                  sitesTab={
                    <SitesTable
                      embedded
                      sites={filteredSites}
                      onSiteTypeClick={setSelectedSite}
                      onSiteHighlight={handleSiteHighlight}
                      highlightedSiteId={highlightedSiteId}
                      visibleColumns={tableResize.getVisibleColumns()}
                    />
                  }
                  settings={
                    <WaybackSettings
                      comparisonMode={comparisonModeEnabled}
                      onComparisonModeToggle={() => setComparisonModeEnabled(!comparisonModeEnabled)}
                      comparisonInterval={comparisonInterval}
                      onIntervalChange={setComparisonInterval}
                      syncMapVersion={syncMapOnDotClick}
                      onSyncMapVersionToggle={() => setSyncMapOnDotClick(!syncMapOnDotClick)}
                      releases={releases}
                      beforeIndex={beforeReleaseIndex}
                      onBeforeIndexChange={setBeforeReleaseIndex}
                      afterIndex={currentReleaseIndex}
                      onAfterIndexChange={setCurrentReleaseIndex}
                      showImagerySlider={showImagerySlider}
                      onShowImagerySliderToggle={() => setShowImagerySlider(!showImagerySlider)}
                      separateTimelines={separateTimelines}
                      onSeparateTimelinesToggle={() => setSeparateTimelines(!separateTimelines)}
                      onOpenHelp={() => setIsHelpOpen(true)}
                    />
                  }
                />
                </div>

                {/* Map column — dimmed and unreachable while the table is expanded */}
                <div className="flex-1 min-w-0 min-h-0 flex flex-col" inert={tableExpanded}>

            {/* Full-screen satellite map with Wayback imagery */}
            <div
              className={`flex-1 min-h-0 ${comparisonModeEnabled ? '' : `${t.border.primary2} rounded shadow-xl overflow-hidden`} relative z-10`}
            >
              <Suspense fallback={<SkeletonMap />}>
                {comparisonModeEnabled ? (
                  <ComparisonMapView
                    sites={filteredSites}
                    highlightedSiteId={highlightedSiteId}
                    before={{
                      tileUrl: beforeRelease?.tileUrl || "",
                      maxZoom: beforeRelease?.maxZoom || 19,
                      dateLabel: beforeRelease?.releaseDate,
                    }}
                    after={{
                      tileUrl: currentRelease?.tileUrl || "",
                      maxZoom: currentRelease?.maxZoom || 19,
                      dateLabel: currentRelease?.releaseDate,
                    }}
                    onSiteClick={setSelectedSite}
                    onBeforeDateChange={(date) =>
                      setBeforeReleaseIndex(findClosestReleaseIndex(releases, new Date(date)))
                    }
                    onAfterDateChange={(date) =>
                      setCurrentReleaseIndex(findClosestReleaseIndex(releases, new Date(date)))
                    }
                    beforeMapSettings={{
                      zoomToSite: beforeMapZoomToSite,
                      onZoomToSiteChange: setBeforeMapZoomToSite,
                      showMarkers: beforeMapShowMarkers,
                      onShowMarkersChange: setBeforeMapShowMarkers,
                    }}
                    afterMapSettings={{
                      zoomToSite: afterMapZoomToSite,
                      onZoomToSiteChange: setAfterMapZoomToSite,
                      showMarkers: afterMapShowMarkers,
                      onShowMarkersChange: setAfterMapShowMarkers,
                    }}
                    beforeControls={
                      imageryVisible && (
                        <WaybackNav
                          variant="before"
                          index={beforeReleaseIndex}
                          releaseCount={releases.length}
                          onIndexChange={setBeforeReleaseIndex}
                        />
                      )
                    }
                    afterControls={
                      imageryVisible && (
                        <WaybackNav
                          variant="after"
                          index={currentReleaseIndex}
                          releaseCount={releases.length}
                          onIndexChange={setCurrentReleaseIndex}
                        />
                      )
                    }
                  />
                ) : (
                  <SiteDetailView
                    sites={filteredSites}
                    highlightedSiteId={highlightedSiteId}
                    customTileUrl={currentRelease?.tileUrl}
                    customMaxZoom={currentRelease?.maxZoom}
                    dateLabel={currentRelease?.releaseDate}
                    onDateLabelChange={(date) =>
                      setCurrentReleaseIndex(findClosestReleaseIndex(releases, new Date(date)))
                    }
                    onSiteClick={setSelectedSite}
                    comparisonModeActive={false}
                    zoomToSiteOverride={singleMapZoomToSite}
                    onZoomToSiteChange={setSingleMapZoomToSite}
                    mapMarkersOverride={singleMapShowMarkers}
                    onMapMarkersChange={setSingleMapShowMarkers}
                  />
                )}
              </Suspense>
            </div>
                </div>
              </div>

            {/* Combined panel: tabs sit inside the panel's top-left corner. The
                `timeline-tabbed` class tells the panels' control rows to indent past
                the tablist. Hidden when the user opts into the stacked layout. */}
            <div
              className={`flex-shrink-0 flex flex-col gap-2 relative z-10 ${tabbed ? "timeline-tabbed" : ""}`}
              inert={tableExpanded}
            >
            {tabbed && (
              <div
                className="absolute top-2 left-2 z-20 flex items-center gap-0.5"
                role="tablist"
                dir="ltr"
              >
                {(["sites", "imagery"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`timeline-tab-${tab}`}
                    aria-selected={timelineTab === tab}
                    aria-controls={`timeline-panel-${tab}`}
                    onClick={() => setTimelineTab(tab)}
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded border-b-2 transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none ${
                      timelineTab === tab
                        ? `border-[#009639] ${t.text.heading}`
                        : `border-transparent ${t.text.muted} ${t.bg.hover}`
                    }`}
                  >
                    {translate(`timeline.tab${tab === "imagery" ? "Imagery" : "Sites"}`)}
                  </button>
                ))}
              </div>
            )}

            {/* Tabbed: both panels stack in one grid cell. The sites panel alone sets
                the height — the imagery panel is absolutely positioned over it, so
                turning imagery on (or switching tabs) never resizes the row. Neither
                panel is unmounted: both keep a real box for D3 to measure. */}
            <div
              className={
                stacked
                  ? "flex flex-col gap-2"
                  : "relative grid [&>*]:[grid-area:1/1] items-stretch"
              }
            >
              <div
                {...timelinePanelProps("sites")}
                className={`min-h-[116px] ${tabPanelClass} ${
                  tabbed && timelineTab !== "sites"
                    ? "invisible pointer-events-none"
                    : ""
                }`}
              >
                <Suspense fallback={<SkeletonMap />}>
                  <TimelineScrubber
                    key="advanced-timeline-scrubber"
                    sites={filteredSites}
                    highlightedSiteId={highlightedSiteId}
                    onSiteHighlight={handleSiteHighlight}
                    comparisonMode={comparisonModeEnabled}
                    advancedMode={{
                      syncMapOnDotClick,
                      showNavigation: true, // Show Previous/Next buttons
                      hidePlayControls: true, // Hide Play/Pause/Speed controls on Advanced Timeline page
                      hideMapSettings: true, // Hide Zoom to Site and Show Map Markers (moved to maps above)
                      onReset: handleWaybackReset, // Reset wayback sliders to initial positions
                    }}
                  />
                </Suspense>
              </div>

              {showImagerySlider && (
                <div
                  {...timelinePanelProps("imagery")}
                  className={`${tabPanelClass} ${tabbed ? "absolute inset-0" : ""} ${
                    tabbed && timelineTab !== "imagery"
                      ? "invisible pointer-events-none"
                      : ""
                  }`}
                >
                  <WaybackSlider
                    releases={releases}
                    currentIndex={currentReleaseIndex}
                    onIndexChange={setCurrentReleaseIndex}
                    mapsInsetPx={sidebarWidth + CONTENT_GAP_PX}
                    comparisonMode={comparisonModeEnabled}
                    beforeIndex={beforeReleaseIndex}
                    onBeforeIndexChange={setBeforeReleaseIndex}
                  />
                </div>
              )}
            </div>
            </div>

            {/* Expanded sites table — floats over the maps and timeline (both stay
                visible behind the dimmed backdrop) but leaves the sidebar clear, so the
                same FilterBar instance keeps running beside it. */}
            {tableExpanded && (
              <>
              {/* Backdrop over the whole content area — sidebar and table sit above it. */}
              <div
                className="absolute inset-0 z-20 bg-black/80 animate-fade-in"
                onClick={() => setTableExpanded(false)}
                aria-hidden="true"
              />
              <div
                className="absolute inset-y-0 right-0 z-30 px-6 animate-fade-in"
                style={{ left: sidebarWidth + CONTENT_GAP_PX }}
                onClick={exitExpandedOnOutsideClick}
              >
                <div
                  ref={expandedPanelRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={translate("table.expandTable")}
                  className="relative h-full rounded shadow-2xl focus:outline-none"
                >
                  <SitesTable
                    sites={filteredSites}
                    variant="expanded"
                    clickableRow={true}
                    onSiteClick={setSelectedSite}
                    onSiteHighlight={handleSiteHighlight}
                    highlightedSiteId={highlightedSiteId}
                    onCloseExpanded={() => setTableExpanded(false)}
                    tooltipText={translate("table.tooltipDataPage")}
                  />
                </div>
              </div>
              </>
            )}
            </div>
          </AnimationProvider>
        )}
      </main>

      {/* Site Detail Modal */}
      <Modal
        isOpen={selectedSite !== null}
        onClose={() => setSelectedSite(null)}
        zIndex={Z_INDEX.MODAL}
      >
        {selectedSite && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <div className={`text-lg ${t.text.muted}`}>Loading site details...</div>
              </div>
            }
          >
            <SiteDetailPanel site={selectedSite} />
          </Suspense>
        )}
      </Modal>


      {/* Help Modal */}
      <Modal isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        zIndex={Z_INDEX.MODAL_DROPDOWN}
      >
        <TimelineHelpModal />
      </Modal>

      {/* Footer - Desktop only */}
      <AppFooter isMobile={false} />
    </div>
  );
}
