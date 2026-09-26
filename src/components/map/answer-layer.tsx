import { useEffect } from "react";
import { cellKey, type Cell } from "@/domain/cell";
import { cellLatLng, cellPath, useNaverMap } from "@/map/naver-map";
import { CellPolygon } from "@/map/overlays";

const ANSWER_STYLE = { color: "#277661", weight: 2, fillOpacity: 0.18 };

// Highlights answer cells and brings them into view: all of them, or one at a fixed zoom.
export function AnswerLayer({ cells, single = false }: { cells: Cell[]; single?: boolean }) {
  const map = useNaverMap();

  useEffect(() => {
    const first = cells[0];
    if (!first) return;
    if (single) {
      map.setCenter(cellLatLng(first));
      map.setZoom(15, false);
    } else {
      map.fitBounds(
        cells.flatMap((cell) => cellPath(cell)),
        { top: 60, right: 60, bottom: 60, left: 60, maxZoom: 17 },
      );
    }
  }, [cells, map, single]);

  return cells.map((cell) => <CellPolygon key={cellKey(cell)} cell={cell} style={ANSWER_STYLE} />);
}
