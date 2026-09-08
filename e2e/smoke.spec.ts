import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests - Basic Functionality
 *
 * Purpose: Quick sanity checks that critical pages load and function
 * Optimized to remove redundant tests and arbitrary waits
 */

test.describe('Smoke Tests - Core Pages', () => {
  test('homepage (Dashboard) loads successfully with map', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for key elements
    await expect(page).toHaveTitle(/then & now/i);

    // Map should be visible
    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Smoke Tests - Navigation', () => {
  // There is no in-app navigation: the header is a logo and a title, and /data,
  // /dashboard and /resources/* are retiring. Routes are reached by URL.

  test('browser back button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/data');
    await page.waitForLoadState('networkidle');

    await page.goBack();

    // toHaveURL retries — under parallel load networkidle can settle before the nav does.
    await expect(page).not.toHaveURL(/\/data/);
  });
});

test.describe('Smoke Tests - Mock Data', () => {
  test('map shows site markers', async ({ page }) => {
    // The landing page (/) is the Timeline's comparison satellite view, which hides
    // site markers by default. The Dashboard is the marker map, so test it here.
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for map to render. The dashboard map chunk (leaflet + map-vendor) is heavy and
    // lazy-loaded; a cold dev server under parallel load can exceed 15s on first compile.
    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible({ timeout: 30000 });

    // Look for markers or clusters (flexible: divIcon markers, clusters, canvas, or SVG CircleMarkers)
    const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-cluster, .marker-cluster, canvas.leaflet-zoom-animated, path.leaflet-interactive').first();
    await expect(markers).toBeVisible({ timeout: 5000 });
  });

  // FIXME — rebuild as a real journey in the workflow phase (docs/REDESIGN_TEST_PLAN.md →
  // "Mobile: map marker tap" / site selection). The original test guarded marker existence on
  // "/" (the Timeline landing view, which hides markers) so it never asserted anything. On the
  // Dashboard the markers render fine (see "map shows site markers"), but they are SVG
  // CircleMarkers that a plain Playwright .click() cannot satisfy actionability on — the click
  // retries until the 60s test timeout. Selecting a site → opening its detail needs a deliberate
  // approach (force-click / click at marker coordinates), built with the other selection journeys.
  test.fixme('clicking on map marker shows site details', async () => {});
});

test.describe('Smoke Tests - Error Handling', () => {
  test('console has no critical errors', async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known acceptable errors (network issues, external resources)
        if (!text.includes('favicon') &&
            !text.includes('tile') &&
            !text.includes('404') &&
            !text.includes('net::ERR') &&
            !text.includes('Failed to load resource')) {
          criticalErrors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have zero critical errors (all errors should be filtered or fixed)
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);
  });
});

test.describe('Smoke Tests - Performance', () => {
  test('homepage loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 7 seconds (allows for slower CI runners)
    // This catches major performance regressions while being realistic for CI
    expect(loadTime).toBeLessThan(7000);
  });
});

test.describe('Smoke Tests - Accessibility', () => {
  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through first few elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should have moved focus to an interactive element (not body)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Focus should be on an interactive element: BUTTON, A (link), INPUT, SELECT, TEXTAREA
    expect(focusedElement).toMatch(/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/);
  });
});
