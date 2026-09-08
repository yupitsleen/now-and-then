import { useMemo, useState } from "react";
import type { Site } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useLocale, useTranslation } from "../../contexts/LocaleContext";
import { useTableSort } from "../../hooks/useTableSort";
import { useTableScroll } from "../../hooks/useTableScroll";
import { useTableExport } from "../../hooks/useTableExport";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { ExportControls } from "./ExportControls";
import { VirtualizedTableBody } from "./VirtualizedTableBody";
import { InfoIcon } from "../Icons/InfoIcon";
import { CloseIcon } from "../Icons/CloseIcon";
import { INFO_ICON_COLORS } from "../../constants/tooltip";

// Threshold for enabling virtual scrolling
const VIRTUAL_SCROLL_THRESHOLD = 500;

interface SitesTableDesktopProps {
  sites: Site[];
  onSiteClick?: (site: Site) => void;
  onSiteTypeClick?: (site: Site) => void;
  onSiteHighlight?: (siteId: string | null) => void;
  highlightedSiteId?: string | null;
  onExpandTable?: () => void;
  onCloseExpanded?: () => void;
  variant: "compact" | "expanded";
  visibleColumns?: string[]; // For resizable table - which columns to show
  tooltipText?: string; // Optional custom tooltip text for the info icon
  clickableRow?: boolean; // If true, entire row opens site detail (for Data page)
  embedded?: boolean; // Drop the panel chrome (border/background/title) - host provides it
}

/**
 * Desktop table variant for heritage sites
 * Supports compact (sidebar) and expanded (modal) layouts
 *
 * Responsibilities:
 * - Layout and styling
 * - Column visibility logic
 * - Coordination of sub-components
 *
 * Extracted responsibilities:
 * - Sort logic → useTableSort hook
 * - Scroll behavior → useTableScroll hook
 * - Export logic → useTableExport hook
 * - Header rendering → TableHeader component
 * - Row rendering → TableRow component
 * - Export UI → ExportControls component
 */
export function SitesTableDesktop({
  sites,
  onSiteClick,
  onSiteTypeClick,
  onSiteHighlight,
  highlightedSiteId,
  onExpandTable,
  onCloseExpanded,
  variant,
  visibleColumns,
  tooltipText,
  clickableRow = false,
  embedded = false,
}: SitesTableDesktopProps) {
  const { isDark } = useTheme();
  const t = useThemeClasses();
  const translate = useTranslation();
  const { localeConfig } = useLocale();

  // Islamic date columns are opt-in (default hidden) in the expanded table
  const [showIslamicDates, setShowIslamicDates] = useState(false);

  // Sort logic
  // Ascending mirrors the timeline: Next walks forward in time, down the table.
  const { sortField, sortDirection, handleSort, sortedSites } = useTableSort<Site>(sites, "dateDestroyed", "asc");

  // Scroll to highlighted row
  const { tableContainerRef, highlightedRowRef } = useTableScroll(highlightedSiteId);

  // Export functionality
  const { selectedExportFormat, setSelectedExportFormat, exportConfigs, handleExport } =
    useTableExport(sortedSites);

  // Helper to determine visible columns (memoized for performance)
  const visibleColumnsSet = useMemo(() => {
    // If visibleColumns not provided (modal), use variant logic
    if (!visibleColumns) {
      if (variant === "expanded") {
        // All columns visible in expanded mode; Islamic dates are opt-in
        const columns = ["type", "name", "status", "dateDestroyed", "sourceAssessmentDate", "yearBuilt", "lastUpdated"];
        if (showIslamicDates) columns.push("dateDestroyedIslamic", "yearBuiltIslamic");
        return new Set(columns);
      }
      // Compact mode: only essential columns
      return new Set(["name", "status", "dateDestroyed"]);
    }

    // Use provided visible columns
    return new Set(visibleColumns);
  }, [variant, visibleColumns, showIslamicDates]);

  // Helper to check if column is visible
  const isColumnVisible = (columnName: string) => visibleColumnsSet.has(columnName);

  // Determine if we should use virtual scrolling
  const shouldUseVirtualScroll = sortedSites.length > VIRTUAL_SCROLL_THRESHOLD;

  // Scrollable table with sticky headers - shared by the standalone and embedded layouts.
  // Embedded (sidebar): dir="rtl" on the scroll container puts the scrollbar on the left so
  // it doesn't sit under the floating expand button; the inner wrapper restores direction.
  const tableBody = (
    <div
      className="flex-1 overflow-y-auto pb-2"
      ref={tableContainerRef}
      dir={embedded ? "rtl" : undefined}
    >
      <div dir={embedded ? localeConfig.direction : undefined}>
      {shouldUseVirtualScroll ? (
        // Virtual scrolling for 100+ sites
        <div>
          <table className={t.table.base}>
            <TableHeader
              visibleColumns={visibleColumnsSet}
              variant={variant}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </table>
          <VirtualizedTableBody
            sites={sortedSites}
            onSiteClick={onSiteClick}
            onSiteTypeClick={onSiteTypeClick}
            onSiteHighlight={onSiteHighlight}
            highlightedSiteId={highlightedSiteId}
            variant={variant}
            isColumnVisible={isColumnVisible}
            clickableRow={clickableRow}
          />
        </div>
      ) : (
        // Standard rendering for < 100 sites
        <table className={t.table.base}>
          <TableHeader
            visibleColumns={visibleColumnsSet}
            variant={variant}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody>
            {sortedSites.map((site) => (
              <TableRow
                key={site.id}
                site={site}
                isHighlighted={highlightedSiteId === site.id}
                visibleColumns={visibleColumnsSet}
                onSiteClick={onSiteClick}
                onSiteTypeClick={onSiteTypeClick}
                onSiteHighlight={onSiteHighlight}
                rowRef={highlightedSiteId === site.id ? highlightedRowRef : undefined}
                clickableRow={clickableRow}
              />
            ))}
          </tbody>
        </table>
      )}
      </div>
    </div>
  );

  // Embedded: the host panel supplies the border, background and header
  if (embedded) {
    return <div className="flex flex-col h-full">{tableBody}</div>;
  }

  return (
    <div
      className={`flex flex-col backdrop-blur-sm border ${t.border.primary} rounded shadow-lg transition-colors duration-200 ${isDark ? "bg-[#000000]/95" : "bg-white/95"}`}
      style={{ height: 'calc(100% - 4px)' }}
    >
      {/* Title section - sticky */}
      <div className={`sticky top-0 z-20 backdrop-blur-sm flex-shrink-0 shadow-sm rounded-t-lg transition-colors duration-200 ${isDark ? "bg-[#000000]/95" : "bg-white/95"}`}>
        <div className="px-2 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2 flex-1">
              <h2 className={`text-sm font-bold ${t.text.subheading}`}>{translate("table.heritageSites")}</h2>
              {onExpandTable && (
                <button
                  onClick={onExpandTable}
                  className="text-[#009639] hover:text-[#007b2f] p-1 transition-colors"
                  aria-label={translate("table.expandTable")}
                  title={translate("table.expandTable")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              )}
              <InfoIcon
                title={tooltipText || translate("table.tooltip")}
                aria-label={tooltipText || translate("table.tooltip")}
                className={`w-4 h-4 ${INFO_ICON_COLORS.DEFAULT} ${INFO_ICON_COLORS.HOVER} transition-colors cursor-help`}
              />
            </div>
            {variant === "expanded" && (
              <div className="flex items-center gap-3">
                <label className={`flex items-center gap-1.5 text-xs cursor-pointer select-none ${t.text.subheading}`}>
                  <input
                    type="checkbox"
                    checked={showIslamicDates}
                    onChange={(e) => setShowIslamicDates(e.target.checked)}
                    className="cursor-pointer"
                  />
                  {translate("table.showIslamicDates")}
                </label>
                <ExportControls
                  selectedFormat={selectedExportFormat}
                  onFormatChange={setSelectedExportFormat}
                  onExport={handleExport}
                  exportConfigs={exportConfigs}
                />
                {onCloseExpanded && (
                  /* autoFocus: the expand button that opened this view unmounts with the
                     sidebar's Sites tab, so focus would otherwise fall back to <body>. */
                  <button
                    autoFocus
                    onClick={onCloseExpanded}
                    className="text-[#009639] hover:text-[#007b2f] p-1 transition-colors focus:ring-2 focus:ring-[#009639] focus:outline-none rounded"
                    aria-label={translate("common.close")}
                    title={translate("common.close")}
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {tableBody}
    </div>
  );
}
