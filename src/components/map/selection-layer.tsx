/// <reference types="navermaps" />
import { useEffect, useEffectEvent, useState } from "react";
import { sameCell, snapToCell, type Cell } from "@/domain/cell";
import { safely, useNaverMap } from "@/map/naver-map";
import { CellPolygon } from "@/map/overlays";

// Cells can only be picked this close in; clicks further out zoom in instead.
export const SELECTION_ZOOM = 16;
const ZOOM_IN_STEP = 3;

const HOVER_STYLE = { color: "#d0793c", weight: 1, fillOpacity: 0.1 };

// Picks a 50 m cell by click, or with Enter on the map's centre when using the keyboard.
export function SelectionLayer({
  onSelect,
  disabled,
}: {
  onSelect: (cell: Cell) => void;
  disabled: boolean;
}) {
  const map = useNaverMap();
  const [hover, setHover] = useState<Cell | null>(null);
  const select = useEffectEvent(onSelect);

  useEffect(() => {
    const { Event } = naver.maps;
    const cellAt = (coord: naver.maps.Coord) => {
      const latLng = coord as naver.maps.LatLng;
      return snapToCell({ lng: latLng.lng(), lat: latLng.lat() });
    };
    const hoverOn = (next: Cell | null) =>
      setHover((current) => (current && next && sameCell(current, next) ? current : next));

    const listeners = [
      Event.addListener(map, "click", (event: naver.maps.PointerEvent) => {
        if (disabled) return;
        if (map.getZoom() < SELECTION_ZOOM) {
          map.morph(event.coord, Math.min(SELECTION_ZOOM, map.getZoom() + ZOOM_IN_STEP));
          return;
        }
        select(cellAt(event.coord));
      }),
      Event.addListener(map, "mousemove", (event: naver.maps.PointerEvent) => {
        hoverOn(!disabled && map.getZoom() >= SELECTION_ZOOM ? cellAt(event.coord) : null);
      }),
      Event.addListener(map, "mouseout", () => hoverOn(null)),
      Event.addListener(map, "zoom_changed", () => hoverOn(null)),
    ];

    const element = map.getElement();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.target !== element || disabled) return;
      event.preventDefault();
      if (map.getZoom() < SELECTION_ZOOM) map.setZoom(SELECTION_ZOOM, true);
      else select(cellAt(map.getCenter()));
    };
    element.addEventListener("keydown", onKeyDown);

    return () => {
      safely(() => Event.removeListener(listeners));
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [map, disabled]);

  return !disabled && hover ? <CellPolygon cell={hover} style={HOVER_STYLE} /> : null;
}
