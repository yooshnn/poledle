import { regionCorner, sameCell, type Cell } from "../src/domain/cell";
import { expect, test } from "./fixtures";

// Another 50 m cell in the same 500 m square: correct at Normal, where the square is the goal.
function sameSquare(answer: Cell): Cell {
  const corner = regionCorner(answer, 500);
  return sameCell(corner, answer) ? { ...corner, x: corner.x + 50 } : corner;
}

test("an Infinite run: rounds, resuming, giving up and the end screen", async ({
  page,
  player,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/infinite");
  await page.getByRole("button", { name: /^Normal/ }).click();

  await test.step("Normal accepts any cell in the answer's 500 m square", async () => {
    await expect(page.getByRole("timer")).toHaveText(/^(3:00|2:5\d)$/);
    const [answer] = await player.answers();
    if (!answer) throw new Error("the round has no answer");
    await player.guess(sameSquare(answer));
    await expect(page.getByText("찾았어요!")).toBeVisible();
    await expect(page.getByLabel("연속 정답 1문제")).toBeAttached();
  });

  await test.step("finding it first time adds 4 minutes and stops the clock", async () => {
    // X, Y and the find: 30 + 30 + 30 + 5 × 30 seconds.
    await expect(page.getByText("+180s 정답")).toBeVisible();
    await expect(page.getByRole("timer")).toHaveText(/^(7:00|6:5\d)$/);
    const stopped = await page.getByRole("timer").textContent();
    await page.clock.fastForward("01:00");
    await page.reload();
    // Neither the minute waiting nor the reload changed it: no second bonus either.
    await expect(page.getByRole("timer")).toHaveText(stopped ?? "");
  });

  await test.step("the next round carries the clock on", async () => {
    const firstCode = await player.puzzleCode();
    await page.getByRole("button", { name: "다음 문제" }).click();
    await expect(page.getByText("2번째 문제")).toBeVisible();
    expect(await player.puzzleCode()).not.toBe(firstCode);
    await expect(page.getByRole("timer")).toHaveText(/^(7:00|6:5\d)$/);
  });

  await test.step("the run survives a reload, clock included", async () => {
    const code = await player.puzzleCode();
    await page.clock.fastForward("01:00");
    await page.reload();
    expect(await player.puzzleCode()).toBe(code);
    await expect(page.getByRole("timer")).toHaveText(/^(6:00|5:5\d)$/);
  });

  await test.step("suspending keeps the run and stops its clock", async () => {
    const code = await player.puzzleCode();
    await page.getByRole("button", { name: "중단하기" }).click();
    await expect(page.getByRole("button", { name: /^Normal/ })).toContainText("진행 중 · 1문제");

    await page.clock.fastForward("05:00");
    await page.getByRole("button", { name: /^Normal/ }).click();
    expect(await player.puzzleCode()).toBe(code);
    await expect(page.getByRole("timer")).toHaveText(/^(6:00|5:5\d)$/);
  });

  await test.step("giving up shows the summary with the found places rolling behind", async () => {
    const lookups = await page.evaluate(() => window.fakeNaverMaps.geocodeCount());
    await player.giveUp();

    const summary = page.getByRole("region", { name: "게임 결과" });
    await expect(summary.getByText("1문제 연속 정답")).toBeVisible();
    await expect(summary.getByText(/포기했어요/)).toBeVisible();
    await expect(page.getByTestId("end-credits")).toContainText("서울특별시 중구 명동");

    await summary.getByRole("button", { name: "공유하기" }).click();
    await page.getByRole("button", { name: "결과 복사하기" }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    expect(shared).toBe(
      "어디까지 전봇들 챌린지 · Normal\n1문제 연속 정답 🏳️\n#전봇들 https://poledle.cupya.me/infinite",
    );
    await page.keyboard.press("Escape");

    // Region names were stored while playing; the end screen looks nothing up.
    expect(await page.evaluate(() => window.fakeNaverMaps.geocodeCount())).toBe(lookups);
  });

  await test.step("the best score is listed when picking a difficulty again", async () => {
    await page.getByRole("button", { name: "난이도 선택하기" }).click();
    await expect(page.getByRole("button", { name: /^Normal/ })).toContainText("최고 1문제");
  });
});

test("a run ends when its three minutes run out", async ({ page }) => {
  await page.goto("/infinite");
  await page.getByRole("button", { name: /^Expert/ }).click();
  await expect(page.getByRole("timer")).toBeVisible();

  await page.clock.fastForward("03:01");
  await expect(page.getByText(/시간이 다 됐어요/)).toBeVisible();
  await expect(page.getByText("0문제 연속 정답")).toBeVisible();
});
