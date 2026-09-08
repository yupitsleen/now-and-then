import { useState } from "react";
import type { Site } from "../../types";
import { getStatusHexColor } from "../../styles/theme";
import {
  formatDateCompact,
  formatDateLong,
  formatDateStandard,
  translateStatus,
  translateSiteType,
  getSiteDisplayNames,
  getEffectiveDestructionDate,
} from "../../utils/format";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocale, useTranslation } from "../../contexts/LocaleContext";
import { useTableSort, type SortField } from "../../hooks/useTableSort";

interface SitesTableMobileProps {
  sites: Site[];
}

/**
 * Mobile accordion variant of sites table
 * Features: Collapsible rows, status-colored names, sortable columns
 *
 * Responsibilities:
 * - Mobile-optimized layout with accordion-style rows
 * - Expand/collapse functionality
 * - Coordination with useTableSort hook for sorting
 */
export function SitesTableMobile({ sites }: SitesTableMobileProps) {
  const t = useThemeClasses();
  const { isDark } = useTheme();
  const translate = useTranslation();
  const { localeConfig } = useLocale();
  const isRTL = localeConfig.direction === "rtl";

  // Sort logic (shared with Desktop variant via hook)
  const { sortField, sortDirection, handleSort, sortedSites } = useTableSort<Site>(sites, "dateDestroyed", "asc");

  // Mobile-specific state
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className={`${t.icon.default} ml-1`}>↕</span>;
    }
    return <span className="text-[#009639] ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Non-sticky header - centered */}
      <div className={`pb-3 mb-3 border-b-2 ${t.border.subtle}`}>
        <h2 className={`text-lg font-bold ${t.text.subheading} text-center`}>
          {translate("table.heritageSites")}
        </h2>
        <p className={`text-xs ${t.text.muted} text-center`}>
          {translate("table.showing")} {sortedSites.length} {sortedSites.length !== 1 ? translate("table.sites") : translate("table.site")}
        </p>
      </div>

      {/* Sticky column headers with sorting */}
      <div className={`sticky top-[85px] ${t.bg.primary} z-40 border-b-2 ${t.border.subtle} pb-2 mb-2 shadow-sm`}>
        <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2">
          <div
            className={`text-xs font-bold ${t.text.body} uppercase cursor-pointer hover:${t.text.heading} select-none flex items-center gap-1`}
            onClick={() => handleSort("name")}
          >
            {translate("table.siteName")}
            <SortIcon field="name" />
          </div>
          <div
            className={`text-xs font-bold ${t.text.body} uppercase whitespace-nowrap cursor-pointer hover:${t.text.heading} select-none flex items-center gap-1`}
            onClick={() => handleSort("dateDestroyed")}
          >
            {translate("table.destructionDate")}
            <SortIcon field="dateDestroyed" />
          </div>
        </div>
      </div>

      {/* Mobile accordion table */}
      <div className="space-y-2">
        {sortedSites.map((site, index) => {
          const { primary, secondary, primaryDir, secondaryDir } = getSiteDisplayNames(site, isRTL);
          const effectiveDestructionDate = getEffectiveDestructionDate(site);
          const displayDestructionDate = site.dateDestroyed || null;

          return (
            <div
              key={site.id}
              className={`border-2 rounded-lg overflow-hidden ${
                isDark ? "border-gray-700" : "border-[#fecaca]"
              } ${
                index % 2 === 0
                  ? isDark
                    ? "bg-gray-800/50"
                    : "bg-[#fee2e2]"
                  : isDark
                  ? "bg-gray-900/50"
                  : "bg-white"
              }`}
            >
              {/* Collapsed row - clickable to expand */}
              <div
                className={`grid grid-cols-[1fr_auto_auto] gap-3 p-3 items-center cursor-pointer transition-colors ${
                  isDark ? "hover:bg-gray-700/50" : "hover:bg-[#fecaca]"
                }`}
                onClick={() => setExpandedRowId(expandedRowId === site.id ? null : site.id)}
              >
                {/* Site Name - color-coded by status */}
                <div className="min-w-0">
                  <div
                    className="font-semibold text-xs truncate"
                    style={{ color: getStatusHexColor(site.status) }}
                    dir={primaryDir}
                  >
                    {primary}
                  </div>
                  {secondary && (
                    <div
                      className={`text-xs ${t.text.muted} truncate`}
                      dir={secondaryDir}
                      lang={isRTL ? "en" : "ar"}
                    >
                      {secondary}
                    </div>
                  )}
                </div>

              {/* Date */}
              <div className={`text-xs ${t.text.body} whitespace-nowrap`}>
                {formatDateCompact(effectiveDestructionDate)}
              </div>

              {/* Chevron indicator */}
              <div className={t.icon.default}>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedRowId === site.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Expanded details - full site information */}
            {expandedRowId === site.id && (
              <div className={`border-t-2 ${t.border.default} p-4 ${t.bg.secondary} space-y-3`}>
                {/* Site Name (Full) */}
                <div className="text-center">
                  <h3
                    className={`font-bold text-base ${t.text.heading}`}
                    dir={primaryDir}
                  >
                    {primary}
                  </h3>
                  {secondary && (
                    <p
                      className={`text-sm ${t.text.body} mt-1`}
                      dir={secondaryDir}
                      lang={isRTL ? "en" : "ar"}
                    >
                      {secondary}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.type")}:
                  </span>
                  <p className={`text-sm ${t.text.heading}`}>
                    {translateSiteType(translate, site.type)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.status")}:
                  </span>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: getStatusHexColor(site.status) }}
                  >
                    {translateStatus(translate, site.status)}
                  </p>
                </div>

                {/* Year Built */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.yearBuilt")}:
                  </span>
                  <p className={`text-sm ${t.text.heading}`}>{site.yearBuilt}</p>
                  {site.yearBuiltIslamic && (
                    <p className={`text-xs ${t.text.muted}`}>
                      {translate("table.islamic")}: {site.yearBuiltIslamic}
                    </p>
                  )}
                </div>

                {/* Date Destroyed */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.dateDestroyed")}:
                  </span>
                  <p className={`text-sm ${t.text.heading}`}>
                    {displayDestructionDate ? formatDateLong(displayDestructionDate, localeConfig.bcp47) : translate("common.unknown")}
                  </p>
                  {site.dateDestroyedIslamic && displayDestructionDate && (
                    <p className={`text-xs ${t.text.muted}`}>
                      {translate("table.islamic")}: {site.dateDestroyedIslamic}
                    </p>
                  )}
                </div>

                {/* Survey Date (if exists) */}
                {site.sourceAssessmentDate && (
                  <div>
                    <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                      {translate("table.surveyDate")}:
                    </span>
                    <p className={`text-sm ${t.text.heading}`}>
                      {formatDateLong(site.sourceAssessmentDate, localeConfig.bcp47)}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.description")}:
                  </span>
                  <p className={`text-sm ${t.text.heading} mt-1`}>{site.description}</p>
                </div>

                {/* Coordinates */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.coordinates")}:
                  </span>
                  <p className={`text-sm ${t.text.heading}`}>
                    {site.coordinates[0].toFixed(6)}, {site.coordinates[1].toFixed(6)}
                  </p>
                </div>

                {/* Sources */}
                {site.sources?.length > 0 && (
                  <div>
                    <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                      {translate("table.sources")}:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {site.sources?.map((source, idx) => (
                        <li key={idx} className="text-sm">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#009639] hover:underline"
                          >
                            {source.title}
                          </a>
                          {source.date && (
                            <span className={`text-xs ${t.text.muted} ml-2`}>
                              ({formatDateStandard(source.date, localeConfig.bcp47)})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verified By */}
                {site.verifiedBy?.length > 0 && (
                  <div>
                    <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                      {translate("table.verifiedBy")}:
                    </span>
                    <p className={`text-sm ${t.text.heading}`}>{site.verifiedBy?.join(", ")}</p>
                  </div>
                )}

                {/* Last Updated */}
                <div>
                  <span className={`text-xs font-semibold ${t.text.muted} uppercase`}>
                    {translate("table.lastUpdated")}:
                  </span>
                  <p className={`text-sm ${t.text.heading}`}>
                    {formatDateLong(site.lastUpdated, localeConfig.bcp47)}
                  </p>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
