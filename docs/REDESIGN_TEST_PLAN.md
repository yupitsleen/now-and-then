# Redesign Test Plan

**Goal:** Build a test safety net that survives a UX/UI redesign — so we can freely change *how the app looks* while proving *what the app does* still works.

**Status:** Live. Quick wins done; the safety net is now built **per redesign area, just-in-time** (see "How we actually work" below). Filters are covered; every other area is still thin.

**Post-cleanup note (2026-09-26):** the app is now a single-page landing (Timeline).
Dashboard, Data, Donate, About, and resources pages were deleted (e9801a5). Rows and
paragraphs below that reference `/dashboard` or `/data` are historical context for how
the test scaffolding evolved — treat them as archaeology, not current routes.

---

## The one idea this plan is built on

A redesign changes markup, class names, layout, and copy. That means tests split into two kinds:

- **Behavior tests** — drive the app the way a *user* does (by role, label, visible text) and assert on *observable outcomes* (results changed, date moved, panel opened). These **survive** a redesign. This is our target.
- **Structure tests** — assert on specific DOM shape, CSS classes, or exact markup. These **break** on a redesign even when nothing is actually broken — or worse, silently pass while testing nothing.

Lattice `test-quality` names the two traps we already have:
- **Testing Implementation Details** → "breaks on refactor with same behavior." Fix: assert observable behavior.
- **Conditional Test Logic** → tests with `if`/`loop`/`try` inside. Fix: remove the logic, let assertions fail naturally.

We have both. This plan trades them for behavior tests.

---

## Are "renders without crashing" tests bad?

Not worthless — but the **weakest tier**, and dangerous as a component's *only* test.

**What they catch:** a component that throws on mount — a bad import, a null deref in initial render, broken context wiring. Cheap smoke value.

**What they miss:** everything a redesign actually risks. A component can render a blank, broken, unusable page and still "not crash." `expect(container).toBeInTheDocument()` passes on a white screen.

**Verdict:**
- As the *sole* test for a component → false comfort. This is why the deleted `DashboardPage.test.tsx` (just "renders without crashing" + "has h1") was correctly removed — a real page-load journey covers the same ground and asserts more.
- As a *cheap first assertion alongside real behavior checks* → fine, keep them.

Rule of thumb: if the only way a test fails is a thrown exception, it's a smoke test, not a safety net.

---

## How we actually work (supersedes the original "write everything first" sequence)

The original plan was: build the whole 14-workflow suite, *then* redesign. We changed it. The loop is now **per area, just-in-time**:

1. **Characterize the area we're about to change** — behavior tests for what it does today, at the cheapest honest level (component if the widgets cooperate, e2e if they don't).
2. **Make the design change.**
3. **Prove the tests still pass** — plus a new test for any *new* behavior the change introduces, and a regression test for any bug it fixes.

Why: characterizing an area we won't touch this pass is guardrails for nothing. It also keeps each redesign slice self-contained — the tests that protect it are written, used, and proven green in the same sitting.

What that means for the table below: rows are **not a backlog to burn down**. A row gets built when its area is next in the redesign, and stays ✗ until then — that's the intended state, not a debt.

---

## Where we stand today

Coverage (v8, `npm run test:coverage`) sits below the config's 80% thresholds on every metric. Those thresholds are aspirational — they don't gate `npm test`, which skips coverage — and per the decisions log we are deliberately not chasing them. Run the command for current numbers; counts are not recorded here (the code is the source of truth).

**Strong (redesign-proof, keep as-is):** the filter and timeline *engines* — `useFilteredSites`, `siteFilters`, `filterStateAdapter`, `timelineCalculations`, `intervalCalculations`, `useTimelineData`, `heritageMetrics`. The hard logic is protected. Good.

**Covered since (the areas we've redesigned):**
- **Filters** — `src/components/FilterBar/FilterBar.baseline.test.tsx` characterizes the whole component (both variants, the collapse rail, the layout toggle, accordion facets); `e2e/filters.spec.ts` proves the real wiring (filter → result count changes) plus the `/data` year-filter regression and the Dashboard's remembered layout.
- **Theming convention** — `src/__tests__/darkModeConvention.test.ts` fails if any component reintroduces a Tailwind `dark:` modifier.
- The `if (count > 0)` guards are gone everywhere; what can't be proven yet is `test.fixme`, visibly pending instead of silently green.

**Still weak (the remaining redesign risk):**
1. **Mobile has zero active coverage.** The Playwright mobile project is still commented out (`playwright.config.ts:65`); the deleted mobile suite has not been rebuilt.
2. **Timeline is uncharacterized** — and it's the other area flagged complex. Scrubber drag and comparison site-selection are still `test.fixme`; they're exactly what a Timeline redesign would break. **These get built when the Timeline redesign starts**, per the loop above.
3. **Timeline scrubber + comparison selection** are the only journeys left that need real work (SVG/D3 drag targets, async Wayback load). Everything else cross-cutting — language/RTL, theme, export — is now covered.

---

## Quick wins — ✅ DONE

Executed. Result: the three affected e2e specs pass with zero failures, and the remaining gaps are now *visible* (`test.fixme`) instead of silently green. Unit suite unaffected; lint clean.

| # | Fix | Outcome |
|---|---|---|
| QW1 | Replace `if (count > 0)` guards with direct assertions across `smoke`, `timeline`, `comparison` | Done — and it surfaced that the guards were hiding **more than expected** (below) |
| QW2 | Rewrite the flaky `timeline.spec.ts` load test to wait on the real `data-testid="wayback-slider"` signal; drop `.text-red-600` coupling and HTML-dump debug logic | Done — passes reliably |
| QW3 | Rebuild the dark-mode **convention** guardrail as `src/__tests__/darkModeConvention.test.ts` (fails if any component/page uses a Tailwind `dark:` modifier) | Done — passes (0 offenders today). Dropped the old file's two no-op tests (`expect(true).toBe(true)`) |

**What the guards were hiding (worse than the plan assumed):** nearly every guarded test was *hollow* — its selector never matched, so it had been green while asserting nothing:
- `smoke` nav test queried `getByRole('link')`, but header nav items are `<button>`s → never matched.
- `smoke` marker-click ran on `/` (Timeline landing, markers hidden) → no markers to click.
- `timeline` dashboard-nav guarded on `.timeline-scrubber` → the scrubber is `role="region" aria-label="Timeline Scrubber"`; class doesn't exist.
- `comparison` site-selection (×3) guarded on `.timeline-dot` → dots are D3-rendered inside an `aria-hidden` SVG; that selector doesn't exist.

**Deferred to the workflow phase (now `test.fixme`, visibly pending, not silently green):**
- Marker tap → site detail: dashboard markers render fine, but they're SVG CircleMarkers a plain Playwright `.click()` can't action (hangs to the 60s test cap). Needs force/coordinate click.
- Comparison site-selection (×3): real selection is via the Prev/Next event buttons + async Wayback load. Build with the other journeys.

**Also de-flaked:** the pre-existing `map shows site markers` timeout (15s → 30s) — the heavy lazy map chunk exceeds 15s on a cold dev server under parallel load. (Not in original scope; same fix class as QW2.)

---

## Workflow inventory — build each when its area is next in the redesign

Each row is a user journey driven by roles/text, asserting an observable state change. ✗ means "not built yet, and that's fine until we touch that area."

| Workflow | What a redesign can silently break | Assert (observable) | Today |
|---|---|---|---|
| **Apply a type filter** | Filter control moves into a drawer/menu; wiring lost | Result count / visible rows actually change | ✅ `filters.spec.ts` |
| **Apply year range** | Slider/inputs restyled | Result count changes on `/` | ✅ `filters.spec.ts` (regression for the inline-filter bug) |
| **Apply destruction-date range** | Date inputs restyled | Result count changes on `/` | ✅ `filters.spec.ts` |
| **Facet accordion open/close** | Header markup changes | Facet collapses, content hidden | ✅ `FilterBar.baseline.test.tsx` |
| **Clear all filters** | Button relocated | Results return to the unfiltered count | ✅ `filters.spec.ts` |
| **Combine filters (multi)** | Layout reflow | AND-logic result set correct | 🟡 unit only (`useFilteredSites`) |
| **Timeline scrubber drag** | Scrubber rebuilt | Active date changes *and* map/markers update | ✗ — build with the Timeline redesign |
| **Timeline play/pause/next/prev/reset** | Controls relocated | Date advances/resets | 🟡 presence-only e2e + unit |
| **Select site → comparison view** | Panel/layout change | Before/after maps show, site name shows | ✗ `test.fixme` ×3 |
| **Calendar toggle (Gregorian ↔ Islamic)** | — | — | **N/A — no UI exists.** `CalendarProvider` is mounted in `App.tsx` but nothing consumes `useCalendar` outside tests. Either dead context or an unbuilt feature; decide before writing a test for it |
| **Language switch + RTL (en/ar/it)** | Header/nav restyled | `<html dir>` flips to rtl, `lang` changes, survives reload | ✅ `preferences.spec.ts` |
| **Theme toggle (light/dark)** | Theme control moves | `<html data-theme>` flips, survives reload | ✅ `preferences.spec.ts` + convention guardrail |
| **Export (CSV/JSON/GeoJSON)** | Export button relocated | Download fires with the chosen format's filename | ✅ `export.spec.ts` (CSV + GeoJSON) |
| **Mobile: hamburger nav** | Responsive breakpoints change | Menu opens, link navigates, menu closes | ✗ (deleted) |
| **Mobile: filter drawer** | Drawer redesigned | Opens, applies a filter, closes | ✗ (deleted) |
| **Mobile: map marker tap** | Touch targets change | Tap marker → detail shows | ✗ (deleted) |

Mobile rows require **re-enabling the Playwright mobile project** (`playwright.config.ts`) — a prerequisite, not optional, if we want mobile protected.

**Where to put a new test:** component level when the widgets deliver events in jsdom (the sidebar facets do); e2e when they don't (Headless UI Popover/Dialog don't) or when the journey spans pages, reloads, or real layout. Don't fight jsdom — that call is already in the decisions log.

---

## Deleted tests — what to do with each

Checked the delete history. Verdicts:

| Deleted | Verdict |
|---|---|
| `Timeline.sync.test.tsx`, `DashboardPage/DataPage/App.test.tsx` (c72aa6b) | **Leave deleted.** Timeline.sync tested a *pasted copy* of the algorithm, not the real function; the rest were pure smoke tests. |
| `mobile.spec.ts` — 517 lines (ca2efdc) | **Rebuild scenarios, don't restore file.** Great *checklist* (see mobile rows above), but same `if (count>0)` flaw and needs the mobile project re-enabled. |
| `darkModeAutomated.test.tsx` — 231 lines (136e4d3) | **Rebuild** as QW3 — genuine guardrail. |
| config/*.test.ts, tooltip, per-icon `toBeDefined` (various) | **Leave deleted.** Circular constant-value / registry assertions, correctly pruned. |

---

## Deliberately NOT doing

- **Not chasing 80% line coverage.** Coverage % is not the goal; behavior protection is. We could hit 80% with useless smoke tests and be no safer.
- **Not blindly restoring deleted files.** Most were deleted for good reason.
- **Not adding unit tests that assert DOM structure/class names.** Those are the tests we're trying to get *away* from.

---

## Sequence

1. **Quick wins (QW1–QW3)** — honest existing tests + theming guardrail. ✅ done
2. **Filters area** — characterize → redesign (dedupe, faceted sidebar, collapse rail, layout toggle, accordion) → green. ✅ done
3. **Timeline area** — same loop, not started. Characterizing it means solving the two `test.fixme`s (SVG/D3 drag targets, comparison selection).
4. **Mobile** — re-enable the Playwright mobile project, then characterize → redesign.
5. **Cross-cutting journeys** (i18n/RTL, theme, export) — ✅ done as a cheap batch; they assert `<html>` attributes and download filenames, so they cost little and break only on real regressions.

> The original plan ran steps 2–4 as one big "write all the tests first" phase. Replaced by the per-area loop above; see "How we actually work".

Stack confirmed for all of the above: Vitest + Testing Library (unit/component), Playwright chromium (e2e), MSW (network mocks) — per `.lattice/standards/language-idioms.md`.
