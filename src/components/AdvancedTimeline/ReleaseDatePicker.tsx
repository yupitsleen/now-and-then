import { useTranslation } from "../../contexts/LocaleContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { cn } from "../../styles/theme";
import { COLORS } from "../../config/colorThemes";
import { findClosestReleaseIndex } from "../../utils/intervalCalculations";
import type { WaybackRelease } from "../../services/waybackService";

interface ReleaseDatePickerProps {
  releases: WaybackRelease[];
  /** Index of the "before" (yellow) release; hidden when comparison mode is off */
  beforeIndex?: number;
  onBeforeChange?: (index: number) => void;
  /** Index of the "after" (green) release */
  afterIndex: number;
  onAfterChange: (index: number) => void;
  /** Grayed out while the map version is synced automatically */
  disabled?: boolean;
}

/**
 * ReleaseDatePicker - Date fields for the two Wayback slider positions.
 *
 * Same interaction as the date labels on the maps: a native date input you can
 * type into or pick from, snapping to the nearest Wayback release.
 */
export function ReleaseDatePicker({
  releases,
  beforeIndex,
  onBeforeChange,
  afterIndex,
  onAfterChange,
  disabled = false,
}: ReleaseDatePickerProps) {
  const translate = useTranslation();

  if (releases.length === 0) return null;

  const showBefore = beforeIndex !== undefined && onBeforeChange !== undefined;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1.5">
        {showBefore && (
          <ReleaseDateField
            label={translate("timeline.beforeImageryDate")}
            color={COLORS.COMPARE_BEFORE}
            releases={releases}
            selectedIndex={beforeIndex}
            onChange={onBeforeChange}
            disabled={disabled}
          />
        )}
        <ReleaseDateField
          label={translate("timeline.afterImageryDate")}
          color={COLORS.COMPARE_AFTER}
          releases={releases}
          selectedIndex={afterIndex}
          onChange={onAfterChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

interface ReleaseDateFieldProps {
  label: string;
  color: string;
  releases: WaybackRelease[];
  selectedIndex: number;
  onChange: (index: number) => void;
  disabled: boolean;
}

function ReleaseDateField({
  label,
  color,
  releases,
  selectedIndex,
  onChange,
  disabled,
}: ReleaseDateFieldProps) {
  const t = useThemeClasses();
  const selectedDate = releases[selectedIndex]?.releaseDate ?? "";

  return (
    <div
      className={cn(
        "w-full min-w-[9rem] h-8 text-xs px-2 flex items-center gap-2",
        "border rounded-sm transition-all duration-200",
        t.input.base,
        disabled && "opacity-50"
      )}
    >
      <span
        className="w-2 h-2 rounded-full flex-none"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {/* ponytail: native <input type="date"> — same as the map date labels.
          Uncontrolled + keyed so an unrelated re-render can't reset an open picker. */}
      <input
        key={selectedDate}
        type="date"
        aria-label={label}
        disabled={disabled}
        defaultValue={selectedDate}
        min={releases[0].releaseDate}
        max={releases[releases.length - 1].releaseDate}
        onChange={(e) => {
          if (!e.target.value) return;
          onChange(findClosestReleaseIndex(releases, new Date(e.target.value)));
        }}
        className={cn(
          "flex-1 bg-transparent border-none p-0 focus:outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      />
    </div>
  );
}
