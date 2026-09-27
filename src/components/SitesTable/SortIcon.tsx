import { useThemeClasses } from "../../hooks/useThemeClasses";
import type { SortField, SortDirection } from "../../hooks/useTableSort";

interface SortIconProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}

/**
 * Sort indicator icon for table headers
 * Shows up/down arrow for current sort field, up/down for others
 */
export function SortIcon({ field, currentField, direction }: SortIconProps) {
  const t = useThemeClasses();

  if (currentField !== field) {
    return <span className={`ml-1 ${t.icon.default}`}>↕</span>;
  }

  return <span className="text-brand ml-1">{direction === "asc" ? "↑" : "↓"}</span>;
}
