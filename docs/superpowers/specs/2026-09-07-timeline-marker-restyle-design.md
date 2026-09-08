# Timeline marker restyle

**Date:** 2026-09-07
**Branch:** `feat/timeline-marker-restyle`
**Scope:** `src/utils/d3Timeline.ts` only. No component, data, or i18n changes.

## Problem

The event markers on the landing timeline read as clumsy and arbitrarily stacked.

Two causes, one cosmetic and one factual.

**The stacking was dishonest.** `assignRows()` bin-packed greedily, left to right,
dropping each event into the lowest row whose last dot had cleared it by
`minGap = DOT_R * 2 + 1` — 7px. The chart spans roughly ten months in about
1990px, so one day is ~6.5px: *narrower than the gap*. Consecutive days therefore
stacked on top of one another. A column's height encoded how crowded its
neighbourhood was, not how many sites were destroyed that day — while the code
comment claimed "the column's height is the day's toll."

**The marks were too big for the span.** At `DOT_R = 3` with a 7px row pitch,
dots collided at a day's width, which fed the false stacking above and made the
dense Oct–Dec stretch a single red mass.

A third problem surfaced once the first two were fixed: month-only events (sources
give the month, not the day) parse to the 1st, so all ten December records formed
one 10-high column — the loudest mark on the chart, encoding *missing precision*
rather than a worse day.

## Design

### Marks

| | Before | After |
|---|---|---|
| Dot radius | 3 | 2 |
| Hover radius | 4.5 | 4 |
| Row pitch | 7px | 4.75px |
| Max rows | 6 | 6 (unchanged) |

The busiest single date in the data is 5 sites (2023-11-01), so a 6-row cap clears
the real maximum with a row to spare.

### Placement

`assignRows()` becomes `placeEvents()` and returns `{event, cx, cy}` rather than
`{event, row}`. Placement resolves to coordinates once, so the two lanes do not
need parallel branches at every `.attr()` call.

Dated events stack **by exact date**: the nth event on a given day sits in row n.
A column is therefore one day, and its height is that day's toll.

### The month-only lane

Month-only events leave the stack for a dedicated lane below the axis
(`MONTH_LANE_H = 11`), spread evenly across the month the sources give.

The lane is what carries "day unknown". Because the lane says it, the horizontal
spread inside it reads as a window rather than as a claim about a specific day —
which matters under the project's evidence-based rule.

Two alternatives were prototyped and rejected:

- **Spread with no lane.** Flattest strip, but x-position then implies days the
  sources do not give. Position is the loudest channel on a timeline; a hollow
  fill and a tooltip do not undo it.
- **Spread inside a per-month bracket.** The bracket was meant to mark the window
  explicitly. It failed: month-only events cluster in *consecutive* months
  (Nov, Dec, Jan 2023–24), so adjacent brackets abut and merge into one
  continuous lid reading as a single two-month window. A 3px inset was not enough
  separation at this strip width, and widening it misplaced the rings. The lid
  also competed with the axis — a second horizontal rule of similar weight a few
  pixels above the real one, on a 64px strip.

Encoding uncertainty by *adding a shape* fails when the uncertain cases are
contiguous. Encoding it by *position* does not.

### Where a mark sits: `markDate`

Spreading the rings split "when the event happened" from "where its mark is", and
everything downstream that assumed those were the same broke.

`withMarkDates()` resolves the second as a **date**. The spread is a fixed
fraction of the month, so it needs no pixels and no scale: a ring's `markDate` is
`monthStart + monthLength * (i + 0.5) / total`. `date` is untouched and remains
the only sourced value; `markDate` is a drawing coordinate that happens to be
typed as a date.

Because the time scale is monotonic, ordering by `markDate` *is* left-to-right
drawn order. `useTimelineData` returns events in that order, which is what
Previous/Next walks.

This fixed a bug the pixel-based spread had caused: Next stepped through
date-sorted order, so from a November ring (drawn at x 147) it advanced to a
dated November 1st site (drawn at x 115) — visibly backwards, by an amount that
looked arbitrary. Ordering by `markDate` interleaves rings and dated events the
way the eye sees them.

It also simplified the renderer, which no longer computes a spread at all — it
reads `markDate` and no longer needs per-month totals, a per-lane ring counter,
or `monthSpan()`.

`calculateDefaultDateRange` takes its end from `markDate`, so a month-only event
in the final month cannot be drawn off the right edge.

### The playhead on a month-only event

A month-only ring's x is not a date, but the scrubber's x normally is. That left
the playhead stranded: selecting a November ring parked it ~10px away at Nov 1,
and stepping through December's ten rings — which all share a Dec 1 timestamp —
never moved it at all, while the highlight travelled 65px to the right. It read
as the playhead skipping those marks.

`scrubberX()` resolves this: when the selected event is month-only *and* the
current timestamp is exactly that event's date, the playhead is drawn at the
ring's x instead of the timestamp's.

The trade was raised and accepted: while a month-only event is selected, the
playhead's x points at a mark rather than asserting a day. The exact-timestamp
condition keeps the rule narrow — dragging lands on arbitrary times, so it never
triggers there, and the playhead tracks the pointer as before.

### Layout

`baselineY` moves up by `MONTH_LANE_H` to make room; the axis uses
`tickSizeInner(MONTH_LANE_H + 3)` so tick labels clear the lane, and tick lines
drop to 0.5 opacity where they cross it. Total SVG height stays 64px, so nothing
below reflows.

### Scrubber

With the dots at r2, the handle (r7 plus a 2px black stroke) was the heaviest mark
on the strip. It goes to r5 with no stroke, and the playhead line from 3px to 2px.
A playhead should not outweigh the data. `colors.scrubberStroke` is now unused and
is removed from `TimelineConfig`.

## Verification

`src/utils/d3Timeline.test.ts` renders into a detached SVG and asserts on the
resulting `cx`/`cy` — the placement is the factual claim, so that is what is
tested, not styling:

- same-day events share one x and occupy distinct rows
- **consecutive days sit side by side** (the regression guard)
- a 12-event day stays inside the strip and saturates at 6 rows
- month-only events land below the baseline, dated ones above
- four December month-only events take four distinct x inside December, sharing one y
- a month-only tooltip says "day not recorded"

Checked manually in light and dark mode at 3x. Existing unit and e2e suites pass
unchanged.

## Known limitation

Beyond 6 same-day events the surplus piles onto the top row and the column just
reads "full". Marked with a `ponytail:` comment: raise the strip height and
`MAX_ROWS` together if the cap starts hiding real differences.
