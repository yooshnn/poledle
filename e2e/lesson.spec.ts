import { expect, test } from "./fixtures";

// Seoul City Hall: the lesson's anchor example, whose pole numbers start 9926.
const CITY_HALL = { lat: 37.5665, lng: 126.978 };

test("the lesson: rulers, the code under the crosshair, region tables and mobile tabs", async ({
  page,
  player,
}) => {
  await page.goto("/");

  await test.step("the help dialog links to the lesson", async () => {
    await page.getByRole("button", { name: "게임 방법" }).click();
    await page.getByRole("link", { name: "Lesson" }).click();
    await expect(page).toHaveURL(/\/lesson$/);
    await expect(page.getByRole("heading", { name: "번호 읽는 법" })).toBeVisible();
  });

  await test.step("the mode menu marks Lesson as current", async () => {
    await page.getByRole("button", { name: "게임 모드 메뉴 열기" }).click();
    await expect(page.getByRole("link", { name: /Lesson/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.keyboard.press("Escape");
  });

  await test.step("the badge shows the code under the crosshair", async () => {
    await player.mapReady();
    await page.evaluate(({ lat, lng }) => window.fakeNaverMaps.panTo(lat, lng), CITY_HALL);
    await player.zoomTo(12);
    await expect(page.getByTestId("lesson-code")).toHaveText(/^9926[A-Z]\d\d$/);
    await expect(page.getByTestId("lesson-place")).toHaveText("서울특별시 · 중구");
  });

  await test.step("zooming in adds letters and then digits to the rulers", async () => {
    const code = await page.getByTestId("lesson-code").textContent();
    const letter = code?.charAt(4) ?? "";
    await player.zoomTo(15);
    await expect(page.getByTestId("ruler-x").getByText(letter, { exact: true })).toBeAttached();
    await player.zoomTo(18);
    await expect(
      page.getByTestId("ruler-x").getByText(code?.charAt(5) ?? "", { exact: true }),
    ).toBeAttached();
  });

  await test.step("the key-region table lists Seoul with its representative digits", async () => {
    const seoul = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "서울", exact: true }) })
      .first();
    await expect(seoul).toContainText("9926");
  });

  await test.step("on a phone the guide and the map are tabs, the guide first", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByRole("heading", { name: "번호 읽는 법" })).toBeVisible();
    await expect(page.getByTestId("lesson-code")).toBeHidden();
    await page.getByRole("tab", { name: "지도" }).click();
    await expect(page.getByTestId("lesson-code")).toBeVisible();
    await expect(page.getByRole("heading", { name: "번호 읽는 법" })).toBeHidden();
  });
});
