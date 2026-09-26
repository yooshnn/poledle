import { BLOCK_SIZE, CELL_SIZE, REPEAT_SIZE, SQUARE_LETTER_ROWS, SQUARE_SIZE } from "./constants";
import { gridOffset, type Cell } from "./cell";
import type { Point } from "./projection";

// Only the lettered 50 m scheme is supported; the numeric 100 m scheme (5th char 1–4) is not.
// Layout: block X (2) · block Y (2) · square letter (1) · cell X (1) · cell Y (1) · pole (1)
const POLE_NUMBER = /^\d{4}[A-HPQRSWXYZ]\d{3}$/;

// Square letters indexed [row from south][column from west].
const SQUARE_GRID = SQUARE_LETTER_ROWS.toReversed();

export function isPoleNumber(code: string): boolean {
  return POLE_NUMBER.test(code);
}

// Offset (metres) of the numbered 50 m cell from the grid base, within one 200 km repeat.
export function parsePoleNumber(code: string): Point {
  if (!isPoleNumber(code)) throw new Error(`Unsupported pole number: ${code}`);

  const blockX = Number(code.slice(0, 2));
  const blockY = Number(code.slice(2, 4));
  const square = squarePosition(code.charAt(4));
  const cellX = Number(code.charAt(5));
  const cellY = Number(code.charAt(6));

  return {
    x: blockX * BLOCK_SIZE + square.column * SQUARE_SIZE + cellX * CELL_SIZE,
    y: blockY * BLOCK_SIZE + square.row * SQUARE_SIZE + cellY * CELL_SIZE,
  };
}

// The first seven characters of the pole number that would be printed in this cell.
// The eighth (pole sequence) cannot be derived from a location.
export function locationCode(cell: Cell): string {
  const offset = gridOffset(cell);
  const x = modulo(offset.x, REPEAT_SIZE);
  const y = modulo(offset.y, REPEAT_SIZE);

  const block = twoDigits(x / BLOCK_SIZE) + twoDigits(y / BLOCK_SIZE);
  const letter = squareLetter(
    Math.floor((x % BLOCK_SIZE) / SQUARE_SIZE),
    Math.floor((y % BLOCK_SIZE) / SQUARE_SIZE),
  );
  const cellDigits =
    String(Math.floor((x % SQUARE_SIZE) / CELL_SIZE)) +
    String(Math.floor((y % SQUARE_SIZE) / CELL_SIZE));

  return block + letter + cellDigits;
}

export function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function squarePosition(letter: string): { column: number; row: number } {
  const row = SQUARE_GRID.findIndex((letters) => letters.includes(letter));
  return { column: SQUARE_GRID[row]?.indexOf(letter) ?? -1, row };
}

function squareLetter(column: number, row: number): string {
  return SQUARE_GRID[row]?.charAt(column) ?? "?";
}

function twoDigits(value: number): string {
  return String(Math.floor(value)).padStart(2, "0");
}
