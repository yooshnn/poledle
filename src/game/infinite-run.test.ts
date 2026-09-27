import { describe, expect, test } from "vitest";
import { answerCells } from "../domain/answers";
import type { Cell } from "../domain/cell";
import { BONUS_MS, MAX_TIME_MS, START_TIME_MS } from "../domain/infinite";
import type { Target } from "../domain/game";
import {
  activeRun,
  emptyInfiniteRecord,
  guessInRun,
  nextRound,
  openRun,
  parseInfiniteRecord,
  remainingAt,
  startRun,
  suspendRun,
  type InfiniteRecord,
} from "./infinite-run";

const T0 = 1_000_000;
const SECOND = 1000;

// The current puzzle's target and one of its answers.
function currentRound(record: InfiniteRecord): { target: Target; answer: Cell } {
  const answers = answerCells(activeRun(record)?.round.code ?? "");
  const answer = answers[0];
  if (!answer) throw new Error("no answer");
  return { target: { answers, precision: 50 }, answer };
}

function started() {
  const record = startRun(emptyInfiniteRecord(), "expert", T0);
  return { record, ...currentRound(record) };
}

const clockOf = (record: InfiniteRecord) => {
  const run = activeRun(record);
  if (!run) throw new Error("no run");
  return run.clock;
};

describe("Infinite run clock", () => {
  test("a run starts with three minutes that keep running", () => {
    const { record } = started();
    expect(remainingAt(clockOf(record), T0 + 60 * SECOND)).toBe(START_TIME_MS - 60 * SECOND);
  });

  test("suspending stops the clock and resuming picks it up where it stopped", () => {
    const { record } = started();
    const suspended = suspendRun(record, T0 + 10 * SECOND);
    const resumed = openRun(suspended, "expert", T0 + 3600 * SECOND);
    expect(remainingAt(clockOf(resumed), T0 + 3600 * SECOND)).toBe(START_TIME_MS - 10 * SECOND);
  });

  test("finding the puzzle adds its time and stops the clock until the next one", () => {
    const { record, target, answer } = started();
    const result = guessInRun(record, answer, target, T0 + 20 * SECOND);
    if (!result.ok) throw new Error(result.reason);
    expect(result.earned).toEqual(["x", "y", "clear"]);

    const afterFind = START_TIME_MS - 20 * SECOND + 8 * BONUS_MS;
    expect(remainingAt(clockOf(result.record), T0 + 999 * SECOND)).toBe(afterFind);
    // Leaving and coming back while the found puzzle is on screen keeps the clock stopped.
    const back = openRun(suspendRun(result.record, T0 + 30 * SECOND), "expert", T0 + 99 * SECOND);
    expect(remainingAt(clockOf(back), T0 + 999 * SECOND)).toBe(afterFind);

    const next = nextRound(result.record, T0 + 100 * SECOND);
    expect(remainingAt(clockOf(next), T0 + 110 * SECOND)).toBe(afterFind - 10 * SECOND);
  });

  test("time never goes past ten minutes", () => {
    let record = startRun(emptyInfiniteRecord(), "expert", T0);
    for (let round = 0; round < 4; round++) {
      const { target, answer } = currentRound(record);
      const result = guessInRun(record, answer, target, T0);
      if (!result.ok) throw new Error(result.reason);
      record = nextRound(result.record, T0);
    }
    expect(remainingAt(clockOf(record), T0)).toBe(MAX_TIME_MS);
  });

  test("stored records from other versions are dropped", () => {
    const { record } = started();
    const stored = JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
    expect(parseInfiniteRecord(stored)).toEqual(record);
    expect(parseInfiniteRecord({ ...stored, version: undefined })).toEqual(emptyInfiniteRecord());
    expect(parseInfiniteRecord({ ...stored, version: 1 })).toEqual(emptyInfiniteRecord());
  });
});
