import { describe, expect, test } from "vitest";
import type { Cell } from "./cell";
import { addTime, BONUS_MS, MAX_TIME_MS, noBonuses, roundBonus } from "./infinite";
import { parsePoleNumber } from "./pole-number";
import { gridBase, type Origin } from "./projection";

const CODE = "0311Z961";
// The cell a pole number names, measured from the given zone's grid base.
function cellFor(code: string, origin: Origin = "middle"): Cell {
  const offset = parsePoleNumber(code);
  const base = gridBase(origin);
  return { origin, x: base.x + offset.x, y: base.y + offset.y };
}

describe("Infinite time bonuses", () => {
  test("finding the puzzle on the first attempt earns 240 s, on the last 90 s", () => {
    const answer = cellFor(CODE);
    expect(roundBonus(CODE, answer, noBonuses(), true, 1).ms).toBe(8 * BONUS_MS);
    expect(roundBonus(CODE, answer, { x: true, y: true }, true, 6).ms).toBe(BONUS_MS);
    expect(roundBonus(CODE, answer, noBonuses(), true, 6).ms).toBe(3 * BONUS_MS);
  });

  test("block digits pay once per round, wherever the guess is", () => {
    // Same X digits read in the east zone: the digits, not the place, earn the time.
    const sameX = roundBonus(CODE, cellFor("0350A001", "east"), noBonuses(), false, 1);
    expect(sameX.earned).toEqual([{ kind: "x", ms: BONUS_MS }]);
    expect(roundBonus(CODE, cellFor("0311A001"), sameX.after, false, 2).earned).toEqual([
      { kind: "y", ms: BONUS_MS },
    ]);
    expect(roundBonus(CODE, cellFor("0311A001"), { x: true, y: true }, false, 3).ms).toBe(0);
  });

  test("time never goes past the ceiling", () => {
    expect(addTime(MAX_TIME_MS - 10_000, 8 * BONUS_MS)).toBe(MAX_TIME_MS);
    expect(addTime(60_000, BONUS_MS)).toBe(90_000);
  });
});
