import type { PuzzleSchedule } from "./domain/daily";

// Defaults; override per environment with VITE_* variables (e.g. in .env.local).
const DEFAULT_LAUNCH_DATE = "2026-09-26";
const DEFAULT_PUZZLE_SEED = "poledle";

export const puzzleSchedule: PuzzleSchedule = {
  launchDate: validDate(import.meta.env.VITE_LAUNCH_DATE ?? DEFAULT_LAUNCH_DATE),
  seed: import.meta.env.VITE_PUZZLE_SEED ?? DEFAULT_PUZZLE_SEED,
};

function validDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("VITE_LAUNCH_DATE must be YYYY-MM-DD");
  return date;
}
