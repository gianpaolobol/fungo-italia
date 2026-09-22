import { test, expect } from "@playwright/test";

const viewports = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x812", width: 375, height: 812 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];

const headers = {
  "oai-authenticated-user-id": "visual-smoke-user",
  "oai-authenticated-user-email": "visual-smoke@example.test",
  "oai-authenticated-user-full-name": "Visual%20Smoke",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
};

async function horizontalOverflow(page) {
  return page.evaluate(() =>
    Math.max(
      0,
      document.documentElement.scrollWidth - window.innerWidth,
      document.body.scrollWidth - window.innerWidth,
    ),
  );
}

for (const viewport of viewports) {
  test(`visual smoke ${viewport.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      extraHTTPHeaders: headers,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.goto("http://127.0.0.1:8787/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Fungo Italia").first()).toBeVisible();
    await expect(page.getByRole("tab", { name: "Atlante" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.getByRole("tab", { name: "Atlante" }).click();
    await expect(page.getByRole("heading", { name: "Nomi comprensibili, rigore scientifico" })).toBeVisible();
    await page.waitForTimeout(800);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    const openButton = page.getByRole("button", { name: "Apri scheda" }).first();
    await expect(openButton).toBeVisible({ timeout: 15000 });
    await openButton.click();
    await expect(page.getByRole("button", { name: /Torna ai risultati|Torna al genere|Torna al gruppo/ })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.screenshot({ path: `artifacts/visual-smoke/${viewport.name}.png`, fullPage: true });
    await context.close();
  });
}
