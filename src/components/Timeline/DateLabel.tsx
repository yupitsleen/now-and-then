import { COLORS } from "../../config/colorThemes";

interface DateLabelProps {
  /** The date string to display */
  date: string;
  /** Which side of the comparison this label belongs to; "single" for non-comparison maps */
  variant: "before" | "after" | "single";
  /** Size variant - 'sm' for timeline tooltips (10px), 'md' for map labels (15px) */
  size?: "sm" | "md";
  /** Optional opacity override (default: 1.0 for tooltips, 0.7 for map labels) */
  opacity?: number;
  /** When provided, the label becomes an editable date field (picker + typing) */
  onDateChange?: (date: string) => void;
}

/**
 * DateLabel - Reusable date label component for timeline and map views
 *
 * Provides consistent styling for date tooltips and labels across:
 * - WaybackSlider scrubber tooltips
 * - ComparisonMapView map labels
 * - SiteDetailView map labels
 *
 * Features:
 * - Green for "before" dates, red for "after", white for single-map
 * - Two size variants (sm for tooltips, md for map labels)
 * - Configurable opacity
 */
export function DateLabel({
  date,
  variant,
  size = "sm",
  opacity = size === "sm" ? 1.0 : 0.7,
  onDateChange,
}: DateLabelProps) {
  const backgroundColor =
    variant === "before"
      ? COLORS.COMPARE_BEFORE
      : variant === "after"
      ? COLORS.COMPARE_AFTER
      : COLORS.FLAG_WHITE;
  const textColor = variant === "single" ? "text-black" : "text-white";
  const fontSize = size === "sm" ? "text-[10px]" : "text-[15px]";

  const boxClasses = `px-2 py-0.5 ${textColor} ${fontSize} font-semibold rounded whitespace-nowrap shadow-lg`;
  const boxStyle = { backgroundColor, opacity, outline: "1px solid black" };

  // ponytail: native <input type="date"> — picker and keyboard entry for free.
  // Uncontrolled + keyed: a controlled value re-pushed by an unrelated re-render
  // resets the open picker back to day view, trapping you in the month/year pane.
  // The key adopts external date changes (scrubber, snapping) by remounting instead.
  if (onDateChange) {
    return (
      <input
        key={date}
        type="date"
        aria-label="Imagery date"
        data-testid={`date-label-${variant}`}
        className={`${boxClasses} bg-transparent cursor-pointer`}
        style={{ ...boxStyle, colorScheme: variant === "single" ? "light" : "dark" }}
        defaultValue={date}
        onChange={(e) => e.target.value && onDateChange(e.target.value)}
      />
    );
  }

  return (
    <div
      data-testid={`date-label-${variant}`}
      className={boxClasses}
      style={boxStyle}
    >
      {date}
    </div>
  );
}
