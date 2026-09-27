import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests - Basic Functionality
 *
 * Purpose: Quick sanity checks that the single-page app ('/') loads and functions.
 * The app has one route ('/' → Timeline); /data, /dashboard and /resources/* were
 * removed in the single-page redesign, so tests that drove those pages are gone.
 */

test.describe('Smoke Tests - Core Pages', () => {
  test('homepage loads successfully with map', async ({ page }) => {
    await page.goto('/');

    // Check for key elements
    await expect(page).toHaveTitle(/then & now/i);

    // Map should be visible
    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible({ timeout: 30000 });
  });
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

    const loadTime = Date.now() - startTime;

    // Should load within 7 seconds (allows for slower CI runners)
    // This catches major performance regressions while being realistic for CI
    expect(loadTime).toBeLessThan(7000);
  });
});

test.describe('Smoke Tests - Accessibility', () => {
  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through first few elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should have moved focus to an interactive element (not body)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Focus should be on an interactive element: BUTTON, A (link), INPUT, SELECT, TEXTAREA
    expect(focusedElement).toMatch(/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/);
  });
});
