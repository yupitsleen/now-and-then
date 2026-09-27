# Mobile Portrait Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give portrait phones a map-first view — stacked before/after satellite maps as the hero, a Prev/Next site stepper, a scrollable sites list, and a slim footer — with no header and no thin-strip map collapse.

**Architecture:** A `matchMedia('(orientation: portrait) and (max-width: 767px)')` branch in `Timeline.tsx` renders a separate `TimelineMobilePortrait` subtree instead of the desktop layout. `ComparisonMapView` gains a `stacked` prop that switches its two maps from side-by-side to top/bottom. A small `SiteStepper` steps the highlighted site through the filtered list, and (because sync + zoom are forced on for this path) both maps reposition and re-date to each site. The existing `SitesTable variant="mobile"` accordion is reused for the list. Landscape phones and the row-tap detail modal are out of scope (phase 2).

**Tech Stack:** React 19 + TypeScript (strict, no `any`, explicit return types), Tailwind CSS v4, Leaflet, Vitest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-09-27-mobile-portrait-design.md`

## Global Constraints

- TypeScript strict mode; no `any`; explicit return types on exported functions/components.
- LF line endings (`.gitattributes` enforces). Verify with `git diff --stat` before committing — a whole-file diff means the tool flipped endings.
- Conventional commits (`feat:`, `refactor:`, etc.).
- ESLint: zero warnings (`npm run lint`).
- Named exports preferred; functional components + hooks only.
- Reuse before building: `useMediaQuery` (`src/hooks/useMediaQuery.ts`) and `SitesTable variant="mobile"` (`src/components/SitesTable/index.tsx`) already exist — do not reimplement them.
- Portrait viewport for manual checks: 390×844.

---

## File Structure

- **Modify** `src/components/Map/ComparisonMapView.tsx` — add `stacked?: boolean` prop; switch flex direction + child sizing; suppress the editable date pickers and rely on read-only labels in stacked mode.
- **Create** `src/components/MobilePortrait/SiteStepper.tsx` — Prev/Next bar + exported `stepIndex` helper.
- **Create** `src/components/MobilePortrait/SiteStepper.test.tsx` — unit test for `stepIndex`.
- **Create** `src/components/MobilePortrait/TimelineMobilePortrait.tsx` — assembles stacked maps + stepper + mobile sites list + slim footer.
- **Modify** `src/pages/Timeline.tsx` — portrait branch, forced sync/zoom, initial-highlight effect.

---

### Task 1: `stacked` prop on ComparisonMapView

**Files:**
- Modify: `src/components/Map/ComparisonMapView.tsx`
- Test: `src/components/Map/ComparisonMapView.test.tsx` (create if absent)

**Interfaces:**
- Consumes: nothing new.
- Produces: `ComparisonMapView` accepts `stacked?: boolean` (default `false`). When `true`: outer wrapper is `flex-col`, each map is `w-full h-1/2` (was `w-1/2 h-full`), and the editable `DateLabel` date-pickers are not rendered (the read-only date still shows via the map's own label; overlays for settings are already opt-in via `*MapSettings`).

- [ ] **Step 1: Write the failing test**

Create `src/components/Map/ComparisonMapView.test.tsx`. Mock the heavy Leaflet child so the test stays fast and deterministic:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ComparisonMapView } from "./ComparisonMapView";

// SiteDetailView mounts Leaflet; stub it to a marker div.
vi.mock("./SiteDetailView", () => ({
  SiteDetailView: () => <div data-testid="map" />,
}));

const imagery = { tileUrl: "u", maxZoom: 19, dateLabel: "2023-10-01" };

describe("ComparisonMapView", () => {
  it("stacks the two maps vertically when stacked", () => {
    const { container } = render(
      <ComparisonMapView
        sites={[]}
        highlightedSiteId={null}
        before={imagery}
        after={imagery}
        stacked
      />
    );
    const maps = container.querySelectorAll('[data-testid="map"]');
    expect(maps).toHaveLength(2);
    // The direct flex wrapper switches to column in stacked mode.
    expect(container.querySelector(".flex.flex-col")).not.toBeNull();
    expect(container.querySelector(".flex-row")).toBeNull();
  });

  it("keeps maps side-by-side by default", () => {
    const { container } = render(
      <ComparisonMapView
        sites={[]}
        highlightedSiteId={null}
        before={imagery}
        after={imagery}
      />
    );
    // Default wrapper is a row (no explicit flex-col).
    expect(container.querySelector(".flex.flex-col")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/components/Map/ComparisonMapView.test.tsx`
Expected: FAIL — `stacked` prop unknown / wrapper still `flex` row, `.flex.flex-col` not found.

- [ ] **Step 3: Implement the prop**

In `ComparisonMapView.tsx`:

1. Add to the props interface:
```tsx
  /** Stack the two maps vertically (portrait phones) instead of side-by-side */
  stacked?: boolean;
```
2. Destructure it with a default: `stacked = false,`.
3. Change the wrapper (line ~69) from:
```tsx
      <div className="flex h-full gap-2">
```
to:
```tsx
      <div className={`flex h-full gap-2 ${stacked ? "flex-col" : "flex-row"}`}>
```
4. Change BOTH map containers (lines ~72 and ~107) from `w-1/2 h-full` to:
```tsx
          className={`${stacked ? "w-full h-1/2" : "w-1/2 h-full"} border-2 rounded shadow-xl overflow-hidden relative`}
```
5. Guard the two editable date pickers so they render only when NOT stacked — wrap each existing `{before.dateLabel && (...)}` / `{after.dateLabel && (...)}` condition as `{!stacked && before.dateLabel && (...)}` and `{!stacked && after.dateLabel && (...)}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/components/Map/ComparisonMapView.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/Map/ComparisonMapView.tsx src/components/Map/ComparisonMapView.test.tsx
git commit -m "feat(map): add stacked layout to ComparisonMapView for portrait"
```

---

### Task 2: SiteStepper + `stepIndex` helper

**Files:**
- Create: `src/components/MobilePortrait/SiteStepper.tsx`
- Test: `src/components/MobilePortrait/SiteStepper.test.tsx`

**Interfaces:**
- Consumes: `Site` from `src/types`.
- Produces:
  - `export function stepIndex(current: number, dir: 1 | -1, count: number): number | null` — returns the target index, or `null` when the move is not allowed (clamped at ends / empty list). With nothing selected (`current < 0`), `Next` returns `0` and `Prev` returns `null`.
  - `export function SiteStepper(props: { sites: Site[]; highlightedSiteId: string | null; onSelect: (siteId: string) => void }): JSX.Element` — a Prev/Next bar; buttons disable when `stepIndex` returns `null`.

- [ ] **Step 1: Write the failing test**

Create `src/components/MobilePortrait/SiteStepper.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { stepIndex } from "./SiteStepper";

describe("stepIndex", () => {
  it("Next from nothing selected picks the first site", () => {
    expect(stepIndex(-1, 1, 5)).toBe(0);
  });
  it("Prev from nothing selected is disabled", () => {
    expect(stepIndex(-1, -1, 5)).toBeNull();
  });
  it("clamps at the start", () => {
    expect(stepIndex(0, -1, 5)).toBeNull();
  });
  it("clamps at the end", () => {
    expect(stepIndex(4, 1, 5)).toBeNull();
  });
  it("steps forward in the middle", () => {
    expect(stepIndex(2, 1, 5)).toBe(3);
  });
  it("steps backward in the middle", () => {
    expect(stepIndex(2, -1, 5)).toBe(1);
  });
  it("returns null for an empty list", () => {
    expect(stepIndex(-1, 1, 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/components/MobilePortrait/SiteStepper.test.tsx`
Expected: FAIL — module not found / `stepIndex` not exported.

- [ ] **Step 3: Implement SiteStepper**

Create `src/components/MobilePortrait/SiteStepper.tsx`:

```tsx
import type { Site } from "../../types";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";

/**
 * Target index for a Prev/Next step, or null when the move is not allowed.
 * With nothing selected (current < 0), Next selects the first site and Prev is disabled.
 */
export function stepIndex(current: number, dir: 1 | -1, count: number): number | null {
  if (count <= 0) return null;
  if (current < 0) return dir === 1 ? 0 : null;
  const target = current + dir;
  if (target < 0 || target >= count) return null;
  return target;
}

interface SiteStepperProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSelect: (siteId: string) => void;
}

/**
 * Prev/Next bar for portrait phones — steps the highlighted site through the
 * filtered list. Sits at the seam between the stacked maps and the sites list.
 */
export function SiteStepper({ sites, highlightedSiteId, onSelect }: SiteStepperProps): JSX.Element {
  const t = useThemeClasses();
  const translate = useTranslation();

  const current = sites.findIndex((s) => s.id === highlightedSiteId);
  const prev = stepIndex(current, -1, sites.length);
  const next = stepIndex(current, 1, sites.length);

  const btn =
    "flex-1 px-4 py-2 text-sm font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand focus:outline-none";

  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${t.containerBg.semiTransparent}`}>
      <button
        type="button"
        className={`${btn} ${t.bg.hover} ${t.text.heading}`}
        disabled={prev === null}
        onClick={() => prev !== null && onSelect(sites[prev].id)}
        aria-label={translate("common.previous")}
      >
        ◀ {translate("common.previous")}
      </button>
      <button
        type="button"
        className={`${btn} ${t.bg.hover} ${t.text.heading}`}
        disabled={next === null}
        onClick={() => next !== null && onSelect(sites[next].id)}
        aria-label={translate("common.next")}
      >
        {translate("common.next")} ▶
      </button>
    </div>
  );
}
```

The i18n keys `common.previous` and `common.next` already exist (`"Previous"` / `"Next"`) — no i18n changes needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/components/MobilePortrait/SiteStepper.test.tsx`
Expected: PASS (all seven cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/MobilePortrait/SiteStepper.tsx src/components/MobilePortrait/SiteStepper.test.tsx
git commit -m "feat(mobile): add SiteStepper prev/next control for portrait"
```

---

### Task 3: TimelineMobilePortrait assembly

**Files:**
- Create: `src/components/MobilePortrait/TimelineMobilePortrait.tsx`

**Interfaces:**
- Consumes: `ComparisonMapView` (`stacked` prop, Task 1), `SiteStepper` (Task 2), `SitesTable` (`variant="mobile"`), `WaybackImagery` from `src/types/waybackTimelineTypes`, `Site` from `src/types`.
- Produces:
  - `export function TimelineMobilePortrait(props: TimelineMobilePortraitProps): JSX.Element`
  - `interface TimelineMobilePortraitProps { sites: Site[]; highlightedSiteId: string | null; onSiteHighlight: (siteId: string | null) => void; before: WaybackImagery; after: WaybackImagery; }`

- [ ] **Step 1: Create the component**

Create `src/components/MobilePortrait/TimelineMobilePortrait.tsx`:

```tsx
import type { Site } from "../../types";
import type { WaybackImagery } from "../../types/waybackTimelineTypes";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { ComparisonMapView } from "../Map/ComparisonMapView";
import { SitesTable } from "../SitesTable";
import { SiteStepper } from "./SiteStepper";

interface TimelineMobilePortraitProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSiteHighlight: (siteId: string | null) => void;
  before: WaybackImagery;
  after: WaybackImagery;
}

const noop = (): void => {};
// Force zoom-to-site on; markers off. Overlays are hidden in stacked mode,
// so the onChange handlers never fire.
const forcedMapSettings = {
  zoomToSite: true,
  onZoomToSiteChange: noop,
  showMarkers: false,
  onShowMarkersChange: noop,
};

/**
 * Portrait-phone layout: stacked before/after maps (the hero), a Prev/Next
 * site stepper at the seam, a scrollable mobile sites list, and a slim footer.
 * No header. See docs/superpowers/specs/2026-09-27-mobile-portrait-design.md.
 */
export function TimelineMobilePortrait({
  sites,
  highlightedSiteId,
  onSiteHighlight,
  before,
  after,
}: TimelineMobilePortraitProps): JSX.Element {
  const t = useThemeClasses();
  const translate = useTranslation();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Maps fill the first screen minus the stepper bar (~56px) */}
      <div className="h-[calc(100dvh-56px)] p-2">
        <ComparisonMapView
          sites={sites}
          highlightedSiteId={highlightedSiteId}
          before={before}
          after={after}
          onSiteClick={(site) => onSiteHighlight(site.id)}
          beforeMapSettings={forcedMapSettings}
          afterMapSettings={forcedMapSettings}
          stacked
        />
      </div>

      {/* Seam bar: at the screen bottom on load, at the top of the list once scrolled */}
      <SiteStepper
        sites={sites}
        highlightedSiteId={highlightedSiteId}
        onSelect={onSiteHighlight}
      />

      {/* Sites list — same embedded compact table as the desktop sidebar,
          fixed height, scrolls internally. Tapping a row highlights the site
          (repositioning the maps); no detail modal in phase 1. */}
      <div className={`h-[60vh] overflow-y-auto ${t.border.primary2}`}>
        <SitesTable
          embedded
          sites={sites}
          onSiteClick={(site) => onSiteHighlight(site.id)}
          onSiteHighlight={onSiteHighlight}
          highlightedSiteId={highlightedSiteId}
          visibleColumns={["status", "dateDestroyed"]}
          nameClickOnlyWhenHighlighted
        />
      </div>

      {/* Slim footer */}
      <footer className={`py-2 text-center text-[11px] ${t.text.muted}`}>
        {translate("footer.title")} ·{" "}
        <a
          href="https://github.com/yupitsleen/HeritageTracker"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {translate("footer.github")}
        </a>
      </footer>
    </div>
  );
}
```

Note: the `embedded` compact `SitesTable` (default `variant="compact"`) is the same table the desktop sidebar uses and honors `onSiteClick`/`onSiteHighlight`/`highlightedSiteId`/`visibleColumns`/`nameClickOnlyWhenHighlighted`. (The `variant="mobile"` accordion is NOT used — it takes only `sites` and would ignore selection, so row taps could not reposition the maps.) `visibleColumns={["status", "dateDestroyed"]}` shows Type + Name + Status + Date Destroyed; adjust if it overflows at ~360px. The theme keys `t.border.primary2`, `t.text.muted`, `t.containerBg.semiTransparent`, `t.bg.hover`, `t.text.heading` are all already used in `Timeline.tsx`.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: no errors from the new file.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: zero warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/MobilePortrait/TimelineMobilePortrait.tsx
git commit -m "feat(mobile): assemble TimelineMobilePortrait layout"
```

---

### Task 4: Wire the portrait branch into Timeline.tsx

**Files:**
- Modify: `src/pages/Timeline.tsx`

**Interfaces:**
- Consumes: `useMediaQuery` (`src/hooks/useMediaQuery.ts`), `TimelineMobilePortrait` (Task 3).
- Produces: no new exports — Timeline renders the portrait subtree when the media query matches.

- [ ] **Step 1: Add imports and the media query**

Near the other imports:
```tsx
import { useMediaQuery } from "../hooks/useMediaQuery";
import { TimelineMobilePortrait } from "../components/MobilePortrait/TimelineMobilePortrait";
```
Inside the component, after the other hooks:
```tsx
  // Portrait phones get a dedicated map-first layout (see spec 2026-09-27).
  const isPortraitPhone = useMediaQuery("(orientation: portrait) and (max-width: 767px)");
  // Sync + zoom are always on for the portrait path so stepping a site repositions the maps.
  const syncActive = isPortraitPhone || syncMapOnDotClick;
```

- [ ] **Step 2: Route the sync effect through `syncActive`**

In the "Sync map versions to the highlighted site" effect (currently guarded by `syncMapOnDotClick`), replace the guard and the dependency:
- Change `if (!syncMapOnDotClick || !highlightedSiteId ...)` to `if (!syncActive || !highlightedSiteId ...)`.
- In that effect's dependency array, replace `syncMapOnDotClick` with `syncActive`.

- [ ] **Step 3: Highlight the first site on the portrait path**

Add an effect after the deep-link effect:
```tsx
  // Portrait: start on the first site so the stacked maps show real imagery.
  useEffect(() => {
    if (isPortraitPhone && !highlightedSiteId && filteredSites.length > 0) {
      handleSiteHighlight(filteredSites[0].id);
    }
  }, [isPortraitPhone, highlightedSiteId, filteredSites, handleSiteHighlight]);
```

- [ ] **Step 4: Add the early portrait return**

Extract the loading and error blocks into local consts so both branches reuse them. Just above the existing `return (`:
```tsx
  const loadingEl = isLoading ? (
    <div className={`flex-1 flex items-center justify-center rounded ${t.border.primary2} ${t.containerBg.semiTransparent} shadow-xl`}>
      <div className="text-center">
        <div className={`text-xl mb-2 ${t.text.heading}`}>Loading Wayback Archive...</div>
        <div className={`text-sm ${t.text.muted}`}>Fetching historical imagery versions...</div>
      </div>
    </div>
  ) : null;

  const errorEl = error ? (
    <div className={`flex-1 flex items-center justify-center rounded ${t.border.primary2} ${t.containerBg.semiTransparent} shadow-xl`}>
      <div className="text-center">
        <div className="text-xl font-bold mb-2 text-red-600">Error Loading Archive</div>
        <div className={`text-sm mb-4 ${t.text.muted}`}>{error}</div>
        <Button onClick={handleRetryClick} variant="primary" size="sm">Retry</Button>
      </div>
    </div>
  ) : null;

  if (isPortraitPhone) {
    return (
      <div
        data-theme={isDark ? "dark" : "light"}
        className={`min-h-[100dvh] transition-colors duration-200 ${t.layout.appBackground}`}
      >
        {loadingEl}
        {errorEl}
        {!isLoading && !error && releases.length > 0 && (
          <AnimationProvider sites={filteredSites}>
            <TimelineMobilePortrait
              sites={filteredSites}
              highlightedSiteId={highlightedSiteId}
              onSiteHighlight={handleSiteHighlight}
              before={{
                tileUrl: beforeRelease?.tileUrl || "",
                maxZoom: beforeRelease?.maxZoom || 19,
                dateLabel: beforeRelease?.releaseDate,
              }}
              after={{
                tileUrl: currentRelease?.tileUrl || "",
                maxZoom: currentRelease?.maxZoom || 19,
                dateLabel: currentRelease?.releaseDate,
              }}
            />
          </AnimationProvider>
        )}
      </div>
    );
  }
```
Leave the existing desktop `return (...)` untouched below this block. (Optional cleanup: swap the inline loading/error JSX in the desktop `<main>` for `{loadingEl}` / `{errorEl}` to stay DRY — only if it does not disturb the surrounding markup.)

- [ ] **Step 5: Type-check, lint, and run affected unit tests**

Run: `npx tsc -b && npm run lint && npx vitest --run --changed HEAD`
Expected: clean type-check, zero lint warnings, tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Timeline.tsx
git commit -m "feat(mobile): render portrait layout below md in portrait orientation"
```

---

### Task 5: Visual verification and full gate

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` and note the local URL/port.

- [ ] **Step 2: Screenshot portrait at 390×844**

Load the app at 390×844 (Playwright MCP `browser_resize` then `browser_navigate`, or browser devtools). Confirm:
- Two maps stacked (before on top, after below), each large — no thin strips.
- Prev/Next bar visible at the bottom of the first screen.
- Scrolling down reveals the same Prev/Next bar atop a scrollable sites list, then the slim footer.
- Tapping a list row repositions the maps to that site; Prev/Next steps between sites and disables at the ends.
- No app header.

- [ ] **Step 3: Confirm landscape is unchanged**

Rotate to a landscape viewport (e.g. 844×390). Confirm the existing desktop-style layout still renders (portrait branch not triggered). No regression.

- [ ] **Step 4: Full test + lint gate**

Run: `npx vitest --run` then `npm run lint`
Expected: all unit tests pass, zero lint warnings.

- [ ] **Step 5: Verify line endings**

Run: `git diff --stat` on any uncommitted changes and confirm no whole-file rewrites (LF preserved). Nothing should be left uncommitted after Tasks 1–4; this is a final safety check.

---

## Self-Review Notes

- **Spec coverage:** stacked maps (Task 1) · Prev/Next stepper through sites (Task 2) · assembled portrait page with maps/stepper/list/footer, no header (Task 3) · orientation+width trigger, forced sync/zoom, initial highlight (Task 4) · cut features (header/D3 timeline/mini-map/imagery slider/settings/filters are simply not rendered in the portrait subtree) · row-tap selects (no modal) — Task 3 wires row click to `onSiteHighlight`. Landscape + detail modal explicitly deferred.
- **Reuse:** `useMediaQuery` and the `embedded` compact `SitesTable` reused, not rebuilt. i18n keys `common.previous`/`common.next` already exist.
- **Type consistency:** `stepIndex(current, dir, count)` signature identical in Task 2 definition and test; `TimelineMobilePortraitProps` identical in Tasks 3 and 4; `WaybackImagery` shape (`tileUrl`/`maxZoom`/`dateLabel`) matches the desktop `ComparisonMapView` call in `Timeline.tsx`.
- **Verified against the codebase:** `common.previous`/`common.next` exist in `src/i18n/en.ts`; `SitesTable` compact/embedded honors the selection props while the mobile accordion does not; column keys `"status"`/`"dateDestroyed"` match `useTableResize.getVisibleColumns()`.
