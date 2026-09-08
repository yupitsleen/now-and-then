import { useMemo, useRef, useCallback, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { Button } from "../Button";
import type { WaybackRelease } from "../../services/waybackService";
import { COLORS } from "../../config/colorThemes";
import { EmptyState } from "../EmptyState";
import { TOOLTIPS } from "../../config/tooltips";
import { InfoIcon } from "../Icons";
import { INFO_ICON_COLORS } from "../../constants/tooltip";

/**
 * Callback type for Wayback release index changes
 */
export type IndexChangeHandler = (index: number) => void;

/**
 * WaybackSlider props
 *
 * Comparison-mode *settings* (toggle, interval, sync) live in WaybackSettings;
 * this component only needs to know the resulting mode and the before index.
 */
export interface WaybackSliderProps {
  releases: WaybackRelease[];
  currentIndex: number;
  onIndexChange: IndexChangeHandler;
  // Left edge of the map column: the card runs the full page width, so the nav
  // buttons need this inset to sit under the maps they drive.
  mapsInsetPx?: number;
  // Comparison mode support
  comparisonMode?: boolean;
  beforeIndex?: number;
  onBeforeIndexChange?: IndexChangeHandler;
}

/**
 * WaybackSlider - Interactive timeline for Wayback imagery releases
 *
 * Features:
 * - Year labels spaced by date
 * - Tick marks for each release positioned by date
 * - Clickable timeline bar to jump to any release
 * - Previous/Next step buttons
 * - Visual scrubber showing current position
 * - Keyboard navigation (arrows, Home/End, PageUp/PageDown)
 * - Screen reader support with ARIA attributes
 */
export function WaybackSlider({
  releases,
  currentIndex,
  onIndexChange,
  mapsInsetPx = 0,
  comparisonMode = false,
  beforeIndex = 0,
  onBeforeIndexChange,
}: WaybackSliderProps) {
  const { isDark } = useTheme();
  const t = useThemeClasses();
  const translate = useTranslation();
  const timelineRef = useRef<HTMLDivElement>(null);

  const currentRelease = releases[currentIndex];
  const beforeRelease = comparisonMode && beforeIndex !== undefined ? releases[beforeIndex] : null;

  // Calculate year markers and release positions
  const { yearMarkers, releasePositions, currentPositionPercent, beforePositionPercent } = useMemo(() => {
    if (releases.length === 0) return { yearMarkers: [], releasePositions: [], currentPositionPercent: 0, beforePositionPercent: 0 };

    const startYear = new Date(releases[0].releaseDate).getFullYear();
    const endYear = new Date(releases[releases.length - 1].releaseDate).getFullYear();

    // The scale spans whole years, not first release → last release: that gives
    // every year an equal-width band (so the labels are evenly spaced) while the
    // ticks keep their true dates. Cost is a small empty margin at each end.
    const scaleStart = new Date(`${startYear}-01-01`).getTime();
    const totalRange = new Date(`${endYear + 1}-01-01`).getTime() - scaleStart;
    const bandWidth = 100 / (endYear - startYear + 1);

    // One marker per year, centered in its band
    const years: Array<{ year: number; position: number }> = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ year, position: (year - startYear) * bandWidth + bandWidth / 2 });
    }

    // Calculate position for each release
    const positions = releases.map((release, idx) => {
      const releaseOffset = new Date(release.releaseDate).getTime() - scaleStart;
      const position = (releaseOffset / totalRange) * 100;
      return {
        index: idx,
        position: Math.max(0, Math.min(100, position)),
        date: release.releaseDate,
      };
    });

    // Current release position
    const currentPos = positions[currentIndex]?.position || 0;

    // Before release position (for comparison mode)
    const beforePos = comparisonMode && beforeIndex !== undefined ? (positions[beforeIndex]?.position || 0) : 0;

    return { yearMarkers: years, releasePositions: positions, currentPositionPercent: currentPos, beforePositionPercent: beforePos };
  }, [releases, currentIndex, comparisonMode, beforeIndex]);

  // Handle timeline click - find nearest release
  const handleTimelineClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercent = (clickX / rect.width) * 100;

    // Find the release closest to this position
    let closestIndex = 0;
    let closestDistance = Math.abs(releasePositions[0].position - clickPercent);

    for (let i = 1; i < releasePositions.length; i++) {
      const distance = Math.abs(releasePositions[i].position - clickPercent);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    // In comparison mode, determine which scrubber to move based on proximity
    if (comparisonMode && onBeforeIndexChange) {
      const distanceToGreenScrubber = Math.abs(currentPositionPercent - clickPercent);
      const distanceToYellowScrubber = Math.abs(beforePositionPercent - clickPercent);

      // Move the scrubber that's closer to the click position
      if (distanceToYellowScrubber < distanceToGreenScrubber) {
        onBeforeIndexChange(closestIndex);
      } else {
        onIndexChange(closestIndex);
      }
    } else {
      // Single mode: always move the "after" scrubber
      onIndexChange(closestIndex);
    }
  }, [releasePositions, onIndexChange, comparisonMode, onBeforeIndexChange, currentPositionPercent, beforePositionPercent]);

  // Comparison mode steps both scrubbers as a fixed-width window: the gap
  // between before/after is what the user (or the sync interval) chose, so
  // navigation slides it instead of collapsing it to one release.
  const dualMode = comparisonMode && !!onBeforeIndexChange;
  const lowIndex = dualMode ? Math.min(currentIndex, beforeIndex) : currentIndex;
  const highIndex = dualMode ? Math.max(currentIndex, beforeIndex) : currentIndex;

  const step = useCallback(
    (delta: number) => {
      const lo = dualMode ? Math.min(currentIndex, beforeIndex) : currentIndex;
      const hi = dualMode ? Math.max(currentIndex, beforeIndex) : currentIndex;
      // Clamp so neither scrubber leaves the track; the window stops as a unit.
      const applied = Math.max(-lo, Math.min(delta, releases.length - 1 - hi));
      if (applied === 0) return;

      onIndexChange(currentIndex + applied);
      if (dualMode && onBeforeIndexChange) onBeforeIndexChange(beforeIndex + applied);
    },
    [dualMode, currentIndex, beforeIndex, releases.length, onIndexChange, onBeforeIndexChange]
  );

  const handlePrevious = useCallback(() => step(-1), [step]);
  const handleNext = useCallback(() => step(1), [step]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if there are releases available
      if (releases.length === 0) return;

      // Don't hijack arrows/Home/End while the user is typing or in a select.
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      switch (e.key) {
        case "ArrowLeft": // Step backward by 1 release
          e.preventDefault();
          step(-1);
          break;
        case "ArrowRight": // Step forward by 1 release
          e.preventDefault();
          step(1);
          break;
        case "Home": // Slide the window to the start of the track
          e.preventDefault();
          step(-releases.length);
          break;
        case "End": // Slide the window to the end of the track
          e.preventDefault();
          step(releases.length);
          break;
        case "PageUp": // Jump backward by 10 releases
          e.preventDefault();
          step(-10);
          break;
        case "PageDown": // Jump forward by 10 releases
          e.preventDefault();
          step(10);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [releases.length, step]);

  if (releases.length === 0) {
    return (
      <div className={t.timeline.container}>
        <EmptyState
          title={translate("timeline.noImageryAvailable")}
          size="sm"
        />
      </div>
    );
  }

  // Hover date bubble, shared by the release ticks and the scrubbers.
  const hoverTooltipClass = `hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none ${
    isDark ? "bg-gray-800 text-white" : "bg-gray-700 text-white"
  } shadow-md z-10`;

  return (
    // flex/justify-center: the panel is sized by the sites timeline, so the
    // track sits in the middle of it instead of hugging the top edge.
    <div
      className={`${t.timeline.container} relative flex flex-col`}
      data-testid="wayback-slider"
      role="region"
      aria-label="Wayback Imagery Timeline"
    >
      {/* Matches the sites timeline's icon, which sits in its right control cluster */}
      <InfoIcon
        title={translate("timeline.tooltipImagery")}
        aria-label={translate("timeline.tooltipImagery")}
        className={`absolute top-2 right-2 w-4 h-4 ${INFO_ICON_COLORS.DEFAULT} ${INFO_ICON_COLORS.HOVER} transition-colors cursor-help`}
      />

      {/* Label pair, mirroring the sites timeline's heading + green sublabel */}
      <div
        className="mx-auto w-fit max-w-full px-2 mb-1 text-center"
        style={{ paddingLeft: mapsInsetPx }}
      >
        <p className={`truncate text-sm font-semibold leading-tight ${t.text.heading}`}>
          Timeline of available satellite imagery
        </p>
        <p className="text-xs font-medium text-[#009639] leading-tight">
          {dualMode
            ? "Drag either handle to set the before and after imagery dates"
            : "Drag the handle to change the imagery date shown on the map"}
        </p>
      </div>

      {/* Label anchored to the top so it lands at the same height as the sites
          timeline's label — the track keeps centring in what's left. */}
      <div className="flex-1 flex flex-col justify-center">

      {/* Header: nav buttons centered on the map column. Comparison mode has no
          header — each map carries its own pair as an overlay (WaybackNav). */}
      {/* dir="ltr" keeps temporal controls left-to-right regardless of language */}
      {!dualMode && (
        <div
          className="relative flex items-center justify-center gap-2 mb-2"
          style={{ paddingLeft: mapsInsetPx }}
          dir="ltr"
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrevious}
              disabled={lowIndex === 0}
              variant="secondary"
              size="xs"
              aria-label="Go to previous satellite image release"
              title={TOOLTIPS.WAYBACK.PREV_RELEASE}
            >
              ⏮
            </Button>

            <Button
              onClick={handleNext}
              disabled={highIndex === releases.length - 1}
              variant="secondary"
              size="xs"
              aria-label="Go to next satellite image release"
              title={TOOLTIPS.WAYBACK.NEXT_RELEASE}
            >
              ⏭
            </Button>
          </div>
        </div>
      )}

      {/* Timeline visualization container */}
      <div className="relative">
        {/* Interactive timeline bar */}
        <div
          ref={timelineRef}
          className="relative h-3 cursor-pointer"
          onClick={handleTimelineClick}
          role="slider"
          aria-label="Wayback imagery timeline scrubber"
          aria-valuemin={0}
          aria-valuemax={releases.length - 1}
          aria-valuenow={currentIndex}
          aria-valuetext={`${currentRelease?.releaseDate || 'Unknown date'}, release ${currentIndex + 1} of ${releases.length}`}
          tabIndex={0}
        >
          {/* Background track */}
          <div className={`absolute inset-0 rounded ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />

          {/* Release tick marks with tooltips - wider hover area for easier interaction */}
          {releasePositions.map(({ index, position, date }) => {
            const isCurrentRelease = index === currentIndex;
            return (
              <div
                key={index}
                className="absolute top-0 bottom-0 -translate-x-1/2 group cursor-pointer"
                style={{ left: `${position}%` }}
              >
                {/* Invisible wider hitbox for easier hovering (8px wide) */}
                <div className="absolute inset-0 w-2 -ml-1" />

                {/* Visible tick mark line (1-2px) */}
                <div
                  className={`w-[1px] h-full ${
                    isCurrentRelease
                      ? "bg-white w-[2px]" // White and thicker for current
                      : isDark
                      ? "bg-gray-400"
                      : "bg-gray-500"
                  }`}
                />

                {/* Tooltip — `hidden` until hover, not just transparent: the first and
                    last ticks sit at the track's edges, so a laid-out invisible tooltip
                    overflows the page and raises a horizontal scrollbar. */}
                <div className={hoverTooltipClass}>
                  {date}
                </div>
              </div>
            );
          })}

          {/* Before position scrubber indicator - only in comparison mode */}
          {comparisonMode && beforeRelease && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
              style={{ left: `${beforePositionPercent}%` }}
            >
              <div className={hoverTooltipClass}>{beforeRelease.releaseDate}</div>
              <div
                data-testid="wayback-before-scrubber"
                className="w-3 h-3 border-2 rounded-full shadow-md"
                style={{ backgroundColor: COLORS.COMPARE_BEFORE, borderColor: COLORS.COMPARE_BEFORE }}
              />
            </div>
          )}

          {/* Current position scrubber indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
            style={{ left: `${currentPositionPercent}%` }}
          >
            <div className={hoverTooltipClass}>
              {currentRelease?.releaseDate || translate("timeline.unknownDate")}
            </div>
            <div
              data-testid="wayback-current-scrubber"
              className="w-3 h-3 border-2 rounded-full shadow-md"
              style={{ backgroundColor: COLORS.COMPARE_AFTER, borderColor: COLORS.COMPARE_AFTER }}
            />
          </div>
        </div>

        {/* Year labels - below the track */}
        <div className="relative h-3">
          {/* Centered in its year band, which sits inside the track — so no
              edge-overflow special cases for the first and last labels. */}
          {yearMarkers.map(({ year, position }) => (
            <div
              key={year}
              className="absolute -translate-x-1/2"
              style={{ left: `${position}%` }}
            >
              <span className={`text-[9px] font-semibold ${t.text.body}`}>{year}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
