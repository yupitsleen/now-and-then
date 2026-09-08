import { useTranslation } from "../../contexts/LocaleContext";
import { TABLE_CONFIG } from "../../constants/layout";
import { COMPACT_TABLE } from "../../constants/compactDesign";
import { SortIcon } from "./SortIcon";
import type { SortField, SortDirection } from "../../hooks/useTableSort";

interface TableHeaderProps {
  visibleColumns: Set<string>;
  variant: "compact" | "expanded";
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

/**
 * Table header with sortable columns
 * Renders only visible columns based on variant/configuration
 */
export function TableHeader({
  visibleColumns,
  variant,
  sortField,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const translate = useTranslation();

  return (
    <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <tr>
        {visibleColumns.has("type") && (
          <th
            className={`px-0.5 ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none text-center transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("type")}
            style={{ width: `${TABLE_CONFIG.TYPE_COLUMN_WIDTH}px` }}
            title={translate("table.type")}
          >
            {/* Label is sr-only: the word "Type" is what kept this icon-only
                column from shrinking. */}
            <span className="sr-only">{translate("table.type")}</span>
            <SortIcon field="type" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("name") && (
          <th
            className={`pl-2 pr-1 ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("name")}
            style={{ minWidth: variant === "compact" ? "180px" : "220px", maxWidth: variant === "expanded" ? "280px" : "none", width: variant === "expanded" ? "280px" : "auto" }}
          >
            {translate("table.siteName")}
            <SortIcon field="name" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("status") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("status")}
            style={{ width: "130px" }}
          >
            {translate("table.status")}
            <SortIcon field="status" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("dateDestroyed") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("dateDestroyed")}
            style={{ width: "130px" }}
          >
            {variant === "compact"
              ? translate("table.destructionDate")
              : translate("table.destructionDateGregorian")}
            <SortIcon field="dateDestroyed" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("dateDestroyedIslamic") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("dateDestroyedIslamic")}
            style={{ width: "150px" }}
          >
            {translate("table.destructionDateIslamic")}
            <SortIcon field="dateDestroyedIslamic" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("sourceAssessmentDate") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("sourceAssessmentDate")}
            style={{ width: "130px" }}
          >
            {translate("table.surveyDate")}
            <SortIcon field="sourceAssessmentDate" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("yearBuilt") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("yearBuilt")}
            style={{ width: "140px" }}
          >
            {translate("table.builtGregorian")}
            <SortIcon field="yearBuilt" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("yearBuiltIslamic") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("yearBuiltIslamic")}
            style={{ width: "120px" }}
          >
            {translate("table.builtIslamic")}
            <SortIcon field="yearBuiltIslamic" currentField={sortField} direction={sortDirection} />
          </th>
        )}
        {visibleColumns.has("lastUpdated") && (
          <th
            className={`${COMPACT_TABLE.headerX} ${COMPACT_TABLE.headerY} ${COMPACT_TABLE.headerText} cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30`}
            onClick={() => onSort("lastUpdated")}
            style={{ width: "130px" }}
          >
            {translate("table.lastUpdated")}
            <SortIcon field="lastUpdated" currentField={sortField} direction={sortDirection} />
          </th>
        )}
      </tr>
    </thead>
  );
}
