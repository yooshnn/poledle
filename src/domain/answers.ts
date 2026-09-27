import { landMask } from "../data/land-mask";
import { REPEAT_SIZE } from "./constants";
import { cellCenter, type Cell } from "./cell";
import { hasLand } from "./land-mask";
import { parsePoleNumber } from "./pole-number";
import { gridBase, originAt, type Origin } from "./projection";

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
        if (originAt(center.lng) === origin && hasLand(landMask, cell)) cells.push(cell);
      }
    }
  }
  return cells;
}
