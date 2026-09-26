import { poleNumbers } from "../data/pole-numbers";
import { BLOCK_SIZE, CELL_SIZE, SQUARE_SIZE, type Precision } from "./constants";

// Infinite mode: puzzles back to back until one is missed. The score is the number found.
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

// Each round has three minutes of wall-clock time from the moment it starts, so leaving the
// page does not stop the clock.
export const ROUND_TIME_MS = 3 * 60 * 1000;

export const roundDeadline = (startedAt: number) => startedAt + ROUND_TIME_MS;

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

// Spoiler-free: the difficulty and the score only.
export function infiniteShareText(difficulty: Difficulty, score: number): string {
  return `전봇들 Infinite · ${DIFFICULTIES[difficulty].label}\n${score}문제 연속 정답`;
}
