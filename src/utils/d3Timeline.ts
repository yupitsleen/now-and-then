import { select, type Selection } from "d3-selection";
import type { ScaleTime } from "d3";
import { axisBottom } from "d3-axis";
// utcFormat, not timeFormat: "YYYY-MM-DD" and "YYYY-MM" parse as UTC midnight,
// so formatting them in local time renders every date a day early west of UTC —
// a "2023-11" record read back as "October 2023".
import { utcFormat } from "d3-time-format";
import { drag } from "d3-drag";
import "d3-transition";

export type { Selection, ScaleTime };

export interface TimelineEvent {
  date: Date;
  siteName: string;
  siteId: string;
  status?: "destroyed" | "heavily-damaged" | "damaged";
  /**
   * How precisely the sources date this event. "month" events parse to the 1st
   * of the month and are drawn as a ring at partial fill, so the chart doesn't
   * claim a day it doesn't have. Defaults to "day" when absent.
   */
  datePrecision?: "day" | "month";
  /**
   * Where the mark sits, as opposed to when the event happened. They differ only
   * for month-only events, which spread across their month rather than piling on
   * the 1st. Set by withMarkDates(); falls back to `date` when absent.
   *
   * This is a drawing coordinate expressed as a date, never a claim about when
   * anything happened — `date` remains the only sourced value.
   */
  markDate?: Date;
}

/**
 * Give every month-only event the point it occupies, and return the events in
 * the order their marks appear along the strip.
 *
 * Month-only events all parse to the 1st, so the chart spreads them across the
 * month their sources give. That spread is a fixed fraction of the month, so it
 * can be expressed as a date rather than as pixels — which keeps it independent
 * of the scale, and lets event-to-event navigation step in the order the marks
 * are actually drawn. Sorting by `date` instead walks a November ring backwards
 * into the November 1st column it is drawn to the right of.
 */
export function withMarkDates(events: TimelineEvent[]): TimelineEvent[] {
  const monthTotals = new Map<number, number>();
  for (const e of events) {
    if (e.datePrecision === "month")
      monthTotals.set(e.date.getTime(), (monthTotals.get(e.date.getTime()) ?? 0) + 1);
  }

  const seen = new Map<number, number>();
  return events
    .map((event) => {
      if (event.datePrecision !== "month") return { ...event, markDate: event.date };

      const key = event.date.getTime();
      const i = seen.get(key) ?? 0;
      seen.set(key, i + 1);

      const total = monthTotals.get(key) ?? 1;
      const monthEnd = Date.UTC(event.date.getUTCFullYear(), event.date.getUTCMonth() + 1, 1);
      const span = monthEnd - key;
      return { ...event, markDate: new Date(key + (span * (i + 0.5)) / total) };
    })
    .sort((a, b) => a.markDate.getTime() - b.markDate.getTime());
}

export interface TimelineConfig {
  height: number;
  margin: number;
  /** Width of the invisible drag hit-area centred on the playhead line. */
  scrubberHitWidth: number;
  colors: {
    axis: string;
    axisLine: string;
    axisDomain: string;
    eventMarker: string;
    scrubberLine: string;
  };
}

/** An event resolved to the point it is drawn at. */
export type PlacedEvent = { event: TimelineEvent; cx: number; cy: number };

/**
 * Events are drawn as dots. Rectangles read as bars — spans of time — which is
 * the wrong claim: each mark is one destruction on one date. Stacking carries
 * the accumulation instead, so the mark itself can stay a discrete point.
 *
 * Small on purpose: over the ~10 months this chart spans, a single day is only
 * ~6px wide, so a dot any larger overlaps its neighbours and forces the stack to
 * grow for reasons that have nothing to do with the toll.
 */
const DOT_R = 2;

/** How much a dot grows on hover, so the pointed-at one reads clearly. */
const HOVER_R = 4;

/** Fill strength of a month-only dot: present enough to point at, light enough
 * to read as provisional next to a solid one. */
const MONTH_ONLY_FILL_OPACITY = 0.35;

/** Vertical distance between stacked dots (diameter + a hairline of daylight). */
const ROW_PITCH = 4.75;

/**
 * How tall a column can grow before it saturates. The busiest single date in the
 * data is 5 sites, so this clears it with a row to spare.
 * ponytail: beyond this, dots pile on the top row and the column just reads
 * "full" — raise the strip height and this together if the cap starts hiding
 * real differences.
 */
const MAX_ROWS = 6;

/** Gap between the axis line and the first row of dots. */
const BASELINE_GAP = 5;

/**
 * Height of the lane under the axis that holds month-only events. Separating them
 * by lane — rather than by fill, or by a bracket drawn around their month — is
 * what lets them spread across the month without the spread reading as a claim
 * about which day. Adjacent uncertain months would make any per-month container
 * merge with its neighbour; a lane has no such failure mode.
 */
const MONTH_LANE_H = 11;

/** Space kept below the axis line for its tick marks and labels (with descenders). */
const AXIS_LABEL_SPACE = 17;

/**
 * Band at the top reserved for the playhead's date pill. The pill is always on —
 * the selected date is the one thing the reader needs at a glance — so it gets
 * its own strip rather than sitting over the dot stacks.
 */
const DATE_PILL_BAND = 17;

/** Height of the pill itself, centred in the band. */
const DATE_PILL_H = 15;

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  height: 80,
  margin: 25,
  scrubberHitWidth: 12,
  colors: {
    axis: "#525252",
    axisLine: "#d4d4d4",
    axisDomain: "#a3a3a3",
    eventMarker: "#ed3039", // Palestinian flag red (default)
    scrubberLine: "#009639", // Palestinian flag green
  },
};

/**
 * The dot the playhead should snap to for a given x.
 *
 * Dragging to an arbitrary instant selects nothing, so the selection ring would
 * stay on whatever dot was last clicked, stranded away from the playhead.
 * Snapping also keeps the two aligned for month-only events, whose dot is drawn
 * somewhere inside its month while its timestamp is the 1st — see scrubberX.
 */
export function nearestPlaced(placed: PlacedEvent[], x: number): PlacedEvent | null {
  if (placed.length === 0) return null;
  return placed.reduce((best, p) => (Math.abs(p.cx - x) < Math.abs(best.cx - x) ? p : best));
}

/**
 * D3TimelineRenderer - Encapsulates all D3.js timeline rendering logic
 * Separates D3 operations from React component lifecycle
 */
export class D3TimelineRenderer {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private config: TimelineConfig;
  private timeScale: ScaleTime<number, number>;
  private onTimestampChange: (date: Date) => void;
  private onPause: () => void;
  private onSiteHighlight?: (event: TimelineEvent) => void;
  private highlightedSiteId: string | null = null;

  constructor(
    svgElement: SVGSVGElement,
    timeScale: ScaleTime<number, number>,
    config: Partial<TimelineConfig> = {},
    callbacks: {
      onTimestampChange: (date: Date) => void;
      onPause: () => void;
      onSiteHighlight?: (event: TimelineEvent) => void;
    }
  ) {
    this.svg = select(svgElement);
    this.config = { ...DEFAULT_TIMELINE_CONFIG, ...config };
    this.timeScale = timeScale;
    this.onTimestampChange = callbacks.onTimestampChange;
    this.onPause = callbacks.onPause;
    this.onSiteHighlight = callbacks.onSiteHighlight;
  }

  /**
   * Update the time scale (e.g., when container width changes)
   */
  updateScale(timeScale: ScaleTime<number, number>) {
    this.timeScale = timeScale;
  }

  /**
   * Render the complete timeline (axis, events, scrubber)
   */
  render(events: TimelineEvent[], currentTimestamp: Date, highlightedSiteId: string | null = null) {
    this.highlightedSiteId = highlightedSiteId;
    this.svg.selectAll("*").remove();
    this.renderAxis();
    const placed = this.placeEvents(events);
    this.renderEventMarkers(placed);
    this.renderScrubber(currentTimestamp, placed);
  }

  /**
   * Render the time axis
   */
  /** Y of the axis line — dots stack upward from here, tick labels sit below. */
  private get baselineY(): number {
    return this.config.height - AXIS_LABEL_SPACE - MONTH_LANE_H;
  }

  private renderAxis() {
    const { colors } = this.config;

    // tickSizeOuter(0): the domain path otherwise ends in a bare downward stub
    // at each end, which reads as the axis breaking off mid-render
    const xAxis = axisBottom(this.timeScale)
      .ticks(8)
      .tickSizeInner(MONTH_LANE_H + 3)
      .tickSizeOuter(0)
      .tickFormat((d) => {
        const date = d as Date;
        return utcFormat("%b %Y")(date);
      });

    const axisGroup = this.svg
      .append("g")
      .attr("transform", `translate(0, ${this.baselineY})`)
      .call(xAxis);

    axisGroup.selectAll("text").attr("fill", colors.axis).attr("font-size", "9px");

    axisGroup
      .selectAll("line")
      .attr("stroke", colors.axisLine)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    axisGroup
      .select(".domain")
      .attr("stroke", colors.axisDomain)
      .attr("stroke-width", 2);
  }

  /**
   * Resolve every event to the point it is drawn at.
   *
   * Dated events stack by exact date: the nth event on a given day sits in row n,
   * so a column's height is that day's toll and nothing else. (An earlier version
   * bin-packed by pixel gap, which also stacked *consecutive* days — at this span
   * a day is narrower than the gap — so columns encoded crowding, not tolls.)
   *
   * Month-only events leave the stack entirely for the lane below the axis, where
   * they spread evenly across the month the sources give.
   */
  private placeEvents(events: TimelineEvent[]): PlacedEvent[] {
    // Rows are per-date, and only dated events take one — month-only events go to
    // the lane. Counting them together would let a date's dated events consume the
    // rows and overflow the cap.
    const seenDated = new Map<number, number>();

    return [...events]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((event) => {
        // Month-only events drop into the lane under the axis, at the point
        // withMarkDates() spread them to. The lane is what says "day unknown", so
        // the spread reads as a window rather than as a claim about a date.
        if (this.isMonthOnly(event)) {
          return {
            event,
            cx: this.timeScale(event.markDate ?? event.date),
            cy: this.baselineY + MONTH_LANE_H / 2,
          };
        }

        const key = event.date.getTime();
        const row = seenDated.get(key) ?? 0;
        seenDated.set(key, row + 1);
        return {
          event,
          cx: this.timeScale(event.date),
          cy: this.rowY(Math.min(row, MAX_ROWS - 1)),
        };
      });
  }

  /** Y of the centre of a dot in the given stack row. */
  private rowY(row: number): number {
    return this.baselineY - BASELINE_GAP - row * ROW_PITCH;
  }

  /** Is the day itself unknown — i.e. sources pin only the month? */
  private isMonthOnly(event: TimelineEvent): boolean {
    return event.datePrecision === "month";
  }

  /**
   * Render event markers (destruction dates), stacked into columns so a dense
   * week reads as height rather than as one unreadable blob.
   *
   * Deliberately one colour: the markers used to be shaded by status, but every
   * event on this timeline is a destruction event, so the shading encoded
   * nothing the reader could act on. The one distinction left is factual — a
   * ring at partial fill means the sources give the month but not the day.
   */
  private renderEventMarkers(placed: PlacedEvent[]) {
    const { colors } = this.config;

    // Create a group for each event marker so we can add text labels
    const markerGroups = this.svg
      .selectAll("g.event-marker-group")
      .data(placed)
      .enter()
      .append("g")
      .attr("class", "event-marker-group");

    const isHighlighted = (d: PlacedEvent) =>
      d.event.siteId === this.highlightedSiteId;

    markerGroups
      .append("circle")
      .attr("class", "event-marker")
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("r", DOT_R)
      // A month-only mark is a ring at partial fill, in the lane below the axis.
      // It keeps a real fill rather than fill="none" — an unfilled shape has no
      // interior to hover, which is what left these markers without a tooltip.
      .attr("fill", colors.eventMarker)
      .attr("fill-opacity", (d) => (this.isMonthOnly(d.event) ? MONTH_ONLY_FILL_OPACITY : 1))
      // No outline on solid dots — placement already keeps them apart, so a
      // stroke on every one only smears the dense columns.
      .attr("stroke", (d) =>
        isHighlighted(d) ? "#009639" : this.isMonthOnly(d.event) ? colors.eventMarker : "none"
      )
      .attr("stroke-width", (d) => (isHighlighted(d) ? 2 : this.isMonthOnly(d.event) ? 1.25 : 0))
      .style("cursor", "pointer")
      .append("title")
      .text(
        ({ event: d }) =>
          `${d.siteName}\n${
            this.isMonthOnly(d) ? utcFormat("%B %Y")(d.date) : utcFormat("%B %d, %Y")(d.date)
          }${this.isMonthOnly(d) ? " (day not recorded)" : ""}${
            d.status ? `\nStatus: ${d.status.replace("-", " ")}` : ""
          }`
      );

    markerGroups
      .append("text")
      .attr("class", "event-date-label")
      .attr("x", (d) => d.cx)
      // Clamped out of the date band: a top-row dot's label would otherwise
      // collide with the always-on playhead pill
      .attr("y", (d) => Math.max(DATE_PILL_BAND + 9, d.cy - HOVER_R - 4))
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("fill", "#9ca3af")
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .text((d) =>
        this.isMonthOnly(d.event)
          ? utcFormat("%b %Y")(d.event.date)
          : utcFormat("%b %d, %Y")(d.event.date)
      );

    markerGroups
      .on("mouseenter", (hoverEvent: MouseEvent) => {
        // Lift above neighbours so the grown dot and its label aren't overdrawn
        const group = select<SVGGElement, PlacedEvent>(hoverEvent.currentTarget as SVGGElement).raise();
        group
          .select<SVGCircleElement>("circle.event-marker")
          .transition()
          .duration(150)
          .attr("r", HOVER_R);

        group.select("text").transition().duration(150).attr("opacity", 1);
      })
      .on("mouseleave", (hoverEvent: MouseEvent) => {
        const group = select<SVGGElement, PlacedEvent>(hoverEvent.currentTarget as SVGGElement);
        group
          .select<SVGCircleElement>("circle.event-marker")
          .transition()
          .duration(150)
          .attr("r", DOT_R);

        group.select("text").transition().duration(150).attr("opacity", 0);
      })
      .on("click", (_event, d) => {
        this.onTimestampChange(d.event.date);
        this.onPause();
        // Highlight site when timeline dot is clicked (doesn't open modal)
        if (this.onSiteHighlight) {
          this.onSiteHighlight(d.event);
        }
      });
  }

  /**
   * Where the playhead sits.
   *
   * Normally that is just the current time on the scale. The exception is a
   * selected month-only event: its ring is drawn somewhere inside its month,
   * while its timestamp is the 1st, so the honest position would leave the
   * playhead stranded away from the mark it selected — and stepping through a
   * month's worth of them would not move it at all, since they share a date.
   * The playhead follows the ring instead.
   *
   * The trade is deliberate: while a month-only event is selected the playhead's
   * x is a pointer to a mark, not a claim about a day. Only an exact timestamp
   * match counts, so dragging (which lands on arbitrary times) is unaffected.
   */
  private selectedRing(currentTimestamp: Date, placed: PlacedEvent[]): PlacedEvent | undefined {
    return placed.find(
      (p) =>
        this.isMonthOnly(p.event) &&
        p.event.siteId === this.highlightedSiteId &&
        p.event.date.getTime() === currentTimestamp.getTime()
    );
  }

  /**
   * Render the scrubber (vertical line + the drag hit-area over it)
   */
  private renderScrubber(currentTimestamp: Date, placed: PlacedEvent[]) {
    const { scrubberHitWidth, colors } = this.config;

    const scrubberGroup = this.svg.append("g").attr("class", "scrubber-group");

    const ring = this.selectedRing(currentTimestamp, placed);
    const xPosition = ring ? ring.cx : this.timeScale(currentTimestamp);

    // Spans the full stack so the playhead crosses every dot, not just row 0
    scrubberGroup
      .append("line")
      .attr("class", "scrubber-line")
      .attr("x1", xPosition)
      .attr("y1", DATE_PILL_BAND)
      .attr("x2", xPosition)
      .attr("y2", this.baselineY)
      .attr("stroke", colors.scrubberLine)
      .attr("stroke-width", 2);

    // Invisible hit-area over the whole line, not a knob at its foot: the line is
    // what reads as the playhead, so that is what people aim at. Kept narrow —
    // it sits above the dots, and anything wider swallows their hover and click.
    const handle = scrubberGroup
      .append("rect")
      .attr("class", "scrubber-handle")
      .attr("x", xPosition - scrubberHitWidth / 2)
      .attr("y", 0)
      .attr("width", scrubberHitWidth)
      .attr("height", this.baselineY)
      .attr("fill", "transparent")
      .style("cursor", "grab");

    handle.append("title").text(utcFormat("%B %d, %Y")(currentTimestamp));

    // The selected date, always on and riding the playhead. A month-only
    // selection prints its month: the pill must never claim a day the sources
    // don't give.
    const label = ring
      ? utcFormat("%b %Y")(currentTimestamp)
      : utcFormat("%b %d, %Y")(currentTimestamp);

    // ponytail: width estimated from the character count rather than measured —
    // getBBox needs a laid-out SVG, which tests don't have. Swap to getBBox if
    // the pill ever holds text this heuristic can't size.
    const pillW = label.length * 6.4 + 14;
    const [rangeStart, rangeEnd] = this.timeScale.range();
    // Clamped to the scale's range, which is inset from the SVG edges by the
    // margin, so a pill centred at either end still fits on screen.
    const pillCx = Math.max(rangeStart, Math.min(rangeEnd, xPosition));

    const pill = scrubberGroup
      .append("g")
      .attr("class", "scrubber-date-label")
      .style("pointer-events", "none");

    pill
      .append("rect")
      .attr("x", pillCx - pillW / 2)
      .attr("y", (DATE_PILL_BAND - DATE_PILL_H) / 2)
      .attr("width", pillW)
      .attr("height", DATE_PILL_H)
      .attr("rx", 3)
      .attr("fill", colors.scrubberLine);

    pill
      .append("text")
      .attr("x", pillCx)
      .attr("y", DATE_PILL_BAND / 2)
      .attr("dominant-baseline", "central")
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#ffffff")
      .text(label);

    const dragBehavior = drag<SVGRectElement, unknown>()
      .on("start", () => {
        handle.style("cursor", "grabbing");
      })
      .on("drag", (event) => {
        const x = Math.max(
          this.timeScale.range()[0],
          Math.min(this.timeScale.range()[1], event.x)
        );

        const nearest = nearestPlaced(placed, x);
        if (!nearest) return;

        this.onTimestampChange(nearest.event.date);
        this.onSiteHighlight?.(nearest.event);
      })
      .on("end", function () {
        select(this).style("cursor", "grab");
      });


    handle.on("mousedown", () => {
      this.onPause();
    });

    handle.call(dragBehavior);
  }

  /**
   * Cleanup D3 resources
   */
  cleanup() {
    this.svg.selectAll("*").remove();
  }
}
