import { useMemo } from "react";
import type { Site } from "../types";
import { withMarkDates, type TimelineEvent } from "../utils/d3Timeline";
import { getEffectiveDestructionDate } from "../utils/format";

/**
 * Extract and process timeline data from sites
 * - Filters sites with destruction dates (or sourceAssessmentDate as fallback)
 * - Sorts events chronologically
 * - Returns structured timeline events
 *
 * Note: Sites are already filtered by useFilteredSites hook (including showUnknownDates logic)
 *
 * @param sites - Array of heritage sites (pre-filtered)
 */
export function useTimelineData(sites: Site[]) {
  return useMemo(() => {
    const destructionDates: TimelineEvent[] = sites
      .filter((site) => {
        // Must have at least one date (destruction or survey)
        return !!getEffectiveDestructionDate(site);
      })
      .map((site) => {
        const effectiveDate = getEffectiveDestructionDate(site)!;
        return {
          date: new Date(effectiveDate),
          siteName: site.name,
          siteId: site.id,
          status: site.status as "destroyed" | "heavily-damaged" | "damaged" | undefined,
          // "YYYY-MM" means the sources pin the month but not the day. It parses
          // to the 1st, so the timeline has to say so rather than draw it as fact.
          datePrecision: /^\d{4}-\d{2}$/.test(effectiveDate)
            ? ("month" as const)
            : ("day" as const),
        };
      });

    // Ordered by where each mark is drawn, not by its timestamp. Month-only
    // events spread across their month, so the two orders differ — and stepping
    // through events with Previous/Next has to follow the marks, or it walks
    // backwards along the strip.
    const ordered = withMarkDates(destructionDates);

    // Calculate event density for future visualizations
    const eventDensity =
      ordered.length > 0
        ? ordered.length /
          ((ordered[ordered.length - 1].date.getTime() -
            ordered[0].date.getTime()) /
            (1000 * 60 * 60 * 24)) // events per day
        : 0;

    return {
      events: ordered,
      totalEvents: ordered.length,
      eventDensity,
    };
  }, [sites]);
}
