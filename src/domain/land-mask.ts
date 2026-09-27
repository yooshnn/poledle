import { BLOCK_SIZE, SQUARE_SIZE } from "./constants";
import { gridOffset, type Cell } from "./cell";
import { modulo } from "./pole-number";
import type { Origin } from "./projection";

// Which 500 m squares of the pole number grid touch South Korean land, per TM zone.
//
// Squares are indexed on each zone's grid (the same squares a pole number's letter names), so a
// cell is looked up by integer division. Most 2 km blocks are all land or all sea, so the mask
// stores a 2-bit state per block and a 16-bit square mask only for blocks that are mixed.
//
// Binary layout (little-endian):
//   "LAND" · version u8 · zone count u8
//   per zone: origin u8 (0 middle, 1 east) · west i16 · south i16 · columns u16 · rows u16
//             (block indices from the zone's grid base) · mixed count u32
//             · block states, 2 bits each, row by row from the south-west
//             · one u16 per mixed block, in the same order: bit (row · 4 + column) of its
//               squares, rows from the south, columns from the west
export type LandZone = {
  origin: Origin;
  west: number;
  south: number;
  columns: number;
  rows: number;
  // Per block: SEA, LAND or MIXED.
  states: Uint8Array;
  // Square bits of mixed blocks, keyed by block index (row · columns + column).
  squares: Map<number, number>;
};

export const SEA = 0;
export const LAND = 1;
export const MIXED = 2;

const MAGIC = "LAND";
const VERSION = 1;
const SQUARES_PER_BLOCK = BLOCK_SIZE / SQUARE_SIZE;
const ORIGINS: Origin[] = ["middle", "east"];

// Whether the 500 m square containing the cell has any land. Unknown areas count as sea.
export function hasLand(zones: readonly LandZone[], cell: Cell): boolean {
  const zone = zones.find((candidate) => candidate.origin === cell.origin);
  if (!zone) return false;
  const offset = gridOffset(cell);
  const squareX = Math.floor(offset.x / SQUARE_SIZE);
  const squareY = Math.floor(offset.y / SQUARE_SIZE);
  const column = Math.floor(squareX / SQUARES_PER_BLOCK) - zone.west;
  const row = Math.floor(squareY / SQUARES_PER_BLOCK) - zone.south;
  if (column < 0 || row < 0 || column >= zone.columns || row >= zone.rows) return false;

  const block = row * zone.columns + column;
  const state = zone.states[block];
  if (state !== MIXED) return state === LAND;
  const bit =
    modulo(squareY, SQUARES_PER_BLOCK) * SQUARES_PER_BLOCK + modulo(squareX, SQUARES_PER_BLOCK);
  return ((zone.squares.get(block) ?? 0) & (1 << bit)) !== 0;
}

export function encodeLandMask(zones: readonly LandZone[]): Uint8Array {
  const parts: Uint8Array[] = [
    new TextEncoder().encode(MAGIC),
    Uint8Array.of(VERSION, zones.length),
  ];
  for (const zone of zones) {
    const blocks = zone.columns * zone.rows;
    const mixed = [...zone.squares.keys()].toSorted((a, b) => a - b);
    const header = new DataView(new ArrayBuffer(13));
    header.setUint8(0, ORIGINS.indexOf(zone.origin));
    header.setInt16(1, zone.west, true);
    header.setInt16(3, zone.south, true);
    header.setUint16(5, zone.columns, true);
    header.setUint16(7, zone.rows, true);
    header.setUint32(9, mixed.length, true);
    parts.push(new Uint8Array(header.buffer));

    const states = new Uint8Array(Math.ceil(blocks / 4));
    for (let block = 0; block < blocks; block++) {
      const byte = states[block >> 2] ?? 0;
      states[block >> 2] = byte | ((zone.states[block] ?? SEA) << ((block & 3) * 2));
    }
    parts.push(states);

    const squares = new DataView(new ArrayBuffer(mixed.length * 2));
    mixed.forEach((block, index) =>
      squares.setUint16(index * 2, zone.squares.get(block) ?? 0, true),
    );
    parts.push(new Uint8Array(squares.buffer));
  }
  return concat(parts);
}

export function decodeLandMask(bytes: Uint8Array): LandZone[] {
  if (new TextDecoder().decode(bytes.subarray(0, 4)) !== MAGIC) throw new Error("Not a land mask");
  if (bytes[4] !== VERSION) throw new Error(`Unsupported land mask version ${bytes[4]}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const zones: LandZone[] = [];
  let at = 6;
  for (let index = 0; index < (bytes[5] ?? 0); index++) {
    const origin = ORIGINS[view.getUint8(at)];
    if (!origin) throw new Error("Unknown zone in land mask");
    const west = view.getInt16(at + 1, true);
    const south = view.getInt16(at + 3, true);
    const columns = view.getUint16(at + 5, true);
    const rows = view.getUint16(at + 7, true);
    const mixedCount = view.getUint32(at + 9, true);
    at += 13;

    const blocks = columns * rows;
    const states = new Uint8Array(blocks);
    for (let block = 0; block < blocks; block++) {
      states[block] = ((bytes[at + (block >> 2)] ?? 0) >> ((block & 3) * 2)) & 3;
    }
    at += Math.ceil(blocks / 4);

    const squares = new Map<number, number>();
    let next = 0;
    for (let block = 0; block < blocks && squares.size < mixedCount; block++) {
      if (states[block] !== MIXED) continue;
      squares.set(block, view.getUint16(at + next * 2, true));
      next++;
    }
    at += mixedCount * 2;
    zones.push({ origin, west, south, columns, rows, states, squares });
  }
  return zones;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
