import { test, expect } from "@playwright/test";

/**
 * E2E — User preferences (theme, language/RTL)
 *
 * Both are persisted to localStorage and applied to <html>, so the assertions are
 * on document attributes rather than on any styling — they survive a redesign of
 * the controls or of the theme palette itself.
 *
 * Both controls live in the Timeline's sidebar, under Settings › Advanced Settings.
 */

/** Opens the Advanced Settings block that holds the theme and language controls. */
async function openAdvancedSettings(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // The sidebar may load railed or open; either way, end up open before reaching the tabs.
  const show = page.getByRole("button", { name: /show filters/i });
  if (await show.isVisible()) await show.click();
  await page.getByRole("tab", { name: /^settings$/i }).click();
  await page.getByText(/advanced settings/i).click();
}

test.describe("User preferences", () => {
  test("the theme toggle flips the document theme and is remembered", async ({ page }) => {
    await openAdvancedSettings(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.getByRole("checkbox", { name: /dark mode/i }).check();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("switching to Arabic flips the document to RTL and is remembered", async ({ page }) => {
    await openAdvancedSettings(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "ltr");

    await page.getByRole("combobox", { name: /language/i }).selectOption("ar");

    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", /^ar/);

    await page.reload();
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("help is reachable from Advanced Settings", async ({ page }) => {
    await openAdvancedSettings(page);

    await page.getByRole("button", { name: /^help$/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /how to use/i })).toBeVisible();
  });
});
