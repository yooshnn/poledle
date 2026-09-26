// Sizes of the KEPCO pole numbering grid, in metres.
// A number such as 0311Z961 reads as: 2 km block (0311) → 500 m square (Z) → 50 m cell (96) → pole (1).
export const CELL_SIZE = 50;
export const SQUARE_SIZE = 500;
export const BLOCK_SIZE = 2_000;
// How precisely a guess must match: the 50 m cell, the 500 m square or the 2 km block.
export type Precision = typeof CELL_SIZE | typeof SQUARE_SIZE | typeof BLOCK_SIZE;
// Characters of the pole number that each grid level pins down.
export const CODE_DIGITS: Record<Precision, number> = { 50: 7, 500: 5, 2_000: 4 };

// Block numbers are two digits per axis, so the whole grid repeats every 100 blocks.
export const REPEAT_SIZE = 200_000;

// Letters of the sixteen 500 m squares inside a 2 km block, listed north to south, west to east.
export const SQUARE_LETTER_ROWS = ["ABEF", "CDGH", "PQWX", "RSYZ"] as const;

export const MAX_GUESSES = 6;
