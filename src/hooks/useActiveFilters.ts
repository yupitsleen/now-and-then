import { useMemo } from "react";
import type { FilterState } from "../types";
import { isDestructionDateFilterActive } from "../types/filters";

/**
 * Hook to calculate derived filter state (active count and flags)
 *
 * Extracts duplicate logic for determining active filters and counts.
 * Used across FilterBar and Timeline to avoid duplication.
 *
 * @example
 * ```tsx
 * const { hasActiveFilters, activeFilterCount } = useActiveFilters(filters);
 * ```
 */
export function useActiveFilters(filters: FilterState) {
  const activeFilterCount = useMemo(() => {
    return (
      filters.selectedTypes.length +
      filters.selectedStatuses.length +
      (isDestructionDateFilterActive(
        filters.destructionDateStart,
        filters.destructionDateEnd
      )
        ? 1
        : 0) +
      (filters.creationYearStart || filters.creationYearEnd ? 1 : 0)
    );
  }, [
    filters.selectedTypes.length,
    filters.selectedStatuses.length,
    filters.destructionDateStart,
    filters.destructionDateEnd,
    filters.creationYearStart,
    filters.creationYearEnd,
  ]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.selectedTypes.length > 0 ||
      filters.selectedStatuses.length > 0 ||
      isDestructionDateFilterActive(
        filters.destructionDateStart,
        filters.destructionDateEnd
      ) ||
      filters.creationYearStart !== null ||
      filters.creationYearEnd !== null ||
      filters.searchTerm.trim().length > 0
    );
  }, [
    filters.selectedTypes.length,
    filters.selectedStatuses.length,
    filters.destructionDateStart,
    filters.destructionDateEnd,
    filters.creationYearStart,
    filters.creationYearEnd,
    filters.searchTerm,
  ]);

  return {
    activeFilterCount,
    hasActiveFilters,
  };
}
