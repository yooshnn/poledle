import { useMemo, type CSSProperties } from "react";
import { BLOCK_SIZE, GRID_ZOOM } from "@/domain/constants";
import { snapToCell } from "@/domain/cell";
import { locationCode } from "@/domain/pole-number";
import { originAt, toLngLat, toTM } from "@/domain/projection";
import {
  buildRuler,
  type Axis,
  type Ruler,
  type RulerLevel,
  type RulerSample,
  type RulerTier,
} from "@/lesson/ruler";
import { cn } from "@/lib/utils";
import { DIGIT_COLORS } from "./digit-colors";
import type { MapView } from "./map-view";

export const TIER_PX = 17;
const SAMPLE_PX = 2;
// Room for three characters: a tier of the vertical ruler holds labels such as "07".
const Y_TIER_PX = 24;

export function rulerLevel(zoom: number): RulerLevel {
  if (zoom >= GRID_ZOOM.cell) return "cell";
  if (zoom >= GRID_ZOOM.square) return "square";
  return "block";
}

export function tierCount(zoom: number): number {
  return { block: 1, square: 2, cell: 3 }[rulerLevel(zoom)];
}

// X along the top edge, Y along the left: each reads the grid along the line through the map's
// centre, so the crosshair sits exactly where both rulers point.
export function Rulers({ view }: { view: MapView }) {
  const level = rulerLevel(view.zoom);
  const { x, y } = useMemo(() => {
    const blockPx = blockWidthPx(view);
    return {
      x: buildRuler(sampleLine(view, "x"), "x", level, blockPx),
      y: buildRuler(sampleLine(view, "y"), "y", level, blockPx),
    };
  }, [view, level]);

  const tiers = x.tiers.length;
  const xHeight = tiers * TIER_PX;
  const yWidth = tiers * Y_TIER_PX;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] select-none">
      <div
        className="absolute inset-x-0 top-0 overflow-hidden border-b border-line bg-card/92"
        style={{ height: xHeight, color: DIGIT_COLORS.x }}
      >
        <RulerBands ruler={x} axis="x" />
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden border-r border-line bg-card/92"
        style={{ width: yWidth, color: DIGIT_COLORS.y }}
      >
        <RulerBands ruler={y} axis="y" />
      </div>
      <div
        className="absolute top-0 left-0 grid place-items-center border-r border-b border-line bg-bar font-mono text-[9px] font-bold"
        style={{ width: yWidth, height: xHeight }}
      >
        <span>
          <span style={{ color: DIGIT_COLORS.x }}>X</span>
          <span className="text-faint">/</span>
          <span style={{ color: DIGIT_COLORS.y }}>Y</span>
        </span>
      </div>
    </div>
  );
}

function RulerBands({ ruler, axis }: { ruler: Ruler; axis: Axis }) {
  const horizontal = axis === "x";
  return (
    <div className={cn("absolute inset-0 flex", horizontal ? "flex-col" : "flex-row")}>
      {ruler.tiers.map((tier) => (
        <Band
          key={tier.name}
          tier={tier}
          horizontal={horizontal}
          detail={tier.name !== "block"}
          thickness={horizontal ? TIER_PX : Y_TIER_PX}
        />
      ))}
      {ruler.zoneSwitches.map((pos) => (
        <ZoneSwitch key={pos} pos={pos} horizontal={horizontal} />
      ))}
    </div>
  );
}

function Band({
  tier,
  horizontal,
  detail,
  thickness,
}: {
  tier: RulerTier;
  horizontal: boolean;
  detail: boolean;
  thickness: number;
}) {
  const along = horizontal ? "left" : "top";
  return (
    <div
      className={cn(
        "relative shrink-0",
        detail && (horizontal ? "border-t" : "border-l"),
        "border-line-soft",
      )}
      style={horizontal ? { height: thickness } : { width: thickness }}
    >
      {tier.ticks.map((tick) => {
        const length = tick.major ? "100%" : "40%";
        const style: CSSProperties = horizontal
          ? { left: tick.pos, bottom: 0, width: 1, height: length }
          : { top: tick.pos, right: 0, height: 1, width: length };
        return <span key={tick.pos} className="absolute bg-current opacity-45" style={style} />;
      })}
      {tier.labels.map((label) => {
        const shift =
          label.edge === "center"
            ? horizontal
              ? "translateX(-50%)"
              : "translateY(-50%)"
            : horizontal
              ? "translateX(3px)"
              : "translateY(calc(-100% - 1px))";
        return (
          <span
            key={`${label.pos}:${label.text}`}
            className={cn(
              "absolute font-mono text-[11px] leading-none whitespace-nowrap",
              label.strong ? "font-extrabold" : "font-semibold",
              horizontal ? "top-[3px]" : "left-[3px]",
            )}
            style={{ [along]: label.pos, transform: shift }}
          >
            {label.text}
          </span>
        );
      })}
    </div>
  );
}

function ZoneSwitch({ pos, horizontal }: { pos: number; horizontal: boolean }) {
  return (
    <span
      className="absolute z-[1] rounded-sm bg-ink px-1 py-px font-sans text-[9px] leading-[13px] font-semibold whitespace-nowrap text-card"
      style={
        horizontal
          ? { left: pos, top: 2, transform: "translateX(-50%)" }
          : { top: pos, left: 2, transform: "translateY(-50%)" }
      }
    >
      {horizontal ? "중부 | 동부" : "원점"}
    </span>
  );
}

// Samples every few pixels along the horizontal (X) or vertical (Y) line through the centre,
// ordered the way the digits grow: west to east, south to north.
function sampleLine(view: MapView, axis: Axis): RulerSample[] {
  const samples: RulerSample[] = [];
  const length = axis === "x" ? view.width : view.height;
  for (let step = 0; step <= length; step += SAMPLE_PX) {
    const pos = axis === "x" ? step : length - step;
    const coord =
      axis === "x" ? view.coordAt(pos, view.height / 2) : view.coordAt(view.width / 2, pos);
    const cell = snapToCell(coord);
    samples.push({ pos, origin: cell.origin, code: locationCode(cell) });
  }
  return samples;
}

// On-screen width of a 2 km block at the centre, which decides how densely blocks are labelled.
function blockWidthPx(view: MapView): number {
  const origin = originAt(view.center.lng);
  const tm = toTM(view.center, origin);
  const east = view.pixelOf(toLngLat({ x: tm.x + BLOCK_SIZE, y: tm.y }, origin));
  return Math.max(0.1, Math.hypot(east.x - view.width / 2, east.y - view.height / 2));
}
