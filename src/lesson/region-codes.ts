import { snapToCell } from "@/domain/cell";
import { locationCode } from "@/domain/pole-number";
import { originAt, type LngLat, type Origin } from "@/domain/projection";
import type { Bounds, Region } from "./regions";

// Pole number digits a region spans, per TM zone (regions on 128°E have one entry for each).
export type ZoneRange = { origin: Origin; x: string; y: string };

export type RegionCodes = {
  ranges: ZoneRange[];
  // First four digits at the centre of the region's bounds.
  representative: string;
};

// About 1 km, half a 2 km block: fine enough not to skip a block at the edge of a range.
const SAMPLE_STEP_DEGREES = 0.009;

export function regionCenter({ south, north, west, east }: Bounds): LngLat {
  return { lng: (west + east) / 2, lat: (south + north) / 2 };
}

export function regionCodes(region: Region): RegionCodes {
  const { south, north, west, east } = region.bounds;
  const blocks = new Map<Origin, { x: Set<number>; y: Set<number> }>();

  for (let lat = south; lat <= north + 1e-9; lat += SAMPLE_STEP_DEGREES) {
    for (let lng = west; lng <= east + 1e-9; lng += SAMPLE_STEP_DEGREES) {
      const origin = originAt(lng);
      const code = locationCode(snapToCell({ lng, lat }));
      let zone = blocks.get(origin);
      if (!zone) blocks.set(origin, (zone = { x: new Set(), y: new Set() }));
      zone.x.add(Number(code.slice(0, 2)));
      zone.y.add(Number(code.slice(2, 4)));
    }
  }

  const ranges = (["middle", "east"] as const).flatMap((origin) => {
    const zone = blocks.get(origin);
    return zone ? [{ origin, x: circularRange(zone.x), y: circularRange(zone.y) }] : [];
  });
  return {
    ranges,
    representative: locationCode(snapToCell(regionCenter(region.bounds))).slice(0, 4),
  };
}

// Block numbers run 00–99 and wrap, so a range is read around the circle: the largest gap
// between present values is where the range is open. {98, 99, 0, 1} → "98–99, 00–01".
export function circularRange(values: Iterable<number>): string {
  const sorted = [...new Set(values)].toSorted((a, b) => a - b);
  const first = sorted[0];
  if (first === undefined) return "";
  if (sorted.length === 1) return twoDigits(first);

  let gapEnd = 0;
  let widest = -1;
  sorted.forEach((value, index) => {
    const next = sorted[(index + 1) % sorted.length] ?? first;
    const gap = (next - value + 100) % 100;
    if (gap > widest) {
      widest = gap;
      gapEnd = (index + 1) % sorted.length;
    }
  });

  const low = sorted[gapEnd] ?? first;
  const high = sorted[(gapEnd - 1 + sorted.length) % sorted.length] ?? first;
  if (low <= high) return span(low, high);
  return `${span(low, 99)}, ${span(0, high)}`;
}

function span(low: number, high: number): string {
  return low === high ? twoDigits(low) : `${twoDigits(low)}–${twoDigits(high)}`;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}
