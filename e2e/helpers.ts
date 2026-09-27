import { Page } from '@playwright/test';

/**
 * Wait for page to be fully loaded and hydrated
 * Uses event-driven waits instead of arbitrary timeouts
 */
export async function waitForPageReady(page: Page, options?: {
  waitForMap?: boolean;
  waitForTimeline?: boolean;
  timeout?: number;
}) {
  const { waitForMap = false, waitForTimeline = false, timeout = 10000 } = options || {};

  // page.goto already waits for the 'load' event. We deliberately avoid
  // 'networkidle' (the Leaflet/OSM map streams tiles, so the network never
  // idles promptly) and blind timeouts — Playwright locators auto-wait, and
  // the element waits below cover the lazy-loaded components.

  // Wait for specific elements based on page type
  if (waitForMap) {
    // Wait for map container OR loading indicator to appear
    const mapOrLoading = page.locator('.leaflet-container, [role="status"], .skeleton-map').first();
    await mapOrLoading.waitFor({ state: 'visible', timeout });

    // If loading indicator is showing, wait for actual map
    const hasMap = await page.locator('.leaflet-container').count();
    if (hasMap === 0) {
      await page.locator('.leaflet-container').first().waitFor({
        state: 'visible',
        timeout: timeout * 2 // Double timeout for lazy-loaded maps
      });
    }
  }

  if (waitForTimeline) {
    // Timeline page uses lazy loading - wait for loading state to complete first
    // Look for either the success state elements OR error state
    const successOrError = page.locator(
      '[data-testid="wayback-slider"], button:has-text("Next"), .leaflet-container, .text-red-600'
    ).first();

    await successOrError.waitFor({
      state: 'visible',
      timeout: 30000 // 30 seconds for Timeline page with lazy-loaded components
    });
  }
}

/**
 * Navigate to a page and wait for it to be ready
 */
export async function gotoAndWait(page: Page, url: string, options?: Parameters<typeof waitForPageReady>[1]) {
  await page.goto(url);
  await waitForPageReady(page, options);
}
