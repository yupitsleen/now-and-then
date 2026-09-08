import { memo, useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Site, FilterState } from "../../types";
import { SITE_TYPES, STATUS_OPTIONS } from "../../constants/filters";
import { translateSiteType, translateStatus } from "../../utils/format";
import { FilterButton } from "./FilterButton";
import { FilterCheckboxList } from "./FilterCheckboxList";
import { DateRangeFilter } from "./DateRangeFilter";
import { YearRangeFilter } from "./YearRangeFilter";
import { Input } from "../Form/Input";
import { Button } from "../Button/Button";
import { CountBadge } from "../Badge/CountBadge";
import { CloseIcon } from "../Icons/CloseIcon";
import { SiteTypeIcon } from "../Icons/SiteTypeIcon";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useDefaultDateRange } from "../../hooks/useDefaultDateRange";
import { isDestructionDateRangeApplied } from "../../types/filters";
import { useDefaultYearRange } from "../../hooks/useDefaultYearRange";
import { useActiveFilters } from "../../hooks/useActiveFilters";
import { useDebounce } from "../../hooks/useDebounce";
import { Z_INDEX } from "../../constants/layout";
import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { TOOLTIPS } from "../../config/tooltips";

/** Sidebar tab glyphs: list, funnel, cog (heroicons outline). */
const TAB_ICON_PATHS: Record<"sites" | "filters" | "settings", string> = {
  sites: "M4 6h16M4 12h16M4 18h16",
  filters: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  sites?: Site[];
  defaultDateRange?: {
    defaultStartDate: Date;
    defaultEndDate: Date;
  };
  defaultYearRange?: {
    defaultStartYear: string;
    defaultEndYear: string;
    defaultStartEra: "BCE" | "CE";
  };
  showActions?: boolean;
  totalSites?: number;
  filteredSites?: number;
  onClearAll?: () => void;
  /**
   * Presentation:
   * - "bar" (default): horizontal strip of popover buttons + mobile drawer (unchanged).
   * - "sidebar": persistent vertical facet panel on desktop; mobile keeps the drawer.
   */
  variant?: "bar" | "sidebar";
  /**
   * Sidebar variant only: whether the panel is railed. Owned by the host, because a
   * host that lays out around the rail needs the same boolean - two copies of it
   * drift. Omit both to get an uncollapsible sidebar.
   */
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** When provided, renders a control to switch between "bar" and "sidebar" presentations. */
  onVariantToggle?: () => void;
  /**
   * Sidebar variant only: when provided, the sidebar gets Filters/Settings tabs and this
   * renders under the Settings tab. Page-owned controls (e.g. Wayback comparison options).
   */
  settings?: ReactNode;
  /**
   * Sidebar variant only: when provided, adds a Sites tab holding this content
   * (typically an embedded <SitesTable />).
   */
  sitesTab?: ReactNode;
  /**
   * Sites tab only: renders a floating expand button over the table header. While
   * `sitesExpanded` is true the host owns the Sites view, so the tab drops out of the
   * sidebar and only Filters/Settings remain.
   */
  sitesExpanded?: boolean;
  onSitesExpandToggle?: () => void;
  /** Sidebar variant only: makes the panel drag-resizable (see useTableResize). */
  resize?: {
    width: number;
    isResizing: boolean;
    onResizeStart: () => void;
  };
}

/**
 * FilterBar - Compact filter interface with count badges
 *
 * **Key Features:**
 * - Compact filter buttons with count badges
 * - Responsive mobile drawer instead of awkward stacking
 * - Better use of horizontal space on desktop
 * - Uses Headless UI (Popover, Dialog) for accessibility
 *
 * **Design Pattern:**
 * Desktop: [Search] [Filter Buttons] [Clear All] [Count]
 *
 * Mobile:  [Search] [Filters Button (count)] [Count]
 *          [Mobile Drawer for all filters]
 */
export const FilterBar = memo(function FilterBar({
  filters,
  onFilterChange,
  sites = [],
  defaultDateRange: providedDateRange,
  defaultYearRange: providedYearRange,
  showActions = false,
  totalSites = 0,
  filteredSites = 0,
  onClearAll,
  variant = "bar",
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  onVariantToggle,
  settings,
  sitesTab,
  sitesExpanded = false,
  onSitesExpandToggle,
  resize,
}: FilterBarProps) {
  const { t: translate, localeConfig } = useLocale();
  const t = useThemeClasses();
  const { isDark } = useTheme();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const sidebarTabs = [
    // While the table is expanded it owns the Sites view, so the tab drops out here.
    ...(sitesTab && !sitesExpanded ? (["sites"] as const) : []),
    "filters" as const,
    ...(settings ? (["settings"] as const) : []),
  ];
  const [sidebarTab, setSidebarTab] = useState<(typeof sidebarTabs)[number]>(sidebarTabs[0]);

  // The available tabs depend on props, so a selected tab can disappear (e.g. a page
  // stops passing `settings`). Fall back to the first tab rather than an empty panel.
  const activeTab = sidebarTabs.includes(sidebarTab) ? sidebarTab : sidebarTabs[0];

  // Only a tabpanel when there is actually a tablist above it — with a single
  // section the header renders a plain heading instead.
  const tabPanelProps =
    sidebarTabs.length > 1
      ? {
          role: "tabpanel",
          id: `filter-sidebar-panel-${activeTab}`,
          "aria-labelledby": `filter-sidebar-tab-${activeTab}`,
        }
      : {};

  // Browsers restore a scroll container's offset on reload, which can drop the
  // sidebar in mid-list with its header off-screen. Always start at the top.
  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sidebarRef.current) sidebarRef.current.scrollTop = 0;
  }, [sidebarCollapsed]);

  // Local state for search input (for immediate UI feedback)
  const [searchInputValue, setSearchInputValue] = useState(filters.searchTerm);

  // Debounce search to avoid filtering on every keystroke (300ms delay)
  const debouncedSearchTerm = useDebounce(searchInputValue, 300);

  // Update filter when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      onFilterChange({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters.searchTerm, onFilterChange]);

  // Sync local state when external searchTerm changes (e.g., clear all filters)
  useEffect(() => {
    setSearchInputValue(filters.searchTerm);
  }, [filters.searchTerm]);

  // Use provided ranges or calculate from sites
  const computedDateRange = useDefaultDateRange(sites);
  const computedYearRange = useDefaultYearRange(sites);

  const { defaultStartDate, defaultEndDate } = providedDateRange || computedDateRange;
  const { defaultStartYear, defaultEndYear, defaultStartEra } = providedYearRange || computedYearRange;

  // Use custom hook for derived filter state (memoized)
  const { hasActiveFilters, activeFilterCount } = useActiveFilters(filters);

  // Calculate counts for each type and status
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sites.forEach((site) => {
      counts[site.type] = (counts[site.type] || 0) + 1;
    });
    return counts;
  }, [sites]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sites.forEach((site) => {
      counts[site.status] = (counts[site.status] || 0) + 1;
    });
    return counts;
  }, [sites]);

  // Filter out unused statuses (with count of 0)
  const availableStatuses = useMemo(() => {
    return STATUS_OPTIONS.filter((status) => (statusCounts[status] || 0) > 0);
  }, [statusCounts]);

  // Memoized callback handlers to prevent unnecessary re-renders
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInputValue("");
  }, []);

  const handleOpenMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(true);
  }, []);

  const handleCloseMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(false);
  }, []);

  const handleMobileClearAllAndClose = useCallback(() => {
    onClearAll?.();
    setIsMobileFiltersOpen(false);
  }, [onClearAll]);

  // Filter change handlers (memoized with stable references)
  const handleTypesChange = useCallback((types: string[]) => {
    onFilterChange({ selectedTypes: types });
  }, [onFilterChange]);

  const handleStatusesChange = useCallback((statuses: string[]) => {
    onFilterChange({ selectedStatuses: statuses });
  }, [onFilterChange]);

  const handleDestructionStartDateChange = useCallback((date: Date | null) => {
    onFilterChange({ destructionDateStart: date });
  }, [onFilterChange]);

  const handleDestructionEndDateChange = useCallback((date: Date | null) => {
    onFilterChange({ destructionDateEnd: date });
  }, [onFilterChange]);

  const handleCreationYearStartChange = useCallback((year: number | null) => {
    onFilterChange({ creationYearStart: year });
  }, [onFilterChange]);

  const handleCreationYearEndChange = useCallback((year: number | null) => {
    onFilterChange({ creationYearEnd: year });
  }, [onFilterChange]);

  const handleToggleUnknownDates = useCallback(() => {
    onFilterChange({ showUnknownDates: !filters.showUnknownDates });
  }, [onFilterChange, filters.showUnknownDates]);

  // Single source of truth for the four filters — the desktop popover row and the
  // mobile drawer both render from this, so a filter is defined (and wired) once.
  const filterSections: {
    key: string;
    /** Verbose call-to-action label for the bar variant's popover button. */
    label: string;
    /** Short noun heading for the sidebar/drawer facet sections. */
    heading: string;
    count: number;
    /** Range facets are on/off, not countable — the sidebar shows a dot, not "1". */
    isRange?: boolean;
    panelWidth?: string;
    tooltip?: string;
    content: React.ReactNode;
  }[] = [
    {
      key: "destructionDate",
      label: translate("filters.destructionDate"),
      heading: translate("filters.destructionDate"),
      // Badge whenever a range is applied — including the default window — so the
      // user can see the list is date-limited without opening the facet.
      count: isDestructionDateRangeApplied(
        filters.destructionDateStart,
        filters.destructionDateEnd
      )
        ? 1
        : 0,
      isRange: true,
      panelWidth: "min-w-max",
      tooltip: TOOLTIPS.FILTERS.DATE_FILTER,
      content: (
        <DateRangeFilter
          label=""
          startDate={filters.destructionDateStart}
          endDate={filters.destructionDateEnd}
          onStartChange={handleDestructionStartDateChange}
          onEndChange={handleDestructionEndDateChange}
          defaultStartDate={defaultStartDate}
          defaultEndDate={defaultEndDate}
        />
      ),
    },
    {
      key: "type",
      label: translate("filters.selectTypes"),
      heading: translate("table.type"),
      count: filters.selectedTypes.length,
      tooltip: TOOLTIPS.FILTERS.TYPE_FILTER,
      content: (
        <FilterCheckboxList
          options={SITE_TYPES}
          selectedValues={filters.selectedTypes}
          onChange={handleTypesChange}
          formatLabel={(type) => translateSiteType(translate, type)}
          counts={typeCounts}
          getIcon={(type) => <SiteTypeIcon type={type} className="w-6 h-6" />}
        />
      ),
    },
    {
      key: "status",
      label: translate("filters.selectStatus"),
      heading: translate("table.status"),
      count: filters.selectedStatuses.length,
      tooltip: TOOLTIPS.FILTERS.STATUS_FILTER,
      content: (
        <FilterCheckboxList
          options={availableStatuses}
          selectedValues={filters.selectedStatuses}
          onChange={handleStatusesChange}
          formatLabel={(status) => translateStatus(translate, status)}
          counts={statusCounts}
        />
      ),
    },
    {
      key: "yearBuilt",
      label: translate("filters.yearBuilt"),
      heading: translate("filters.yearBuilt"),
      count: filters.creationYearStart || filters.creationYearEnd ? 1 : 0,
      isRange: true,
      panelWidth: "min-w-max",
      tooltip: TOOLTIPS.FILTERS.YEAR_FILTER,
      content: (
        <YearRangeFilter
          label=""
          startYear={filters.creationYearStart}
          endYear={filters.creationYearEnd}
          onStartChange={handleCreationYearStartChange}
          onEndChange={handleCreationYearEndChange}
          supportBCE={true}
          startYearDefault={defaultStartYear}
          endYearDefault={defaultEndYear}
          startEraDefault={defaultStartEra}
        />
      ),
    },
  ];

  // Shared render fragments — identical across variants, so search and the whole
  // mobile experience are defined once.
  const searchBox = (
    // min() so the 200px floor never exceeds a narrow sidebar's width.
    <div className="relative flex-shrink-0 w-full sm:w-auto sm:min-w-[min(200px,100%)]">
      <Input
        type="text"
        value={searchInputValue}
        onChange={handleSearchInputChange}
        placeholder={translate("filters.searchPlaceholder")}
        className="w-full h-8 px-2.5 pr-8 text-xs text-black placeholder:text-gray-400"
      />
      {searchInputValue.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none rounded"
          aria-label={translate("filters.clearSearch")}
          title={TOOLTIPS.FILTERS.CLEAR_SEARCH}
        >
          <CloseIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  const showUnknownDatesCheckbox = (
    <label className="flex items-center gap-3 cursor-pointer" title={translate("timeline.showUnknownDatesTooltip")}>
      <input
        type="checkbox"
        checked={filters.showUnknownDates}
        onChange={handleToggleUnknownDates}
        className="w-5 h-5 rounded border-gray-300 text-[#009639] focus:ring-[#009639] cursor-pointer"
      />
      <span className={cn("text-sm", t.text.body)}>
        {translate("timeline.showUnknownDates")}
      </span>
    </label>
  );

  const mobileFiltersTrigger = (
    <button
      type="button"
      onClick={handleOpenMobileFilters}
      className={cn(
        "md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border",
        "transition-all duration-200 focus:ring-2 focus:ring-[#009639] focus:outline-none",
        t.bg.primary,
        t.border.subtle,
        t.bg.hover,
        t.text.body
      )}
      aria-label={translate("filters.openFilters")}
      aria-expanded={isMobileFiltersOpen}
      title={TOOLTIPS.FILTERS.OPEN_MOBILE}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      <span>{translate("filters.filters")}</span>
      {activeFilterCount > 0 && <CountBadge count={activeFilterCount} variant="primary" />}
    </button>
  );

  const mobileDrawer = (
    <Dialog
      open={isMobileFiltersOpen}
      onClose={handleCloseMobileFilters}
      className="relative md:hidden"
      style={{ zIndex: Z_INDEX.MODAL }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Drawer */}
      <div className="fixed inset-0 flex items-end justify-center">
        <DialogPanel
          className={cn(
            "w-full max-h-[85vh] rounded-t-2xl p-6 overflow-y-auto",
            "animate-slide-up",
            t.bg.primary
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className={cn("text-lg font-semibold", t.text.heading)}>
              {translate("filters.filters")}
            </DialogTitle>
            <button
              type="button"
              onClick={handleCloseMobileFilters}
              className={cn("p-1 rounded-md transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none", t.bg.hover)}
              aria-label={translate("filters.closeFilters")}
            >
              <CloseIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6">
            {filterSections.map((filterSection) => (
              <div key={filterSection.key}>
                <h3 className={cn("text-sm font-semibold mb-2", t.text.heading)}>
                  {filterSection.heading}
                </h3>
                {filterSection.content}
              </div>
            ))}

            {/* Show Unknown Dates Toggle */}
            <div>{showUnknownDatesCheckbox}</div>

            {/* Settings — the drawer has no tabs, so they just get their own section. */}
            {settings && (
              <div>
                <h3 className={cn("text-sm font-semibold mb-2", t.text.heading)}>
                  {translate("filters.settings")}
                </h3>
                {settings}
              </div>
            )}
          </div>

          {/* Mobile Drawer Actions */}
          <div className="mt-6 flex gap-3">
            {hasActiveFilters && onClearAll && (
              <Button
                variant="danger"
                size="md"
                onClick={handleMobileClearAllAndClose}
                fullWidth
              >
                {translate("filters.clearAll")}
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleCloseMobileFilters}
              fullWidth
            >
              {translate("filters.apply")}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  // Layout toggle (bar <-> sidebar) — only shown when a page opts in via onVariantToggle.
  const variantToggleButton = onVariantToggle ? (
    <button
      type="button"
      onClick={onVariantToggle}
      className={cn(
        "p-1.5 rounded-md transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none",
        t.bg.hover,
        t.text.body
      )}
      aria-label={translate(variant === "sidebar" ? "filters.switchToTopBar" : "filters.switchToSidebar")}
      title={translate(variant === "sidebar" ? "filters.switchToTopBar" : "filters.switchToSidebar")}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="15" rx="1.5" strokeWidth={2} />
        {variant === "sidebar" ? (
          <line x1="3" y1="9" x2="21" y2="9" strokeWidth={2} />
        ) : (
          <line x1="9" y1="4.5" x2="9" y2="19.5" strokeWidth={2} />
        )}
      </svg>
    </button>
  ) : null;

  // Sidebar: persistent vertical facet panel on desktop; mobile keeps the drawer.
  // Each facet is a self-contained <section> so a collapse header can be added later.
  if (variant === "sidebar") {
    return (
      <>
        {sidebarCollapsed ? (
          /* Collapsed: nothing on desktop — the host renders <FiltersToggleButton /> in
             the header's top-left square to bring the panel back. */
          null
        ) : (
          <aside
            className={cn(
              "hidden md:flex md:flex-col md:flex-shrink-0 overflow-hidden backdrop-blur-sm border rounded shadow-lg relative z-10 transition-colors duration-200",
              !resize && "md:w-48",
              t.border.primary,
              isDark ? "bg-[#000000]/95" : "bg-white/95"
            )}
            style={resize ? { width: `${resize.width}px` } : undefined}
            aria-label={translate("filters.filters")}
          >
            {/* Header: tabs (or title) + layout toggle + collapse (hide) button */}
            <div dir={localeConfig.direction} className="flex items-center justify-between gap-2 flex-shrink-0 p-3 pb-2">
              {sidebarTabs.length > 1 ? (
                /* Tabs — plain buttons; no roving-tabindex tablist.
                   ponytail: upgrade to full ARIA tabs if keyboard users ask for arrow-key nav. */
                <div className="flex items-center gap-1" role="tablist">
                  {sidebarTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      id={`filter-sidebar-tab-${tab}`}
                      aria-selected={activeTab === tab}
                      aria-controls={`filter-sidebar-panel-${tab}`}
                      onClick={() => setSidebarTab(tab)}
                      title={translate(`filters.${tab}`)}
                      className={cn(
                        "px-2 py-1 rounded-t border-b-2 transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none",
                        activeTab === tab
                          ? cn("border-[#009639]", t.text.heading)
                          : cn("border-transparent", t.text.muted, t.bg.hover)
                      )}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TAB_ICON_PATHS[tab]} />
                      </svg>
                      <span className="sr-only">{translate(`filters.${tab}`)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <h2 className={cn("text-base font-bold", t.text.heading)}>
                  {translate("filters.filters")}
                </h2>
              )}
              <div className="flex items-center gap-1">
                {variantToggleButton}
                {/* No handler means the host does not lay out around a rail, so
                    there is nowhere for the panel to collapse to. */}
                {onSidebarCollapsedChange && (
                  <button
                    type="button"
                    onClick={() => onSidebarCollapsedChange(true)}
                    className={cn(
                      "p-1 rounded-md transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none",
                      t.bg.hover,
                      t.text.body
                    )}
                    aria-label={translate("filters.hideFilters")}
                    title={translate("filters.hideFilters")}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {activeTab === "sites" ? (
              /* Sites table fills the panel and scrolls internally. */
              <div className="flex-1 min-h-0 px-1.5 pb-1.5 relative" {...tabPanelProps}>
                {onSitesExpandToggle && (
                  <button
                    type="button"
                    onClick={onSitesExpandToggle}
                    className="absolute top-0.5 right-1.5 z-20 p-1 rounded bg-inherit text-[#009639] hover:text-[#007b2f] transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none"
                    aria-label={translate("table.expandTable")}
                    title={translate("table.expandTable")}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                )}
                {sitesTab}
              </div>
            ) : (
              /* dir="rtl" on the scroll container puts the scrollbar on the left; the
                 inner wrapper restores the locale's reading direction for the content. */
              <div
                ref={sidebarRef}
                dir="rtl"
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
              >
                <div
                  dir={localeConfig.direction}
                  className="flex flex-col gap-3 p-3 pt-1"
                  {...tabPanelProps}
                >
                  {activeTab === "settings" ? settings : (
              <>
            {/* Result count — prominent (not the 10px of the bar) — + Clear All */}
            {showActions && (
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold", t.text.body)}>
                  {translate("filters.showingCount", { filtered: filteredSites, total: totalSites })}
                </span>
                {hasActiveFilters && onClearAll && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={onClearAll}
                    className="whitespace-nowrap"
                    title={TOOLTIPS.FILTERS.CLEAR_ALL}
                  >
                    {translate("filters.clearAll")}
                  </Button>
                )}
              </div>
            )}

            {searchBox}

            {/* Facets — collapsible accordion groups, open by default.
                ponytail: native <details>, so open/close needs no state and is
                keyboard-accessible for free. Open state is not persisted — add
                localStorage only if users ask for it to survive reloads. */}
            {filterSections.map((filterSection) => (
              <details key={filterSection.key} open className="group">
                <summary
                  className={cn(
                    "flex items-center gap-2 mb-2 cursor-pointer list-none rounded focus:ring-2 focus:ring-[#009639] focus:outline-none",
                    "[&::-webkit-details-marker]:hidden"
                  )}
                >
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0 transition-transform group-open:rotate-90",
                      localeConfig.direction === "rtl" && "-scale-x-100",
                      t.text.body
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                  <h3 className={cn("text-sm font-semibold", t.text.heading)}>
                    {filterSection.heading}
                  </h3>
                  {filterSection.count > 0 &&
                    (filterSection.isRange ? (
                      <span
                        className="w-2 h-2 rounded-full bg-[#009639]"
                        role="img"
                        aria-label={translate("filters.filterActive")}
                      />
                    ) : (
                      <CountBadge count={filterSection.count} variant="primary" />
                    ))}
                </summary>
                {filterSection.content}
              </details>
            ))}

            <div>{showUnknownDatesCheckbox}</div>
              </>
                  )}
                </div>
              </div>
            )}

            {resize && (
              <div
                className={cn(
                  "absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 hover:bg-[#ed3039] hover:bg-opacity-30 transition-colors",
                  resize.isResizing && "bg-[#ed3039] bg-opacity-50"
                )}
                onMouseDown={resize.onResizeStart}
                title={translate("aria.dragToResizeTable")}
                aria-label={translate("aria.resizeTable")}
              />
            )}
          </aside>
        )}

        {/* Mobile: search + Filters trigger (the drawer holds the facets) —
            keeps the mobile experience identical to the bar variant. flex-wrap so
            the full-width search doesn't push the trigger off-screen. */}
        <div className="md:hidden flex flex-wrap items-center gap-1.5 p-2">
          {searchBox}
          {mobileFiltersTrigger}
        </div>

        {mobileDrawer}
      </>
    );
  }

  // Bar (default): horizontal strip of popover buttons; mobile drawer.
  return (
    <div className="space-y-2">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {/* Layout toggle — far left, before the count, so switching feels continuous */}
        {onVariantToggle && <div className="hidden md:flex flex-shrink-0">{variantToggleButton}</div>}

        {/* Results Count - Far left, super small */}
        {showActions && (
          <div className={cn("text-[10px] whitespace-nowrap", t.text.muted)}>
            {translate("filters.showingCount", { filtered: filteredSites, total: totalSites })}
          </div>
        )}

        {/* Center: Filters */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 flex-1">
          {searchBox}

          {/* Desktop Filter Buttons - Hidden on mobile */}
          <div className="hidden md:flex md:items-center md:gap-1.5">
          {filterSections.map((filterSection) => (
            <FilterButton
              key={filterSection.key}
              label={filterSection.label}
              count={filterSection.count}
              panelWidth={filterSection.panelWidth}
              tooltip={filterSection.tooltip}
            >
              {filterSection.content}
            </FilterButton>
          ))}

          {/* Show Unknown Dates Toggle — only at lg+ to avoid wrapping at md widths */}
          <button
            type="button"
            onClick={handleToggleUnknownDates}
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border",
              "transition-all duration-200 focus:ring-2 focus:ring-[#009639] focus:outline-none",
              filters.showUnknownDates
                ? "bg-[#009639] text-white border-[#009639]"
                : cn(t.bg.primary, t.border.subtle, t.bg.hover, t.text.body)
            )}
            aria-label={translate("timeline.showUnknownDates")}
            aria-pressed={filters.showUnknownDates}
            title={translate("timeline.showUnknownDatesTooltip")}
          >
            {filters.showUnknownDates ? "✓ " : ""}
            {translate("timeline.showUnknownDates")}
          </button>
          </div>

          {mobileFiltersTrigger}

          {/* Clear All Button */}
          {showActions && hasActiveFilters && onClearAll && (
            <Button
              variant="danger"
              size="sm"
              onClick={onClearAll}
              className="whitespace-nowrap"
              title={TOOLTIPS.FILTERS.CLEAR_ALL}
            >
              {translate("filters.clearAll")}
            </Button>
          )}
        </div>
      </div>

      {mobileDrawer}
    </div>
  );
});
