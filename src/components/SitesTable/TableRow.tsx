import type { Site } from "../../types";
import { getStatusHexColor } from "../../styles/theme";
import { formatDateStandard, translateStatus, getSiteDisplayNames } from "../../utils/format";
import { SiteTypeIcon, getSiteTypeLabel } from "../Icons/SiteTypeIcon";
import { useTheme } from "../../contexts/ThemeContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useLocale, useTranslation } from "../../contexts/LocaleContext";
import { COMPACT_TABLE } from "../../constants/compactDesign";

interface TableRowProps {
  site: Site;
  isHighlighted: boolean;
  visibleColumns: Set<string>;
  onSiteClick?: (site: Site) => void;
  onSiteTypeClick?: (site: Site) => void; // Type icon opens detail; falls back to onSiteClick
  onSiteHighlight?: (siteId: string | null) => void;
  rowRef?: React.RefObject<HTMLTableRowElement | null>;
  clickableRow?: boolean; // If true, entire row opens site detail (for Data page)
}

/**
 * Individual table row for a heritage site
 * Handles cell rendering based on visible columns
 */
export function TableRow({
  site,
  isHighlighted,
  visibleColumns,
  onSiteClick,
  onSiteTypeClick,
  onSiteHighlight,
  rowRef,
  clickableRow = false,
}: TableRowProps) {
  const { isDark } = useTheme();
  const t = useThemeClasses();
  const translate = useTranslation();
  const { localeConfig } = useLocale();
  const isRTL = localeConfig.direction === "rtl";

  // Get display names based on text direction (RTL vs LTR)
  const { primary, secondary, primaryDir, secondaryDir } = getSiteDisplayNames(site, isRTL);

  // For display: show actual destruction date or "Unknown"
  const displayDestructionDate = site.dateDestroyed || null;

  return (
    <tr
      ref={rowRef}
      className={`transition-colors duration-150 border-b ${t.border.default} ${
        isHighlighted
          ? isDark
            ? "bg-green-900/40 ring-2 ring-[#009639] ring-inset"
            : "bg-green-50/60 ring-2 ring-[#009639] ring-inset"
          : `${t.bg.primary}/50 ${t.bg.hover}`
      } ${clickableRow ? "cursor-pointer" : ""}`}
      onClick={() => {
        if (clickableRow && onSiteClick) {
          onSiteClick(site);
        } else {
          onSiteHighlight?.(site.id);
        }
      }}
    >
      {visibleColumns.has("type") && (
        <td className={`px-0.5 ${COMPACT_TABLE.cellY} text-center`}>
          {onSiteTypeClick || onSiteClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                (onSiteTypeClick ?? onSiteClick)?.(site);
              }}
              className="inline-flex items-center justify-center cursor-pointer hover:opacity-70"
              title={getSiteTypeLabel(site.type)}
              aria-label={`${getSiteTypeLabel(site.type)} - ${primary}`}
            >
              <SiteTypeIcon type={site.type} className={`w-3 h-3 ${t.text.body}`} />
            </button>
          ) : (
            <span className="inline-flex items-center justify-center" title={getSiteTypeLabel(site.type)}>
              <SiteTypeIcon type={site.type} className={`w-3 h-3 ${t.text.body}`} />
            </span>
          )}
        </td>
      )}
      {visibleColumns.has("name") && (
        <td className={`pl-2 pr-1 ${COMPACT_TABLE.cellY}`}>
          {onSiteClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSiteClick(site);
              }}
              className="text-left w-full hover:underline"
            >
              <div
                className={`font-semibold ${COMPACT_TABLE.text} text-[#009639] hover:text-[#007b2f]`}
                dir={primaryDir}
              >
                {primary}
              </div>
              {secondary && (
                <div
                  className={`text-[10px] ${t.text.muted} mt-0.5`}
                  dir={secondaryDir}
                >
                  {secondary}
                </div>
              )}
            </button>
          ) : (
            <div className="w-full">
              <div
                className={`font-semibold ${COMPACT_TABLE.text} ${t.text.heading}`}
                dir={primaryDir}
              >
                {primary}
              </div>
              {secondary && (
                <div
                  className={`text-[10px] ${t.text.muted} mt-0.5`}
                  dir={secondaryDir}
                >
                  {secondary}
                </div>
              )}
            </div>
          )}
        </td>
      )}
      {visibleColumns.has("status") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY}`}>
          <span
            className={`font-semibold ${COMPACT_TABLE.text}`}
            style={{ color: getStatusHexColor(site.status) }}
          >
            {translateStatus(translate, site.status)}
          </span>
        </td>
      )}
      {visibleColumns.has("dateDestroyed") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>
          {displayDestructionDate ? formatDateStandard(displayDestructionDate) : translate("common.unknown")}
        </td>
      )}
      {visibleColumns.has("dateDestroyedIslamic") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>
          {displayDestructionDate
            ? (site.dateDestroyedIslamic || translate("common.na"))
            : translate("common.unknown")
          }
        </td>
      )}
      {visibleColumns.has("sourceAssessmentDate") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>
          {formatDateStandard(site.sourceAssessmentDate)}
        </td>
      )}
      {visibleColumns.has("yearBuilt") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>{site.yearBuilt}</td>
      )}
      {visibleColumns.has("yearBuiltIslamic") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>
          {site.yearBuiltIslamic || "-"}
        </td>
      )}
      {visibleColumns.has("lastUpdated") && (
        <td className={`${COMPACT_TABLE.cellX} ${COMPACT_TABLE.cellY} ${COMPACT_TABLE.text} ${t.text.subheading}`}>
          {formatDateStandard(site.lastUpdated, localeConfig.bcp47)}
        </td>
      )}
    </tr>
  );
}
