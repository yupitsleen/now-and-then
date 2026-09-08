import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Timeline Page
 *
 * Integration checks that the Timeline page renders its Wayback comparison UI and that the
 * Dashboard exposes the timeline event-navigation controls. Detailed scrubber/slider behavior
 * is covered by unit tests (WaybackSlider.test.tsx, TimelineScrubber.test.tsx).
 */

test.describe('Timeline Page - Integration', () => {
  test('timeline page loads with the wayback comparison UI', async ({ page }) => {
    test.slow(); // Wayback archive fetch + lazy map chunks are slow under parallel load.

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The comparison maps are the default view.
    await expect(page.locator('.leaflet-container').first()).toBeVisible({ timeout: 30000 });

    // The imagery slider ships on, as a tab beside the site timeline.
    await page.locator('#timeline-tab-imagery').click();
    await expect(page.getByTestId('wayback-slider')).toBeVisible({ timeout: 30000 });
  });

  test('expanding the sites table takes focus and makes the dimmed content unreachable', async ({ page }) => {
    test.slow();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible({ timeout: 30000 });
    // The map's own overlay controls stand in for "everything the backdrop dims".
    const zoomIn = page.getByRole('checkbox', { name: /zoom to site/i }).first();
    await expect(zoomIn).toBeVisible();

    // The expand button lives in the sidebar's Sites tab, which starts collapsed.
    // Scope to the sidebar: the timeline has its own Sites tab.
    const showFilters = page.getByRole('button', { name: /show filters/i });
    if (await showFilters.isVisible()) await showFilters.click();
    const sidebar = page.getByRole('complementary', { name: /filters/i });
    await sidebar.getByRole('tab', { name: /^sites$/i }).click();
    await sidebar.getByRole('button', { name: /expand/i }).first().click();

    const expanded = page.getByRole('region', { name: /expand/i });
    await expect(expanded).toBeFocused();

    // inert takes the dimmed content out of the tab order — it can't hold focus.
    await zoomIn.focus().catch(() => {});
    await expect(zoomIn).not.toBeFocused();

    // Non-modal: the filter sidebar beside it stays reachable.
    await expect(page.getByRole('tab', { name: /^filters$/i })).toBeVisible();

    // Leaving the expanded view hands the map controls back.
    await page.keyboard.press('Escape');
    await zoomIn.focus();
    await expect(zoomIn).toBeFocused();
  });

  test('dashboard exposes timeline event-navigation controls', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // The scrubber renders as a labelled region containing Previous/Next event buttons.
    const scrubber = page.getByRole('region', { name: /timeline scrubber/i });
    await expect(scrubber).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /previous destruction event/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next destruction event/i })).toBeVisible();
  });
});
