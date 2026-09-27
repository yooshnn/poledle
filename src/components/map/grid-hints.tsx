/// <reference types="navermaps" />
import { useEffect } from "react";
import { BLOCK_SIZE, CELL_SIZE, GRID_ZOOM, SQUARE_SIZE, type Precision } from "@/domain/constants";
import { cellCorners, inOwnZone, regionCorner, snapToCell, type Cell } from "@/domain/cell";
import { hintLabel } from "@/domain/game";
import { cellPath, detach, safely, toLatLng, useNaverMap } from "@/map/naver-map";

// Labels closer than this (in pixels) would overlap, so no hints are drawn at that zoom.
const MIN_LABEL_SPACING_PX = 110;

const LABEL_CLASS =
  "pointer-events-none font-mono text-[13px] leading-[22px] font-semibold whitespace-nowrap text-[#171c19] [paint-order:stroke_fill] [-webkit-text-stroke:3px_#fff]";

// Grid squares get finer as wrong guesses accumulate, but only once zoomed in far enough,
// and never finer than the grid level the puzzle asks for.
function hintSize(guessCount: number, zoom: number, precision: Precision): Precision {
  if (precision <= CELL_SIZE && guessCount >= 3 && zoom >= GRID_ZOOM.cell) return CELL_SIZE;
  if (precision <= SQUARE_SIZE && guessCount >= 2 && zoom >= GRID_ZOOM.square) return SQUARE_SIZE;
  return BLOCK_SIZE;
}

// After a wrong guess, outlines the 3×3 grid squares around the map centre and labels each
// with the pole number prefix it stands for (see hintLabel). Redrawn whenever the map settles.
export function GridHints({
  guesses,
  precision,
  hidden,
}: {
  guesses: Cell[];
  precision: Precision;
  hidden: boolean;
}) {
  const map = useNaverMap();

  useEffect(() => {
    const { Event } = naver.maps;
    const overlays: (naver.maps.Polygon | naver.maps.Marker)[] = [];
    const clear = () => overlays.splice(0).forEach(detach);

    function draw() {
      clear();
      if (hidden || guesses.length === 0) return;

      const size = hintSize(guesses.length, map.getZoom(), precision);
      const center = map.getCenter() as naver.maps.LatLng;
      const square = regionCorner(snapToCell({ lng: center.lng(), lat: center.lat() }), size);

      const projection = map.getProjection();
      const [southWest, southEast] = cellCorners(square, size).map((corner) =>
        projection.fromCoordToOffset(toLatLng(corner)),
      );
      if (!southWest || !southEast) return;
      if (Math.hypot(southEast.x - southWest.x, southEast.y - southWest.y) < MIN_LABEL_SPACING_PX)
        return;

      const bounds = map.getBounds() as naver.maps.LatLngBounds;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = { ...square, x: square.x + dx * size, y: square.y + dy * size };
          // Skip squares that belong to the other TM zone.
          if (!inOwnZone(cell, size)) continue;

          overlays.push(
            new naver.maps.Polygon({
              map,
              paths: [cellPath(cell, size)],
              strokeColor: "#6b8777",
              strokeWeight: 1,
              fillColor: "#6b8777",
              fillOpacity: 0.025,
              clickable: false,
            }),
          );

          const northWest = cellCorners(cell, size)[3];
          if (!northWest || !bounds.hasLatLng(toLatLng(northWest))) continue;
          overlays.push(
            new naver.maps.Marker({
              map,
              position: toLatLng(northWest),
              clickable: false,
              icon: {
                content: `<div class="${LABEL_CLASS}">${hintLabel(cell, size, guesses)}</div>`,
                // A negative anchor places the label 6 px inside the square's top-left corner.
                anchor: new naver.maps.Point(-6, -6),
              },
            }),
          );
        }
      }
    }

    draw();
    const listener = Event.addListener(map, "idle", draw);
    return () => {
      safely(() => Event.removeListener(listener));
      clear();
    };
  }, [map, guesses, precision, hidden]);

  return null;
}
