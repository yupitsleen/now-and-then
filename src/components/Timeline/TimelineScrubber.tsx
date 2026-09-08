import { useEffect, useRef, useMemo, useState, useCallback } from "react";
// Optimized D3 imports - only import what we need
import { scaleTime } from "d3";
import type { Site } from "../../types";
import { useAnimation } from "../../contexts/AnimationContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { D3TimelineRenderer } from "../../utils/d3Timeline";
import { useTimelineData } from "../../hooks/useTimelineData";
import { TIMELINE_CONFIG } from "../../constants/timeline";
import {
  calculateDefaultDateRange,
  calculateAdjustedDateRange,
} from "../../utils/timelineCalculations";
import { InfoIcon } from "../Icons/InfoIcon";
import { INFO_ICON_COLORS } from "../../constants/tooltip";
import { TimelineControls } from "./TimelineControls";
import { TimelineNavigation } from "./TimelineNavigation";

/**
 * Callback type for date change handlers
 */
export type DateChangeHandler = (date: Date | null) => void;

/**
 * Callback type for site highlight handlers
 */
export type SiteHighlightHandler = (siteId: string | null) => void;

/**
 * Callback type for toggle handlers (no parameters)
 */
export type ToggleHandler = () => void;

/**
 * Advanced timeline mode configuration
 */
export interface AdvancedTimelineMode {
  syncMapOnDotClick: boolean;
  onSyncMapToggle?: ToggleHandler; // Optional: allows hiding Sync Map button
  showNavigation?: boolean; // Optional: show Previous/Next navigation (default: true when advancedMode is set)
  hidePlayControls?: boolean; // Optional: hide Play/Pause/Speed controls (default: false)
  hideMapSettings?: boolean; // Optional: hide Zoom to Site and Show Map Markers (moved to map on Dashboard)
  onReset?: () => void; // Optional: custom reset handler for parent components (e.g., Timeline page to reset wayback sliders)
}

interface TimelineScrubberProps {
  sites: Site[];
  highlightedSiteId?: string | null;
  onSiteHighlight?: SiteHighlightHandler;
  // Advanced Timeline mode: Sync Map button syncs on dot click instead of during playback
  advancedMode?: AdvancedTimelineMode;
  // Side-by-side maps are showing, so a dot click gives a before-and-after view
  comparisonMode?: boolean;
}

/**
 * Horizontal timeline scrubber with D3.js visualization
 * Features:
 * - Draggable scrubber handle
 * - Event markers for destruction dates
 * - Play/pause/reset controls
 * - Sync Map toggle (syncs satellite imagery with timeline OR on dot click in advanced mode)
 * - Speed control dropdown
 * - Keyboard navigation (space, arrows, home/end)
 * - Responsive to container width changes
 */
export function TimelineScrubber({
  sites,
  highlightedSiteId,
  onSiteHighlight,
  advancedMode,
  comparisonMode = false,
}: TimelineScrubberProps) {
  const {
    currentTimestamp,
    isPlaying,
    speed,
    startDate,
    endDate,
    zoomToSiteEnabled,
    mapMarkersVisible,
    play,
    pause,
    reset,
    setTimestamp,
    setSpeed,
    setZoomToSiteEnabled,
    setMapMarkersVisible,
  } = useAnimation();

  const t = useThemeClasses();
  const translate = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const rendererRef = useRef<D3TimelineRenderer | null>(null);

  // Extract timeline data using custom hook
  // Note: sites are already filtered by useFilteredSites (includes showUnknownDates logic)
  const { events: allDestructionDates } = useTimelineData(sites);

  // Calculate date range from dataset (oldest and newest destruction dates)
  const { adjustedStartDate, adjustedEndDate } = useMemo(() => {
    const defaults = calculateDefaultDateRange(allDestructionDates, startDate, endDate);
    // Always adjust scale to match visible (filtered) events
    const adjusted = calculateAdjustedDateRange(allDestructionDates, true, startDate, endDate);

    return {
      ...defaults,
      ...adjusted,
    };
  }, [allDestructionDates, startDate, endDate]);

  // Use all destruction dates (no filtering in timeline component)
  const destructionDates = allDestructionDates;

  // Observe container width changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // D3 time scale (responsive to container width, uses adjusted dates when filtered)
  const timeScale = useMemo(() => {
    return scaleTime()
      .domain([adjustedStartDate, adjustedEndDate])
      .range([TIMELINE_CONFIG.MARGIN, containerWidth - TIMELINE_CONFIG.MARGIN]);
  }, [adjustedStartDate, adjustedEndDate, containerWidth]);

  // Track if SVG is mounted
  const [svgMounted, setSvgMounted] = useState(false);

  // Detect when SVG ref becomes available
  useEffect(() => {
    if (svgRef.current && !svgMounted) {
      setSvgMounted(true);
    }
  }, [svgMounted]);

  // Initialize D3 renderer and render timeline
  useEffect(() => {
    if (!svgRef.current || !svgMounted) {
      return;
    }

    // Initialize renderer if not exists
    if (!rendererRef.current) {
      rendererRef.current = new D3TimelineRenderer(
        svgRef.current,
        timeScale,
        {}, // Use default config
        {
          onTimestampChange: setTimestamp,
          onPause: pause,
          onSiteHighlight: onSiteHighlight ? (event) => {
            // Highlight the site when timeline dot is clicked
            onSiteHighlight(event.siteId);
          } : undefined,
        }
      );
    }

    // Update scale in case container width changed
    rendererRef.current.updateScale(timeScale);

    // Clamp currentTimestamp to the adjusted date range to prevent scrubber rendering off-screen
    // This ensures the scrubber never renders past the visual timeline bounds
    const clampedTimestamp = new Date(
      Math.max(
        adjustedStartDate.getTime(),
        Math.min(adjustedEndDate.getTime(), currentTimestamp.getTime())
      )
    );

    // Render timeline with clamped timestamp and highlighted site
    rendererRef.current.render(destructionDates, clampedTimestamp, highlightedSiteId);

    return () => {
      // Cleanup on unmount only
      rendererRef.current?.cleanup();
      rendererRef.current = null;
    };
  }, [svgMounted, timeScale, destructionDates, currentTimestamp, highlightedSiteId, adjustedStartDate, adjustedEndDate, setTimestamp, pause, onSiteHighlight]);

  // Handle reset button click - reset timeline AND clear highlighted site to reset map zoom
  const handleReset = useCallback(() => {
    reset(); // Reset timeline to start
    if (onSiteHighlight) {
      onSiteHighlight(null); // Clear highlighted site to reset map to Gaza overview
    }
    // Call custom reset handler if provided (e.g., Timeline page resets wayback sliders)
    if (advancedMode?.onReset) {
      advancedMode.onReset();
    }
  }, [reset, onSiteHighlight, advancedMode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": // Space - play/pause
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case "ArrowLeft": // Step backward by 1 day
          e.preventDefault();
          pause();
          setTimestamp(
            new Date(currentTimestamp.getTime() - 24 * 60 * 60 * 1000)
          );
          break;
        case "ArrowRight": // Step forward by 1 day
          e.preventDefault();
          pause();
          setTimestamp(
            new Date(currentTimestamp.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case "Home": // Jump to start
          e.preventDefault();
          pause();
          handleReset();
          break;
        case "End": // Jump to end
          e.preventDefault();
          pause();
          setTimestamp(endDate);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentTimestamp,
    isPlaying,
    play,
    pause,
    handleReset,
    setTimestamp,
    endDate,
  ]);

  // Nav (and the Reset button it hosts) only render in advanced mode
  const showNavigation = !!advancedMode && advancedMode.showNavigation !== false;

  // Check if timeline is at the start or end position
  const isAtStart = currentTimestamp.getTime() === startDate.getTime();
  // Always stop at adjustedEndDate - this matches the visual timeline scale
  // The timeline SVG scale uses adjustedEndDate, so the scrubber must respect that boundary
  const isAtEnd = currentTimestamp.getTime() >= adjustedEndDate.getTime();

  // Auto-pause when reaching the adjusted end date during playback
  useEffect(() => {
    if (isPlaying && isAtEnd) {
      pause();
    }
  }, [isPlaying, isAtEnd, pause]);

  // Handle play button click - reset and play if at the end
  const handlePlay = () => {
    if (isAtEnd) {
      reset();
      // Small delay to let reset complete before playing
      setTimeout(() => play(), 10);
    } else {
      play();
    }
  };

  // Previous/Next navigation for Advanced Timeline mode
  // Find the current position relative to events (not requiring exact match)
  const currentEventIndex = useMemo(() => {
    if (!advancedMode || destructionDates.length === 0) return -1;

    const currentTime = currentTimestamp.getTime();

    // If we have a highlighted site, try to find its exact index first
    // This handles multiple sites with the same destruction date
    if (highlightedSiteId) {
      const exactIndex = destructionDates.findIndex(
        (event) => event.siteId === highlightedSiteId
      );
      if (exactIndex !== -1) {
        return exactIndex;
      }
    }

    // Check if we're before all events
    if (currentTime < destructionDates[0].date.getTime()) {
      return -1; // Special value meaning "before first event"
    }

    // Check if we're after all events
    if (currentTime >= destructionDates[destructionDates.length - 1].date.getTime()) {
      return destructionDates.length - 1; // At or after last event
    }

    // We're somewhere in the middle - find the event we've passed or are at
    for (let i = 0; i < destructionDates.length; i++) {
      const eventTime = destructionDates[i].date.getTime();

      if (currentTime === eventTime) {
        // Exact match - we're at this event
        return i;
      }

      if (currentTime < eventTime) {
        // We're before this event, so we're at the previous event
        return i - 1;
      }
    }

    // Fallback: find nearest event
    let nearestIndex = 0;
    let minDiff = Math.abs(destructionDates[0].date.getTime() - currentTime);

    for (let i = 1; i < destructionDates.length; i++) {
      const diff = Math.abs(destructionDates[i].date.getTime() - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }, [advancedMode, destructionDates, currentTimestamp, highlightedSiteId]);

  const canGoPrevious = !!advancedMode && currentEventIndex >= 0;
  const canGoNext = !!advancedMode && destructionDates.length > 0 && currentEventIndex < destructionDates.length - 1;

  const goToPreviousEvent = () => {
    if (canGoPrevious) {
      if (currentEventIndex === 0) {
        // At first event, go back to timeline start (before first event)
        setTimestamp(startDate);
        if (onSiteHighlight) {
          onSiteHighlight(null); // Clear highlighted site
        }
      } else {
        // Go to previous event
        const targetIndex = currentEventIndex === -1 ? 0 : currentEventIndex - 1;
        const prevEvent = destructionDates[targetIndex];
        setTimestamp(prevEvent.date);
        if (onSiteHighlight) {
          onSiteHighlight(prevEvent.siteId);
        }
      }
    }
  };

  const goToNextEvent = () => {
    if (canGoNext) {
      // If we're before all events (index -1), go to first event (index 0)
      const targetIndex = currentEventIndex === -1 ? 0 : currentEventIndex + 1;
      const nextEvent = destructionDates[targetIndex];
      setTimestamp(nextEvent.date);
      if (onSiteHighlight) {
        onSiteHighlight(nextEvent.siteId);
      }
    }
  };

  return (
    <div
      className={t.timeline.container}
      role="region"
      aria-label="Timeline Scrubber"
    >
      {/* Controls sit above the track so the track keeps the full card width */}
      {/* dir="ltr" keeps media controls left-to-right regardless of language */}
      {/* min-h holds the row steady whether the caption wraps to one line or two */}
      <div className="flex min-h-[2.25rem] items-center gap-4" dir="ltr">
        {/* Transport: reset, play/pause, then step back/forward — one group, so
            stepping through events doesn't send the pointer across the card */}
        {/* ponytail: indent past the tab strip the Timeline page overlays on this
            corner; plain padding beats plumbing a `tabbed` prop down two levels */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 [.timeline-tabbed_&]:pl-28">
          <TimelineControls
            isPlaying={isPlaying}
            isAtStart={isAtStart}
            speed={speed}
            zoomToSiteEnabled={zoomToSiteEnabled}
            mapMarkersVisible={mapMarkersVisible}
            advancedMode={!!advancedMode}
            hidePlayControls={advancedMode?.hidePlayControls ?? false}
            hideMapSettings={advancedMode?.hideMapSettings ?? false}
            syncMapOnDotClick={advancedMode?.syncMapOnDotClick}
            onPlay={handlePlay}
            onPause={pause}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onZoomToSiteToggle={() => setZoomToSiteEnabled(!zoomToSiteEnabled)}
            onMapMarkersToggle={() => setMapMarkersVisible(!mapMarkersVisible)}
            onSyncMapToggle={advancedMode?.onSyncMapToggle}
          />
          {showNavigation && (
            <>
              <TimelineNavigation
                direction="previous"
                disabled={!canGoPrevious}
                onClick={goToPreviousEvent}
              />
              <TimelineNavigation direction="next" disabled={!canGoNext} onClick={goToNextEvent} />
            </>
          )}
        </div>

        {/* The card's label, reading after the controls it belongs to. */}
        {/* ponytail: theme text, not literal white — the card is white in light mode */}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold leading-tight ${t.text.heading}`}>
            Timeline of destructive assaults on culturally significant sites
          </p>
          {/* Muted, not flag green: green means "before/intact" on the maps and
              the dots, and an instruction shouldn't borrow that meaning */}
          <p className={`truncate text-xs leading-tight ${t.text.muted}`}>
            {comparisonMode
              ? "Click on a site dot to see a before-and-after view of Israel's genocidal destruction"
              : "Click on a site dot to see what remains after Israel's genocidal destruction"}
          </p>
        </div>

        <InfoIcon
          title={advancedMode
            ? translate("timeline.tooltipAdvanced")
            : translate("timeline.tooltipDefault")
          }
          aria-label={advancedMode
            ? translate("timeline.tooltipAdvanced")
            : translate("timeline.tooltipDefault")
          }
          className={`shrink-0 w-4 h-4 ${INFO_ICON_COLORS.DEFAULT} ${INFO_ICON_COLORS.HOVER} transition-colors cursor-help`}
        />
      </div>

      {/* The timeline track - full card width */}
      <div
        ref={containerRef}
        className="relative"
        style={{ minHeight: TIMELINE_CONFIG.MIN_HEIGHT }}
      >
          <div className="overflow-hidden">
            <svg
              ref={(node) => {
                if (node && node !== svgRef.current) {
                  svgRef.current = node;
                  setSvgMounted(true);
                }
              }}
              key={`timeline-${containerWidth}-${startDate.getTime()}`}
              width="100%"
              height={TIMELINE_CONFIG.HEIGHT}
              aria-hidden="true"
            />
          </div>
        </div>
    </div>
  );
}
