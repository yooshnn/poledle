import { CELL_SIZE } from "./constants";
import {
  gridBase,
  originAt,
  toLngLat,
  toTM,
  type LngLat,
  type Origin,
  type Point,
} from "./projection";

// A 50 m grid cell, identified by the TM coordinates (metres) of its south-west corner.
export type Cell = { origin: Origin; x: number; y: number };

// Map bounds a guess may fall in; generous enough for coasts and islands.
const PLAYABLE_BOUNDS = { west: 122, east: 135, south: 31, north: 41 };

export function cellKey({ origin, x, y }: Cell): string {
  return `${origin}:${x}:${y}`;
}

export function sameCell(a: Cell, b: Cell): boolean {
  return cellKey(a) === cellKey(b);
}

// Offset of the cell from its zone's grid base point, in metres.
export function gridOffset(cell: Cell): Point {
  const base = gridBase(cell.origin);
  return { x: cell.x - base.x, y: cell.y - base.y };
}

// Whether two cells lie in the same grid square of the given size (50 m, 500 m, 2 km …).
export function sameRegion(a: Cell, b: Cell, size: number): boolean {
  if (a.origin !== b.origin) return false;
  const offsetA = gridOffset(a);
  const offsetB = gridOffset(b);
  return (
    Math.floor(offsetA.x / size) === Math.floor(offsetB.x / size) &&
    Math.floor(offsetA.y / size) === Math.floor(offsetB.y / size)
  );
}

// South-west corner of the grid square of the given size that contains the cell.
export function regionCorner(cell: Cell, size: number): Cell {
  const base = gridBase(cell.origin);
  return {
    origin: cell.origin,
    x: base.x + Math.floor((cell.x - base.x) / size) * size,
    y: base.y + Math.floor((cell.y - base.y) / size) * size,
  };
}

// Whether the grid square of `size` metres at this corner is numbered by its own zone: each zone
// only numbers its side of the 128°E boundary.
export function inOwnZone(corner: Cell, size: number): boolean {
  const { lng } = toLngLat({ x: corner.x + size / 2, y: corner.y + size / 2 }, corner.origin);
  return originAt(lng) === corner.origin;
}

export function snapToCell(position: LngLat): Cell {
  const origin = originAt(position.lng);
  const base = gridBase(origin);
  const tm = toTM(position, origin);
  return {
    origin,
    x: base.x + Math.floor((tm.x - base.x) / CELL_SIZE) * CELL_SIZE,
    y: base.y + Math.floor((tm.y - base.y) / CELL_SIZE) * CELL_SIZE,
  };
}

export function cellCenter(cell: Cell): LngLat {
  return toLngLat({ x: cell.x + CELL_SIZE / 2, y: cell.y + CELL_SIZE / 2 }, cell.origin);
}

// Corners of the square of `size` metres whose south-west corner is the cell: SW, SE, NE, NW.
export function cellCorners(cell: Cell, size = CELL_SIZE): LngLat[] {
  const { origin, x, y } = cell;
  return [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
  ].map((corner) => toLngLat(corner, origin));
}

// Guards data read back from storage.
export function isValidCell(value: unknown): value is Cell {
  if (typeof value !== "object" || value === null) return false;
  const { origin, x, y } = value as Record<string, unknown>;
  if (origin !== "middle" && origin !== "east") return false;
  if (typeof x !== "number" || typeof y !== "number") return false;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

  const cell: Cell = { origin, x, y };
  const offset = gridOffset(cell);
  if (offset.x % CELL_SIZE !== 0 || offset.y % CELL_SIZE !== 0) return false;

  const { lng, lat } = cellCenter(cell);
  const { west, east, south, north } = PLAYABLE_BOUNDS;
  return lng >= west && lng <= east && lat >= south && lat <= north;
}
