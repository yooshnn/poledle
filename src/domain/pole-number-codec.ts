// Compact binary storage for a set of pole numbers (order is not preserved).
//
// Each number maps to an integer below 160,000,000 (block X · block Y · square · last three
// digits). The integers are sorted and stored as gaps from the previous one in LEB128 varints,
// which takes about 2 bytes per number instead of 14 in JSON.
import { isPoleNumber } from "./pole-number";

const SQUARE_LETTERS = "ABCDEFGHPQRSWXYZ";

function toIndex(code: string): number {
  const block = Number(code.slice(0, 4)); // 0000–9999: block X and block Y digits
  const square = SQUARE_LETTERS.indexOf(code.charAt(4));
  const rest = Number(code.slice(5)); // 000–999: cell X, cell Y, pole
  return (block * SQUARE_LETTERS.length + square) * 1000 + rest;
}

function fromIndex(index: number): string {
  const rest = index % 1000;
  const square = Math.floor(index / 1000) % SQUARE_LETTERS.length;
  const block = Math.floor(index / 1000 / SQUARE_LETTERS.length);
  return (
    String(block).padStart(4, "0") + SQUARE_LETTERS.charAt(square) + String(rest).padStart(3, "0")
  );
}

export function encodePoleNumbers(codes: Iterable<string>): Uint8Array {
  const indices = [...new Set(codes)].map((code) => {
    if (!isPoleNumber(code)) throw new Error(`Unsupported pole number: ${code}`);
    return toIndex(code);
  });

  const bytes: number[] = [];
  let previous = 0;
  for (const index of indices.toSorted((a, b) => a - b)) {
    let gap = index - previous;
    previous = index;
    while (gap >= 0x80) {
      bytes.push((gap & 0x7f) | 0x80);
      gap >>>= 7;
    }
    bytes.push(gap);
  }
  return Uint8Array.from(bytes);
}

export function decodePoleNumbers(bytes: Uint8Array): string[] {
  const codes: string[] = [];
  let index = 0;
  let gap = 0;
  let shift = 0;
  for (const byte of bytes) {
    gap |= (byte & 0x7f) << shift;
    if (byte & 0x80) {
      shift += 7;
      continue;
    }
    index += gap;
    codes.push(fromIndex(index));
    gap = 0;
    shift = 0;
  }
  return codes;
}
