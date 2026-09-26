import { describe, expect, test } from "vitest";
import { poleNumbers } from "../data/pole-numbers";
import { answerCells, isOnLand } from "./answers";
import { cellCenter, cellKey, snapToCell, type Cell } from "./cell";
import { dailyPuzzle, koreaDate } from "./daily";
import { hintLabel } from "./game";
import { dailyShareText } from "./share";
import { locationCode, parsePoleNumber } from "./pole-number";
import { gridBase, toTM } from "./projection";

// 0311Z961 from docs/pole-grid-background.md, placed in the middle zone.
const documented: Cell = {
  origin: "middle",
  x: gridBase("middle").x + 7950,
  y: gridBase("middle").y + 22300,
};

describe("pole number grid", () => {
  test("matches the documented example and projection constants", () => {
    expect(parsePoleNumber("0311Z961")).toEqual({ x: 7950, y: 22300 });
    expect(locationCode(documented)).toBe("0311Z96");

    const origin = toTM({ lng: 127, lat: 38 }, "middle");
    expect(origin.x).toBeCloseTo(200_000, 3);
    expect(origin.y).toBeCloseTo(600_000, 3);

    expect(isOnLand({ lng: 126.978, lat: 37.566 })).toBe(true); // Seoul
    expect(isOnLand({ lng: 126.53, lat: 33.38 })).toBe(true); // Jeju
    expect(isOnLand({ lng: 125, lat: 35 })).toBe(false); // Yellow Sea
  });

  test("every sampled pole number is playable and its answers round-trip through the map", () => {
    const problems: string[] = [];
    for (const code of poleNumbers) {
      const cells = answerCells(code);
      if (cells.length === 0) problems.push(`${code}: no land answer`);
      for (const cell of cells) {
        const roundTrips = cellKey(snapToCell(cellCenter(cell))) === cellKey(cell);
        if (!roundTrips) problems.push(`${code}: snap mismatch`);
        if (locationCode(cell) !== code.slice(0, 7)) problems.push(`${code}: location code`);
      }
    }
    expect(problems).toEqual([]);
  }, 30_000);
});

describe("daily puzzle", () => {
  const schedule = { launchDate: "2026-09-26", seed: "test" };

  test("changes at KST midnight and is numbered from the launch date", () => {
    expect(koreaDate(new Date("2026-09-26T14:59:59Z"))).toBe("2026-09-26");
    expect(koreaDate(new Date("2026-09-26T15:00:00Z"))).toBe("2026-09-27");

    const first = dailyPuzzle("2026-09-26", schedule);
    const second = dailyPuzzle("2026-09-27", schedule);
    expect(first.number).toBe(1);
    expect(second.number).toBe(2);
    expect(second.code).not.toBe(first.code);
    expect(dailyPuzzle("2026-09-26", schedule)).toEqual(first);
    expect(dailyPuzzle("2026-09-26", { ...schedule, seed: "other" }).code).not.toBe(first.code);
  });
});

describe("hints and sharing", () => {
  test("hint labels reveal block digits only where guessed, or late in the game", () => {
    expect(hintLabel(documented, 2000, [])).toBe("????");
    expect(hintLabel(documented, 50, [])).toBe("????Z96");
    expect(hintLabel(documented, 500, [documented])).toBe("0311Z");

    const elsewhere = (n: number): Cell => ({ ...documented, x: documented.x + 2000 * n });
    const misses = [1, 2, 3, 4, 5].map(elsewhere);
    expect(hintLabel(documented, 2000, misses.slice(0, 3))).toBe("????");
    expect(hintLabel(documented, 2000, misses.slice(0, 4))).toBe("03??");
    expect(hintLabel(documented, 2000, misses)).toBe("0311");
  });

  test("share text ranks each guess by grid level and never includes the answer", () => {
    const puzzle = { date: "2026-09-26", number: 1, code: "0311Z961" };
    const guesses: Cell[] = [
      { ...documented, x: documented.x - 2000 }, // other block
      { ...documented, x: documented.x - 500 }, // same block
      { ...documented, x: documented.x - 50 }, // same 500 m square
      documented,
    ];
    const text = dailyShareText(puzzle, guesses, [documented], 5);

    expect(text.split("\n")).toEqual([
      "전봇들 #1 4/6 🔥5일",
      "",
      "⬛",
      "🟥",
      "🟨",
      "🟩",
      "🟩",
      "🟩",
      "",
      "#전봇들 https://poledle.cupya.me",
    ]);
    expect(text).not.toContain("0311");
  });
});
