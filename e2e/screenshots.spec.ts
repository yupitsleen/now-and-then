import { test } from "@playwright/test";

/**
 * Visual capture pass — not assertions. Opt in by naming the batch:
 *   SHOT_DIR=before npx playwright test e2e/screenshots.spec.ts
 * Without SHOT_DIR it skips, so `npm run e2e` stays a pure test run.
 */
const dir = process.env.SHOT_DIR;
const shot = (name: string) => ({ path: `screenshots/${dir}/${name}.png`, fullPage: false });

test.describe("visual capture", () => {
  test.skip(!dir, "set SHOT_DIR to capture a screenshot batch");

  test("timeline page states", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await page.screenshot(shot("01-timeline-default"));

    // Settings tab in the filter sidebar
    const settingsTab = page.getByRole("tab", { name: /settings/i });
    if (await settingsTab.count()) {
      await settingsTab.first().click();
      await page.waitForTimeout(500);
      await page.screenshot(shot("02-sidebar-settings"));
    }

    // Filters tab (year/date facets)
    const filtersTab = page.getByRole("tab", { name: /^filters$/i });
    if (await filtersTab.count()) {
      await filtersTab.first().click();
      await page.waitForTimeout(500);
      await page.screenshot(shot("03-sidebar-filters"));
    }

    // Expanded sites table overlay
    const sitesTab = page.getByRole("tab", { name: /^sites$/i });
    if (await sitesTab.count()) {
      await sitesTab.first().click();
      await page.waitForTimeout(500);
      const expand = page.getByRole("button", { name: /expand/i });
      if (await expand.count()) {
        await expand.first().click();
        await page.waitForTimeout(800);
        await page.screenshot(shot("04-table-expanded"));
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
    }
  });
});
