# Mobile Portrait Layout — Design Spec

**Date:** 2026-09-27
**Branch:** `responsive-design`
**Scope:** Portrait phones only (phase 1). Landscape phones are a separate,
later effort (see "Out of scope").

---

## Goal

Give a portrait phone a clean, map-first view of the before/after satellite
comparison. The signature feature (destruction seen through map comparison) is
the hero; everything that competes with it for the phone's scarce width is cut.

Success: at 390×844 the two maps are large and legible, a user can step through
sites with Prev/Next, scroll to a sites table, and tap a row to jump the maps to
that site — with no horizontal thin-strip collapse and no header/logo collision.

## Trigger

A new `useMediaQuery` hook (thin `window.matchMedia` wrapper) drives a branch in
`Timeline.tsx`:

```
isPortraitPhone = useMediaQuery('(orientation: portrait) and (max-width: 767px)')
```

- `true` → render the new `<TimelineMobilePortrait>` subtree.
- `false` → render the existing layout unchanged (landscape phones and
  tablets/desktop keep today's behavior).

Scoping on both orientation **and** width keeps portrait tablets (≥768px) and
landscape phones out of phase 1.

## Target layout (portrait)

One vertically-scrolling page, **no app header**:

```
┌──────────────────────────┐ ─┐
│   BEFORE map (full-w)     │  │
├──────────────────────────┤  │  maps fill ~ (100vh − stepper)
│   AFTER map (full-w)      │  │  → each ~48vh, hero content
├──────────────────────────┤  │
│   [◀ Prev]     [Next ▶]   │ ─┘  stepper bar, visible at bottom on load
├──────────────────────────┤ ─┐  (scroll down)
│   [◀ Prev]     [Next ▶]   │  │  SAME bar, now at top of table view
│   ┌────────────────────┐  │  │
│   │ Sites table        │  │  │  fixed height, scrolls internally
│   │ (scrolls inside)   │  │  │
│   └────────────────────┘  │  │
│   site name · Github      │ ─┘  small subtle footer
└──────────────────────────┘

  tap a table row → full-screen detail modal with [X]
```

The Prev/Next bar sits in normal document flow at the **seam** between the maps
section and the table section. The maps section is sized `100vh − barHeight` so
the bar shows at the screen bottom on load; after scrolling, the same bar is at
the top of the table section. No sticky positioning needed.

Tapping a table row selects that site — repositioning both maps, exactly like
Prev/Next. No detail modal in phase 1 (deferred to phase 2).

## Components

| Component | Change |
|-----------|--------|
| `ComparisonMapView` | Add a `stacked` prop. When set: outer `flex-col`, each map `w-full h-1/2` (instead of `flex-row` + `w-1/2 h-full`). Hide the per-map settings overlays and the date-picker calendar buttons in stacked mode; show a small read-only date label per map instead. |
| `useMediaQuery` (new) | `window.matchMedia` wrapper: subscribe on mount, return current match, SSR-safe default `false`. |
| `TimelineMobilePortrait` (new) | Portrait subtree: stacked `ComparisonMapView`, `SiteStepper`, embedded `SitesTable`, slim footer. Receives the state/handlers it needs from `Timeline.tsx` (releases, filteredSites, before/after release, selection + highlight handlers). |
| `SiteStepper` (new, small) | Prev/Next bar. Steps `highlightedSiteId` through the `filteredSites` array by index (wraps or clamps — clamp, disabled at ends). |
| `SitesTable` | Reused `embedded` variant; wrapped in a fixed-height, `overflow-y-auto` container. Row tap → select the site (`handleSiteHighlight`), repositioning the maps — not a detail modal. |
| `Timeline.tsx` | Add the `isPortraitPhone` branch. Force `syncMapOnDotClick` and `zoomToSite` ON for the portrait path so stepping a site repositions + re-dates both maps. Highlight the first site on initial load so the maps show a real site. |
| Footer | Slim variant: site name + Github link only. Reuse `AppFooter` mobile mode or a minimal inline footer. |

## Interaction

- **Prev/Next** move `highlightedSiteId` to the neighboring site in
  `filteredSites`. Because sync + zoom are forced on for this path, both maps
  pan/zoom to the site and set before/after imagery to pre/post destruction.
- **Table row tap** selects that site (same as Prev/Next) — repositions the
  maps. No detail modal in phase 1.
- **Table highlight** stays in sync with the stepper (stepping highlights the
  row; the table can scroll it into view).

## Cut in portrait (all sanctioned as expendable)

- App header (removed entirely)
- D3 timeline scrubber (replaced by Prev/Next)
- Mini locator map
- Imagery date slider (Wayback scrubber / "Imagery" tab)
- Per-map settings overlays ("Zoom to Site" / "Show Map Markers")
- Search / Filters (table shows all sites; Prev/Next steps all of them)

## Testing

- Unit: `useMediaQuery` (matches/updates on change); `SiteStepper` index logic
  (prev/next/clamp at ends) with an assert-based check.
- E2e (optional, portrait viewport): maps stack, Prev/Next steps a site, row tap
  repositions the maps to that site.
- Manual/visual: screenshot at 390×844 confirming maps hero + seam bar + table.

## Out of scope (phase 2, separate spec)

- **Landscape phones:** keep side-by-side maps (they work wide), strip chrome
  (collapse sidebar to filter bar, shrink timeline) to give maps vertical height.
- **Site detail modal on portrait:** tapping a row opens a full-screen detail
  panel with an X. Deferred — likely more work than the rest of phase 1.
- Filters/search on portrait (can be added back later without restructuring).
