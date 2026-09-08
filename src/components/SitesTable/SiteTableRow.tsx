import type { Site } from "../../types";
import { getStatusHexColor } from "../../styles/theme";
import { formatDateStandard } from "../../utils/format";
import { SiteTypeIcon, getSiteTypeLabel } from "../Icons/SiteTypeIcon";
import { useTheme } from "../../contexts/ThemeContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import type { CSSProperties } from "react";

interface SiteTableRowProps {
  site: Site;
  onSiteClick?: (site: Site) => void;
  onSiteTypeClick?: (site: Site) => void;
  onSiteHighlight?: (siteId: string | null) => void;
  highlightedSiteId?: string | null;
  variant: "compact" | "expanded";
  isColumnVisible: (columnName: string) => boolean;
  style?: CSSProperties; // For virtualizer positioning
  clickableRow?: boolean; // If true, entire row opens site detail (for Data page)
}

/**
 * Individual table row component for virtual scrolling
 */
export function SiteTableRow({
  site,
  onSiteClick,
  onSiteTypeClick,
  onSiteHighlight,
  highlightedSiteId,
  variant,
  isColumnVisible,
  style,
  clickableRow = false,
}: SiteTableRowProps) {
  const { isDark } = useTheme();
  const t = useThemeClasses();
  const translate = useTranslation();

  // For display: show actual destruction date or "Unknown"
  const displayDestructionDate = site.dateDestroyed || null;

  return (
    <tr
      style={style}
      className={`transition-colors duration-150 border-b ${t.border.default} ${
        highlightedSiteId === site.id
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
      {isColumnVisible("name") && (
        <td className={t.table.td}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSiteClick?.(site);
            }}
            className="text-left w-full hover:underline"
          >
            <div className="font-semibold text-base text-[#009639] hover:text-[#007b2f]">{site.name}</div>
            {site.nameArabic && (
              <div
                className={`${
                  variant === "compact" ? "text-xs" : "text-sm"
                } ${t.text.muted} mt-1`}
                dir="rtl"
              >
                {site.nameArabic}
              </div>
            )}
          </button>
        </td>
      )}
      {isColumnVisible("type") && (
        <td className="px-1 py-3 text-center">
          {/* Only a control when it actually does something — otherwise a plain
              icon, so keyboard users never land on a no-op button. */}
          {onSiteTypeClick || onSiteClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                (onSiteTypeClick ?? onSiteClick)?.(site);
              }}
              className="inline-flex items-center justify-center cursor-pointer hover:opacity-70"
              title={getSiteTypeLabel(site.type)}
              aria-label={`${getSiteTypeLabel(site.type)} - ${site.name}`}
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
      {isColumnVisible("status") && (
        <td className={t.table.td}>
          <span
            className="font-semibold capitalize text-sm"
            style={{ color: getStatusHexColor(site.status) }}
          >
            {site.status.replace("-", " ")}
          </span>
        </td>
      )}
      {isColumnVisible("dateDestroyed") && (
        <td className={`${t.table.td} text-sm ${t.text.subheading}`}>
          {displayDestructionDate ? formatDateStandard(displayDestructionDate) : translate("common.unknown")}
        </td>
      )}
      {isColumnVisible("dateDestroyedIslamic") && (
        <td className={`${t.table.td} text-sm ${t.text.subheading}`}>
          {displayDestructionDate
            ? (site.dateDestroyedIslamic || translate("common.na"))
            : translate("common.unknown")
          }
        </td>
      )}
      {isColumnVisible("yearBuilt") && (
        <td className={`${t.table.td} text-sm ${t.text.subheading}`}>{site.yearBuilt}</td>
      )}
      {isColumnVisible("yearBuiltIslamic") && (
        <td className={`${t.table.td} text-sm ${t.text.subheading}`}>
          {site.yearBuiltIslamic || "-"}
        </td>
      )}
    </tr>
  );
}
