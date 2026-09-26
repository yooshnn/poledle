import { poleNumbers } from "../data/pole-numbers";
import { modulo } from "./pole-number";
import { createRandom, shuffle } from "./random";

export type Puzzle = { date: string; number: number; code: string };

// Which number is played on which day. Both values come from build-time env (see config.ts).
export type PuzzleSchedule = { launchDate: string; seed: string };

const DAY_MS = 86_400_000;

// Today's date (YYYY-MM-DD) in Korea; a new puzzle starts at 00:00 KST.
export function koreaDate(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

// Puzzle #1 is played on the launch date; afterwards the shuffled list is walked one per day.
export function dailyPuzzle(date: string, schedule: PuzzleSchedule): Puzzle {
  const number = daysBetween(schedule.launchDate, date) + 1;
  const order = puzzleOrder(schedule.seed);
  const code = order[modulo(number - 1, order.length)];
  if (!code) throw new Error("No playable pole numbers");
  return { date, number, code };
}

// The sampled numbers (all playable, see scripts/sample-pole-numbers.ts) in a fixed
// pseudo-random order per seed.
const orderCache = new Map<string, string[]>();

function puzzleOrder(seed: string): string[] {
  let order = orderCache.get(seed);
  if (!order) {
    order = shuffle(poleNumbers, createRandom(seed));
    orderCache.set(seed, order);
  }
  return order;
}
