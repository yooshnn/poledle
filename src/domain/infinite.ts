import { poleNumbers } from "../data/pole-numbers";
import type { Cell } from "./cell";
import { BLOCK_SIZE, CELL_SIZE, MAX_GUESSES, SQUARE_SIZE, type Precision } from "./constants";
import { locationCode } from "./pole-number";

// Infinite mode: puzzles back to back on one clock, until a puzzle is missed or the clock runs
// out. The score is the number found.
export const INFINITE_TITLE = "어디까지 전봇들 챌린지";

export type Difficulty = "easy" | "normal" | "expert" | "superExpert";

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; goal: string; precision: Precision; showHints: boolean }
> = {
  easy: { label: "Easy", goal: "2 km 대격자", precision: BLOCK_SIZE, showHints: true },
  normal: {
    label: "Normal",
    goal: "500 m 세부 격자",
    precision: SQUARE_SIZE,
    showHints: true,
  },
  expert: {
    label: "Expert",
    goal: "50 m 세부 격자",
    precision: CELL_SIZE,
    showHints: true,
  },
  superExpert: {
    label: "Super Expert",
    goal: "힌트 없이 50 m 세부 격자",
    precision: CELL_SIZE,
    showHints: false,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "normal", "expert", "superExpert"];

export const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === "string" && value in DIFFICULTIES;

// A run starts with three minutes and shares that clock across its rounds. Reading the number
// right earns time back, up to a ceiling.
export const START_TIME_MS = 3 * 60 * 1000;
export const MAX_TIME_MS = 10 * 60 * 1000;
export const BONUS_MS = 30_000;

// What earned time in a round: the block X digits, the block Y digits, finding the puzzle.
export type BonusKind = "x" | "y" | "clear";
// Which digit bonuses a round has paid out; each is paid once per round.
export type RoundBonuses = { x: boolean; y: boolean };
export const noBonuses = (): RoundBonuses => ({ x: false, y: false });

// Time earned by one guess. The first guess of a round whose location code shares the puzzle's
// block X digits (XX) or block Y digits (YY) earns BONUS_MS each; digits count wherever the guess
// is, as they are what the player read. Finding the puzzle earns BONUS_MS plus BONUS_MS for
// every attempt left unused. Several can be earned at once.
export function roundBonus(
  code: string,
  guess: Cell,
  before: RoundBonuses,
  found: boolean,
  attemptsUsed: number,
): { ms: number; after: RoundBonuses; earned: BonusKind[] } {
  const guessed = locationCode(guess);
  const earned: BonusKind[] = [];
  const after = { ...before };
  if (!before.x && guessed.slice(0, 2) === code.slice(0, 2)) {
    after.x = true;
    earned.push("x");
  }
  if (!before.y && guessed.slice(2, 4) === code.slice(2, 4)) {
    after.y = true;
    earned.push("y");
  }
  let ms = earned.length * BONUS_MS;
  if (found) {
    earned.push("clear");
    ms += BONUS_MS + (MAX_GUESSES - attemptsUsed) * BONUS_MS;
  }
  return { ms, after, earned };
}

// Adds earned time to what is left, never past the ceiling.
export const addTime = (remainingMs: number, bonusMs: number) =>
  Math.min(MAX_TIME_MS, remainingMs + bonusMs);

// Why a run ended: six wrong guesses, the clock, or the player.
export type RunEnd = "missed" | "timeout" | "gave-up";

// A random pole number that has not come up in this run yet.
export function pickCode(played: string[], random = Math.random): string {
  const seen = new Set(played);
  const fresh = poleNumbers.filter((code) => !seen.has(code));
  const code = fresh[Math.floor(random() * fresh.length)];
  if (!code) throw new Error("Every pole number has been played");
  return code;
}
