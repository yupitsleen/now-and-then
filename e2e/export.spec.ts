import { test, expect, type Page } from "@playwright/test";

/**
 * E2E — Export from the sites table
 *
 * The exporters themselves are unit-tested; what a redesign can break is the
 * wiring — the format select and Export button actually producing a download.
 * Asserting on the suggested filename proves the chosen format reached the exporter.
 *
 * The export controls live in the expanded sites table, reached from the filter
 * sidebar's Sites tab on the single-page app ('/').
 */

/** Open the expanded sites table (where the export controls live) on '/'. */
async function openExpandedTable(page: Page) {
  await page.goto("/");
  const showFilters = page.getByRole("button", { name: /show filters/i });
  if (await showFilters.isVisible()) await showFilters.click();
  const sidebar = page.getByRole("complementary", { name: /filters/i });
  await sidebar.getByRole("tab", { name: /^sites$/i }).click();
  await sidebar.getByRole("button", { name: /expand/i }).first().click();
  await expect(page.getByRole("region", { name: /expand/i })).toBeVisible({ timeout: 30000 });
}

test.describe("Export workflows", () => {
  test("exporting the sites table downloads a CSV", async ({ page }) => {
    await openExpandedTable(page);

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export csv/i }).click();

    expect((await download).suggestedFilename()).toMatch(/^heritage-tracker-sites-.*\.csv$/);
  });

  test("choosing GeoJSON exports GeoJSON, not the default format", async ({ page }) => {
    await openExpandedTable(page);
    await page.getByRole("combobox", { name: /select export format/i }).selectOption("geojson");

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export geojson/i }).click();

    expect((await download).suggestedFilename()).toMatch(/\.geojson$/);
  });
});
