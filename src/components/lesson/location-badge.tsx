import { useEffect, useState } from "react";
import { BLOCK_SIZE } from "@/domain/constants";
import { regionCorner, snapToCell, type Cell } from "@/domain/cell";
import { locationCode } from "@/domain/pole-number";
import { lookupRegion } from "@/map/reverse-geocode";
import { CODE_PARTS, DIGIT_COLORS } from "./digit-colors";
import type { MapView } from "./map-view";

// Characters shown: the eighth (pole sequence) cannot be read from a location.
const POSITIONS = [0, 1, 2, 3, 4, 5, 6] as const;
// Place names are looked up once the map has rested this long, and not when zoomed out so far
// that the crosshair covers several cities.
const LOOKUP_DELAY_MS = 300;
const MIN_LOOKUP_ZOOM = 9;

// The first seven characters of the pole number under the crosshair, coloured by part, and the
// place it is in.
export function LocationBadge({ live, settled }: { live: MapView; settled: MapView }) {
  const code = locationCode(snapToCell(live.center));
  const settledCode = locationCode(snapToCell(settled.center));
  const place = usePlaceName(settled);

  return (
    <div className="pointer-events-none absolute bottom-9 left-1/2 z-[1] -translate-x-1/2">
      <div className="grid min-w-[150px] justify-items-center gap-1 rounded-lg border border-line bg-card/95 px-3.5 py-2 shadow-[0_2px_10px_#26382d33]">
        <span
          aria-hidden="true"
          data-testid="lesson-place"
          className="min-h-[14px] text-[11px] leading-[14px] font-semibold whitespace-nowrap text-body"
        >
          {place}
        </span>
        <span
          aria-hidden="true"
          data-testid="lesson-code"
          className="font-mono text-[19px] leading-none font-bold tracking-[2px]"
        >
          {POSITIONS.map((position) => (
            <span key={position} style={{ color: DIGIT_COLORS[CODE_PARTS[position]] }}>
              {code[position]}
            </span>
          ))}
        </span>
      </div>
      <p role="status" className="sr-only">
        지도 중앙 {place} 위치의 번호 {settledCode}
      </p>
    </div>
  );
}

// "시·도 · 시·군·구" of the 2 km block under the centre. Looking up the block rather than the
// exact cell lets the lookup cache answer every stop within the same block.
function usePlaceName(view: MapView): string {
  const [place, setPlace] = useState("");
  const block = view.zoom >= MIN_LOOKUP_ZOOM ? blockCenterCell(snapToCell(view.center)) : null;
  // Depend on the block's values, not the object, which is recreated on every render.
  const { origin, x, y } = block ?? {};

  useEffect(() => {
    if (!origin || x === undefined || y === undefined) return;
    let active = true;
    const timer = setTimeout(() => {
      lookupRegion({ origin, x, y })
        .then((region) => {
          if (active) setPlace(region ? region.split(" ").slice(0, 2).join(" · ") : "");
        })
        // Keep the previous name when a lookup fails.
        .catch(() => {});
    }, LOOKUP_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [origin, x, y]);

  return block ? place : "";
}

function blockCenterCell(cell: Cell): Cell {
  const corner = regionCorner(cell, BLOCK_SIZE);
  const half = BLOCK_SIZE / 2;
  return { origin: corner.origin, x: corner.x + half, y: corner.y + half };
}
