import { useMemo } from "react";
import { HISTORICAL_IMAGERY, type TimePeriod } from "../../constants/map";
import { useAnimation } from "../../contexts/AnimationContext";
import { useTranslation } from "../../contexts/LocaleContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface TimeToggleProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  /** Actual date of the newest Wayback release, overriding the CURRENT constant's stale date */
  latestReleaseDate?: string;
}

/**
 * Format date string to full format for tooltips (e.g., "Feb 20, 2014" or "Oct 6, 2023")
 * Uses UTC to avoid timezone offset issues
 */
function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z"); // Parse as UTC
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

/**
 * Format date string to short month + year (e.g., "Feb 2014")
 * Distinguishes periods that share the same year
 */
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z"); // Parse as UTC
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Toggle control for switching between historical satellite imagery time periods
 * Shows year for each period (dynamically read from HISTORICAL_IMAGERY)
 * Tooltips display full dates on hover
 * Manual period selection disables timeline sync temporarily (until timeline reset)
 */
export function TimeToggle({ selectedPeriod, onPeriodChange, latestReleaseDate }: TimeToggleProps) {
  const { setSyncActive } = useAnimation();
  const translate = useTranslation();
  const t = useThemeClasses();

  // Dynamically generate period buttons from HISTORICAL_IMAGERY constants
  const periods = useMemo(() => {
    return (Object.keys(HISTORICAL_IMAGERY) as TimePeriod[]).map((key) => {
      const period = HISTORICAL_IMAGERY[key];
      const date = key === "CURRENT" && latestReleaseDate ? latestReleaseDate : period.date;
      return {
        value: key,
        label: formatShortDate(date),
        tooltip: formatFullDate(date),
      };
    });
  }, [latestReleaseDate]);

  return (
    <div className={`absolute top-2 right-2 z-[1000] ${t.containerBg.opaque} backdrop-blur-sm rounded-lg shadow-md overflow-hidden`}>
      <div className="flex">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => {
              // Disable sync when user manually selects a period
              setSyncActive(false);
              onPeriodChange(period.value);
            }}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors border-r ${t.border.default} last:border-r-0 ${
              selectedPeriod === period.value
                ? `bg-brand text-white`
                : `${t.bg.primary} ${t.text.body} ${t.bg.hover}`
            }`}
            title={period.tooltip}
            aria-pressed={selectedPeriod === period.value}
            aria-label={`${translate("map.switchTo")} ${period.label} ${translate("map.satelliteImagery")}`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
