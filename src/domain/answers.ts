import korea from "../data/korea.json" with { type: "json" };
import { REPEAT_SIZE } from "./constants";
import { cellCenter, type Cell } from "./cell";
import { parsePoleNumber } from "./pole-number";
import { gridBase, originAt, type LngLat, type Origin } from "./projection";

// The numbering repeats every 200 km, so a single number maps to several cells across Korea.
// These shifts cover the peninsula and Jeju from each zone's grid base.
const REPEAT_SHIFTS_X = [-REPEAT_SIZE, 0, REPEAT_SIZE];
const REPEAT_SHIFTS_Y = [0, -REPEAT_SIZE, -2 * REPEAT_SIZE];
const ORIGINS: Origin[] = ["middle", "east"];

// Every land cell that carries this pole number. Any of them counts as a correct guess.
export function answerCells(code: string): Cell[] {
  const offset = parsePoleNumber(code);
  const cells: Cell[] = [];

  for (const origin of ORIGINS) {
    const base = gridBase(origin);
    for (const shiftX of REPEAT_SHIFTS_X) {
      for (const shiftY of REPEAT_SHIFTS_Y) {
        const cell = { origin, x: base.x + offset.x + shiftX, y: base.y + offset.y + shiftY };
        const center = cellCenter(cell);
        // Each zone only numbers its own side of the 128°E boundary.
        if (originAt(center.lng) === origin && isOnLand(center)) cells.push(cell);
      }
    }
  }
  return cells;
}

// Natural Earth 1:10m South Korea outline: generalized, so some coastal cells and islets are off.
type Ring = number[][];
const LAND_POLYGONS = korea.coordinates as Ring[][];

export function isOnLand(point: LngLat): boolean {
  return LAND_POLYGONS.some(([outer, ...holes]) => {
    if (!outer || !isInsideRing(point, outer)) return false;
    return !holes.some((hole) => isInsideRing(point, hole));
  });
}

// Ray casting point-in-polygon test.
function isInsideRing({ lng, lat }: LngLat, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi = 0, yi = 0] = ring[i] ?? [];
    const [xj = 0, yj = 0] = ring[j] ?? [];
    const crosses = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}
