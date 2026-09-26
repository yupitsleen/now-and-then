import { useTranslation } from "../../contexts/LocaleContext";
import { CountBadge } from "../Badge/CountBadge";

interface FiltersToggleButtonProps {
  onClick: () => void;
  activeFilterCount?: number;
}

/**
 * Re-opens a collapsed filter sidebar. Lives in the header's top-left square, so it
 * sizes to the header's height rather than carrying its own padding.
 */
export function FiltersToggleButton({ onClick, activeFilterCount = 0 }: FiltersToggleButtonProps) {
  const translate = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-full aspect-square flex items-center justify-center text-[#fefefe] hover:bg-white/10 transition-colors focus:ring-2 focus:ring-inset focus:ring-brand focus:outline-none"
      aria-label={translate("filters.showFilters")}
      title={translate("filters.showFilters")}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      {activeFilterCount > 0 && (
        <span className="absolute top-1 right-1">
          <CountBadge count={activeFilterCount} variant="primary" />
        </span>
      )}
    </button>
  );
}
