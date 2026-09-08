import { useMemo } from "react";
import type { Site } from "../types";
import type { TimelineEvent } from "../utils/d3Timeline";
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
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate event density for future visualizations
    const eventDensity =
      destructionDates.length > 0
        ? destructionDates.length /
          ((destructionDates[destructionDates.length - 1].date.getTime() -
            destructionDates[0].date.getTime()) /
            (1000 * 60 * 60 * 24)) // events per day
        : 0;

    return {
      events: destructionDates,
      totalEvents: destructionDates.length,
      eventDensity,
    };
  }, [sites]);
}
