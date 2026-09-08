import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Comparison Mode
 *
 * Purpose: Test critical comparison mode workflows that require full page context:
 * - Timeline page loading with comparison UI
 * - Site selection enabling dual maps
 * - Maps displaying different time periods
 * - Site name display in comparison view
 *
 * Note: Detailed interactions (scrubber drag, date labels, colors, sync toggle) are covered by:
 * - WaybackSlider.test.tsx (67 unit tests)
 * - ComparisonMapView.test.tsx (58 unit tests)
 */

test.describe('Comparison Mode - Critical Workflows', () => {
  test('Timeline page loads with comparison view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should load successfully
    await expect(page).toHaveTitle(/then & now/i);

    // Map should be visible (Timeline page always shows map)
    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible({ timeout: 5000 });
  });

  /*
   * FIXME — rebuild as real journeys in the workflow phase (docs/REDESIGN_TEST_PLAN.md →
   * "Select site → comparison view"). The original versions of the three tests below guarded
   * on `.timeline-dot` / `[data-testid="timeline-dot"]`, selectors that do not exist: timeline
   * dots are D3-rendered inside an aria-hidden SVG, so `count()` was always 0 and every
   * assertion was silently skipped. Real site selection happens via the Previous/Next event
   * buttons (aria-label "Go to next/previous destruction event"); rebuild these to select a
   * site that way, then assert dual maps render, differing imagery periods, and the site name.
   */
  test.fixme('selecting a site enables dual-map comparison', async () => {});
  test.fixme('before/after maps show different imagery periods', async () => {});
  test.fixme('selected site name is shown in the comparison view', async () => {});
});
