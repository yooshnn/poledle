import { snapToCell } from "@/domain/cell";
import { locationCode } from "@/domain/pole-number";
import { CODE_PARTS, DIGIT_COLORS } from "./digit-colors";
import type { MapView } from "./map-view";

// Characters shown: the eighth (pole sequence) cannot be read from a location.
const POSITIONS = [0, 1, 2, 3, 4, 5, 6] as const;

// The first seven characters of the pole number under the crosshair, coloured by part.
export function LocationBadge({ live, settled }: { live: MapView; settled: MapView }) {
  const code = locationCode(snapToCell(live.center));
  const settledCode = locationCode(snapToCell(settled.center));

  return (
    <div className="pointer-events-none absolute bottom-9 left-1/2 z-[1] -translate-x-1/2">
      <div className="grid justify-items-center gap-0.5 rounded-lg border border-line bg-card/95 px-3.5 py-2 shadow-[0_2px_10px_#26382d33]">
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
        지도 중앙 위치의 번호 {settledCode}
      </p>
    </div>
  );
}
