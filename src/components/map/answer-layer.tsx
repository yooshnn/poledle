import { useEffect } from "react";
import { cellKey, regionCorner, type Cell } from "@/domain/cell";
import type { Precision } from "@/domain/constants";
import { cellLatLng, cellPath, useNaverMap } from "@/map/naver-map";
import { CellPolygon } from "@/map/overlays";
import { ZOOM } from "./zoom";

const ANSWER_STYLE = { color: "#277661", weight: 2, fillOpacity: 0.18 };

// Highlights the grid squares of the answer cells at the puzzle's precision and brings them
// into view: all of them, or one at a fixed zoom.
export function AnswerLayer({
  cells,
  precision,
  single = false,
}: {
  cells: Cell[];
  precision: Precision;
  single?: boolean;
}) {
  const map = useNaverMap();

  useEffect(() => {
    const first = cells[0];
    if (!first) return;
    if (single) {
      map.setCenter(cellLatLng(first));
      map.setZoom(ZOOM[precision].overview, false);
    } else {
      map.fitBounds(
        cells.flatMap((cell) => cellPath(regionCorner(cell, precision), precision)),
        { top: 60, right: 60, bottom: 60, left: 60, maxZoom: 17 },
      );
    }
  }, [cells, map, precision, single]);

  return cells.map((cell) => (
    <CellPolygon
      key={cellKey(cell)}
      cell={regionCorner(cell, precision)}
      size={precision}
      style={ANSWER_STYLE}
    />
  ));
}
