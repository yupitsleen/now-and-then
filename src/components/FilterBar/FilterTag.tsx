import { cn } from "../../styles/theme";
import { TOOLTIPS } from "../../config/tooltips";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}

/**
 * Removable filter tag/chip component
 * Used to display active filters with remove button
 */
export function FilterTag({ label, onRemove, ariaLabel }: FilterTagProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded",
      "bg-gray-500 hover:bg-gray-600 text-white font-medium border border-gray-600",
      "transition-colors duration-200"
    )}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-gray-200 hover:text-flag-red transition-colors text-sm font-bold leading-none focus:ring-2 focus:ring-flag-red focus:outline-none rounded"
        aria-label={ariaLabel}
        title={TOOLTIPS.FILTERS.REMOVE_PILL}
      >
        ×
      </button>
    </span>
  );
}
