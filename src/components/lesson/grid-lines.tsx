/// <reference types="navermaps" />
import { useEffect } from "react";
import { BLOCK_SIZE, CELL_SIZE, GRID_ZOOM, REPEAT_SIZE, SQUARE_SIZE } from "@/domain/constants";
import { modulo } from "@/domain/pole-number";
import { gridBase, originAt, toLngLat, toTM, type LngLat, type Origin } from "@/domain/projection";
import { detach, safely, toLatLng, useNaverMap } from "@/map/naver-map";
import { DIGIT_COLORS } from "./digit-colors";
import { mapView, type MapView } from "./map-view";

// Ten blocks: the coarsest grid, drawn when the whole country is in view.
const TEN_BLOCKS = 10 * BLOCK_SIZE;
const SIZES = [CELL_SIZE, SQUARE_SIZE, BLOCK_SIZE, TEN_BLOCKS];
// A denser grid than this many lines per axis falls back to the next coarser size.
const MAX_LINES = 70;
const POINTS_PER_LINE = 16;
const ZONE_BOUNDARY_LNG = 128;

function gridSize(zoom: number): number {
  if (zoom >= GRID_ZOOM.cell) return CELL_SIZE;
  if (zoom >= GRID_ZOOM.square) return SQUARE_SIZE;
  if (zoom >= 10) return BLOCK_SIZE;
  return TEN_BLOCKS;
}

type LineStyle = { color: string; weight: number; opacity: number };

// Grid lines of the current level across the view, redrawn whenever the map settles. Lines where
// a block number is 00 are drawn in the colour of their axis, and 128°E, where the numbering
// switches zones, is dashed.
export function GridLines() {
  const map = useNaverMap();

  useEffect(() => {
    const { Event } = naver.maps;
    const overlays: naver.maps.Polyline[] = [];

    function draw() {
      overlays.splice(0).forEach(detach);
      const view = mapView(map);
      const line = (path: LngLat[], style: LineStyle, dashed = false) =>
        overlays.push(
          new naver.maps.Polyline({
            map,
            path: path.map(toLatLng),
            strokeColor: style.color,
            strokeWeight: style.weight,
            strokeOpacity: style.opacity,
            strokeStyle: dashed ? "shortdash" : "solid",
            clickable: false,
          }),
        );

      for (const origin of visibleOrigins(view)) {
        for (const { path, style } of zoneLines(view, origin)) line(path, style);
      }
      const { lng: west } = view.coordAt(0, view.height / 2);
      const { lng: east } = view.coordAt(view.width, view.height / 2);
      if (west < ZONE_BOUNDARY_LNG && east > ZONE_BOUNDARY_LNG) {
        const boundary = [32.5, 39].map((lat) => ({ lng: ZONE_BOUNDARY_LNG, lat }));
        line(boundary, { color: "#293d37", weight: 2, opacity: 0.7 }, true);
      }
    }

    draw();
    const listener = Event.addListener(map, "idle", draw);
    return () => {
      safely(() => Event.removeListener(listener));
      overlays.splice(0).forEach(detach);
    };
  }, [map]);

  return null;
}

function visibleOrigins(view: MapView): Origin[] {
  const west = Math.min(view.coordAt(0, 0).lng, view.coordAt(0, view.height).lng);
  const east = Math.max(view.coordAt(view.width, 0).lng, view.coordAt(view.width, view.height).lng);
  const origins: Origin[] = [];
  if (west < ZONE_BOUNDARY_LNG) origins.push("middle");
  if (east >= ZONE_BOUNDARY_LNG) origins.push("east");
  return origins;
}

function zoneLines(view: MapView, origin: Origin): { path: LngLat[]; style: LineStyle }[] {
  // TM extent of the view: its corners and edge midpoints cover the slight rotation.
  const points = [0, 0.5, 1].flatMap((fx) =>
    [0, 0.5, 1].map((fy) => toTM(view.coordAt(view.width * fx, view.height * fy), origin)),
  );
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const extent = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };

  const base = gridBase(origin);
  let size = gridSize(view.zoom);
  const count = (min: number, max: number) => (max - min) / size;
  while (
    Math.max(count(extent.minX, extent.maxX), count(extent.minY, extent.maxY)) > MAX_LINES &&
    size < TEN_BLOCKS
  ) {
    size = SIZES[SIZES.indexOf(size) + 1] ?? TEN_BLOCKS;
  }

  const lines: { path: LngLat[]; style: LineStyle }[] = [];
  const addLines = (axis: "x" | "y") => {
    const [min, max] = axis === "x" ? [extent.minX, extent.maxX] : [extent.minY, extent.maxY];
    const [across0, across1] =
      axis === "x" ? [extent.minY, extent.maxY] : [extent.minX, extent.maxX];
    const start = Math.floor((min - base[axis]) / size);
    const end = Math.ceil((max - base[axis]) / size);
    for (let index = start; index <= end; index++) {
      const offset = index * size;
      const style = lineStyle(axis, offset, size);
      const at = base[axis] + offset;
      const pointAt = (across: number) =>
        toLngLat(axis === "x" ? { x: at, y: across } : { x: across, y: at }, origin);
      const path = clipToZone(pointAt, across0, across1, origin);
      if (path.length > 1) lines.push({ path, style });
    }
  };
  addLines("x");
  addLines("y");
  return lines;
}

// Points along a grid line, kept to the zone's own side of 128°E: each zone only numbers that
// side. Where the line crosses the boundary, the crossing is found by bisection so the line ends
// exactly on it.
function clipToZone(
  pointAt: (t: number) => LngLat,
  from: number,
  to: number,
  origin: Origin,
): LngLat[] {
  const inZone = (t: number) => originAt(pointAt(t).lng) === origin;
  const path: LngLat[] = [];
  let previous = from;
  let previousInside = inZone(from);
  if (previousInside) path.push(pointAt(from));

  for (let step = 1; step <= POINTS_PER_LINE; step++) {
    const t = from + ((to - from) * step) / POINTS_PER_LINE;
    const inside = inZone(t);
    if (inside !== previousInside) {
      let [outer, inner] = inside ? [previous, t] : [t, previous];
      for (let i = 0; i < 20; i++) {
        const middle = (outer + inner) / 2;
        if (inZone(middle)) inner = middle;
        else outer = middle;
      }
      path.push(pointAt(inner));
      if (!inside) return path;
    }
    if (inside) path.push(pointAt(t));
    previous = t;
    previousInside = inside;
  }
  return path;
}

function lineStyle(axis: "x" | "y", offset: number, size: number): LineStyle {
  if (modulo(offset, REPEAT_SIZE) === 0)
    return { color: DIGIT_COLORS[axis], weight: 3, opacity: 0.85 };
  if (size < TEN_BLOCKS && modulo(offset, TEN_BLOCKS) === 0)
    return { color: "#4d6657", weight: 1.5, opacity: 0.55 };
  if (size < BLOCK_SIZE && modulo(offset, BLOCK_SIZE) === 0)
    return { color: "#4d6657", weight: 1.5, opacity: 0.5 };
  return { color: "#6b8777", weight: 1, opacity: 0.35 };
}
