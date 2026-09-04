import { expect, test } from "@playwright/test";

test("homepage has a usable professional baseline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Your Studio/);
  await expect(page.getByRole("main")).toContainText("Build a focused website");
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Contact" }),
  ).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();

  await page.setViewportSize({ width: 375, height: 700 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
