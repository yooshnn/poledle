import { expect, test } from "./fixtures";

test("a rejected Client ID shows a message instead of breaking the page", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await page.goto("/");
  await page.waitForFunction(() => "fakeNaverMaps" in window);
  await page.evaluate(() => window.fakeNaverMaps.failAuthentication());

  await expect(page.getByText("지도 인증에 실패했습니다")).toBeVisible();
  await expect(page.getByTestId("pole-code")).toBeVisible();
  expect(errors).toEqual([]);
});
