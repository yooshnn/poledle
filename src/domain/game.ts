import { BLOCK_SIZE, MAX_GUESSES, SQUARE_SIZE } from "./constants";
import { cellCenter, sameCell, sameRegion, type Cell } from "./cell";
import type { Puzzle } from "./daily";
import { locationCode } from "./pole-number";
import type { LngLat } from "./projection";

export type GameStatus = "playing" | "won" | "lost";

export function gameStatus(guesses: Cell[], answers: Cell[]): GameStatus {
  if (guesses.some((guess) => isCorrect(guess, answers))) return "won";
  return guesses.length >= MAX_GUESSES ? "lost" : "playing";
}

export function isCorrect(guess: Cell, answers: Cell[]): boolean {
  return answers.some((answer) => sameCell(answer, guess));
}

export type GuessResult =
  | { ok: true; guesses: Cell[] }
  | { ok: false; reason: "game-over" | "already-guessed" };

export function addGuess(guesses: Cell[], cell: Cell, answers: Cell[]): GuessResult {
  if (gameStatus(guesses, answers) !== "playing") return { ok: false, reason: "game-over" };
  if (guesses.some((guess) => sameCell(guess, cell)))
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

// Spoiler-free result: one row per guess, closest grid level reached.
export function shareText(puzzle: Puzzle, guesses: Cell[], answers: Cell[]): string {
  const status = gameStatus(guesses, answers);
  const rows: string[] = guesses.map((guess) => {
    if (isCorrect(guess, answers)) return "🟩";
    if (answers.some((answer) => sameRegion(guess, answer, SQUARE_SIZE))) return "🟨";
    if (answers.some((answer) => sameRegion(guess, answer, BLOCK_SIZE))) return "🟥";
    return "⬛";
  });
  if (status === "won") rows.push(...Array<string>(MAX_GUESSES - rows.length).fill("🟩"));

  const score = status === "won" ? guesses.length : "X";
  return `전봇들 #${puzzle.number} · ${puzzle.date}\n${score}/${MAX_GUESSES}\n\n${rows.join("\n")}`;
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
