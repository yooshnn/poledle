import type { Precision } from "@/domain/constants";

// Map zoom levels per target precision:
// select   — the closest zoom-out at which a grid square can still be picked by clicking
// focus    — showing one guess and its card
// overview — showing one answer square with some surroundings
export const ZOOM: Record<Precision, { select: number; focus: number; overview: number }> = {
  50: { select: 16, focus: 18, overview: 15 },
  500: { select: 13, focus: 15, overview: 13 },
  2_000: { select: 10, focus: 13, overview: 11 },
};
