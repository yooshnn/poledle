import { BLOCK_SIZE, MAX_GUESSES, type Precision } from "./constants";
import { cellCenter, sameRegion, type Cell } from "./cell";
import { locationCode } from "./pole-number";
import type { LngLat } from "./projection";

export type GameStatus = "playing" | "won" | "lost";

// What a puzzle asks for: any of the answer cells, matched down to the given grid level.
// Guesses are always the 50 m cell the player picked; a coarser precision only widens the match.
export type Target = { answers: Cell[]; precision: Precision };

export function gameStatus(guesses: Cell[], target: Target): GameStatus {
  if (guesses.some((guess) => isCorrect(guess, target))) return "won";
  return guesses.length >= MAX_GUESSES ? "lost" : "playing";
}

export function isCorrect(guess: Cell, { answers, precision }: Target): boolean {
  return answers.some((answer) => sameRegion(answer, guess, precision));
}

export type GuessResult =
  | { ok: true; guesses: Cell[] }
  | { ok: false; reason: "game-over" | "already-guessed" };

export function addGuess(guesses: Cell[], cell: Cell, target: Target): GuessResult {
  if (gameStatus(guesses, target) !== "playing") return { ok: false, reason: "game-over" };
  // Two picks in the same grid square are the same guess.
  if (guesses.some((guess) => sameRegion(guess, cell, target.precision)))
    return { ok: false, reason: "already-guessed" };
  return { ok: true, guesses: [...guesses, cell] };
}

export type Direction = "북" | "북동" | "동" | "남동" | "남" | "남서" | "서" | "북서";
const DIRECTIONS: Direction[] = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];

// Compass direction from the guess to the closest answer cell.
export function directionToNearestAnswer(guess: Cell, answers: Cell[]): Direction {
  const from = cellCenter(guess);
  const nearest = answers
    .map((answer) => cellCenter(answer))
    .map((to) => ({ to, meters: greatCircleMeters(from, to) }))
    .toSorted((a, b) => a.meters - b.meters)[0];
  if (!nearest) throw new Error("A puzzle always has at least one answer");

  const sector = Math.round(bearingDegrees(from, nearest.to) / 45);
  return DIRECTIONS[(sector + 8) % 8] ?? "북";
}

// Map label for a hint square: the pole number prefix shared by every cell inside it.
// The 2 km block digits stay hidden ("??") unless a guess landed in that block, or late in
// the game: X digits from the fifth attempt, Y digits from the sixth.
export function hintLabel(square: Cell, size: 50 | 500 | 2000, guesses: Cell[]): string {
  const code = locationCode(square);
  const guessedHere = guesses.some((guess) => sameRegion(guess, square, BLOCK_SIZE));
  const blockX = guessedHere || guesses.length >= 4 ? code.slice(0, 2) : "??";
  const blockY = guessedHere || guesses.length >= 5 ? code.slice(2, 4) : "??";
  const visibleLength = { 2000: 4, 500: 5, 50: 7 }[size];
  return blockX + blockY + code.slice(4, visibleLength);
}

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

function greatCircleMeters(from: LngLat, to: LngLat): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, a)));
}

function bearingDegrees(from: LngLat, to: LngLat): number {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}
