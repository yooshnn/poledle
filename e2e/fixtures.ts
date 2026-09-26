import { readFileSync } from "node:fs";
import { test as base, expect, type Page } from "@playwright/test";
import { answerCells } from "../src/domain/answers";
import { cellCenter, type Cell } from "../src/domain/cell";

const FAKE_SDK = readFileSync(new URL("./fake-naver-maps.js", import.meta.url), "utf8");

// 2026-09-28 12:00 KST: puzzle #3 with the default schedule.
export const START_TIME = new Date("2026-09-28T03:00:00Z");

// Drives the game the way a player would, through the fake map.
export class Player {
  constructor(private readonly page: Page) {}

  async puzzleCode(): Promise<string> {
    return (await this.page.getByTestId("pole-code").textContent()) ?? "";
  }

  // All cells that count as a correct answer for today's number.
  async answers(): Promise<Cell[]> {
    return answerCells(await this.puzzleCode());
  }

  // The map mounts after the SDK script loads.
  async mapReady() {
    await this.page.getByTestId("fake-map-layer").first().waitFor({ state: "attached" });
  }

  async clickMap(cell: Cell) {
    await this.mapReady();
    await this.page.evaluate(
      (point) => window.fakeNaverMaps.click(point.lat, point.lng),
      cellCenter(cell),
    );
  }

  async panTo(cell: Cell) {
    await this.mapReady();
    await this.page.evaluate(
      (point) => window.fakeNaverMaps.panTo(point.lat, point.lng),
      cellCenter(cell),
    );
  }

  async zoomTo(level: number) {
    await this.mapReady();
    await this.page.evaluate((target) => window.fakeNaverMaps.zoomTo(target), level);
  }

  async guess(cell: Cell) {
    await this.zoomTo(16);
    await this.clickMap(cell);
    await this.page.getByRole("button", { name: "제출하기" }).click();
  }

  async giveUp() {
    await this.page.getByRole("button", { name: "포기하기" }).click();
    await this.page.getByRole("button", { name: "판 끝내기" }).click();
  }
}

export const test = base.extend<{ player: Player }>({
  page: async ({ page }, use) => {
    await page.route("https://oapi.map.naver.com/**", (route) =>
      route.fulfill({ contentType: "text/javascript", body: FAKE_SDK }),
    );
    // Keep tests hermetic: the web font is not needed to play.
    await page.route("https://cdn.jsdelivr.net/**", (route) => route.abort());
    await page.clock.install({ time: START_TIME });
    await use(page);
  },
  player: async ({ page }, use) => {
    await use(new Player(page));
  },
});

export { expect };

declare global {
  interface Window {
    fakeNaverMaps: {
      zoom(): number;
      zoomTo(zoom: number): void;
      panTo(lat: number, lng: number): void;
      click(lat: number, lng: number): void;
      geocodeCount(): number;
      failAuthentication(): void;
    };
  }
}
