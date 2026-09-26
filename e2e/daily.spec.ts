import type { Cell } from "../src/domain/cell";
import { expect, test } from "./fixtures";

// A cell `blocks` 2 km blocks east of the answer: always a wrong guess.
const missBy = (answer: Cell, blocks: number): Cell => ({ ...answer, x: answer.x + 2000 * blocks });

test("a lost daily game: hints, guess details, hard mode, reload and sharing", async ({
  page,
  player,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByText("#3")).toBeVisible();
  const [answer] = await player.answers();
  if (!answer) throw new Error("today's puzzle has no answer");

  await test.step("clicking the zoomed-out map zooms in instead of selecting", async () => {
    await player.clickMap(missBy(answer, 1));
    expect(await page.evaluate(() => window.fakeNaverMaps.zoom())).toBeGreaterThan(7);
    await expect(page.getByText("지도를 확대해 위치를 선택해주세요.")).toBeVisible();
    await expect(page.getByRole("button", { name: "제출하기" })).toBeHidden();
  });

  await test.step("a wrong guess fills a slot and reveals grid hints", async () => {
    await player.guess(missBy(answer, 1));
    await expect(page.getByRole("button", { name: "1번째 오답 보기" })).toBeVisible();

    await player.panTo(answer);
    await player.zoomTo(13);
    await expect(page.getByText("????").first()).toBeVisible();
  });

  await test.step("the same cell cannot be guessed twice", async () => {
    await player.guess(missBy(answer, 1));
    await expect(page.getByText("이미 추측한 격자입니다")).toBeVisible();
  });

  await test.step("an attempt slot opens the guess with its direction hint", async () => {
    await page.getByRole("button", { name: "1번째 오답 보기" }).click();
    await expect(page.getByText("추측 1")).toBeVisible();
    await expect(page.getByText("서울특별시 중구 명동")).toBeVisible();
    await expect(page.getByRole("link", { name: "지도에서 보기" })).toHaveAttribute(
      "href",
      /^https:\/\/map\.naver\.com\/p\?c=/,
    );
    await expect(page.getByText("정답은 여기서")).toBeVisible();
  });

  await test.step("hard mode hides hints and can be turned on mid-game", async () => {
    await page.getByRole("button", { name: "설정 열기" }).click();
    await page.getByRole("switch").click();
    await page.keyboard.press("Escape");
    await expect(page.getByText("정답은 여기서")).toBeHidden();
    await expect(page.getByText("????")).toHaveCount(0);
  });

  await test.step("progress survives a reload", async () => {
    await page.reload();
    await expect(page.getByRole("button", { name: "1번째 오답 보기" })).toBeVisible();
    await expect(page.getByRole("switch", { includeHidden: true })).toHaveCount(0);
  });

  await test.step("six wrong guesses end the game with the answers revealed", async () => {
    for (const blocks of [2, 3, 4, 5, 6]) await player.guess(missBy(answer, blocks));
    const result = page.getByRole("dialog", { name: "게임 결과" });
    await expect(result.getByText("정답을 찾지 못했어요")).toBeVisible();
    await expect(result.getByRole("button", { name: "후보 1" })).toBeVisible();
  });

  await test.step("the shared result hides the pole number", async () => {
    await page.getByRole("button", { name: "결과 복사하기" }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    expect(shared).toContain("전봇들 #3");
    expect(shared).toContain("X/6");
    expect(shared).not.toContain(await player.puzzleCode());
    await expect(page.getByRole("link", { name: "X에 공유하기" })).toHaveAttribute(
      "href",
      /^https:\/\/x\.com\/intent\/tweet\?text=/,
    );
  });
});

test("winning builds a streak that carries into the next day", async ({ page, player }) => {
  await page.goto("/");
  const [answer] = await player.answers();
  if (!answer) throw new Error("today's puzzle has no answer");

  await player.guess(answer);
  await expect(page.getByText("1번 만에 찾았어요!")).toBeVisible();
  const result = page.getByRole("dialog", { name: "게임 결과" });
  await expect(result.getByText("서울특별시 중구 명동")).toBeVisible();
  await expect(result.getByRole("link", { name: "지도에서 보기" })).toBeVisible();
  await expect(page.getByLabel("연속 정답 1일")).toBeAttached();

  // The next day starts with a new puzzle and keeps the streak.
  await page.clock.fastForward("24:00:00");
  await page.reload();
  await expect(page.getByText("#4")).toBeVisible();
  await expect(page.getByLabel("연속 정답 1일")).toBeAttached();
  await expect(page.getByRole("button", { name: /번째 (오답|정답) 보기/ })).toHaveCount(0);
});
