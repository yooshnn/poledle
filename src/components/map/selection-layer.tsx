/// <reference types="navermaps" />
import { useEffect, useEffectEvent, useState } from "react";
import { regionCorner, sameCell, snapToCell, type Cell } from "@/domain/cell";
import type { Precision } from "@/domain/constants";
import { safely, useNaverMap } from "@/map/naver-map";
import { CellPolygon } from "@/map/overlays";
import { ZOOM } from "./zoom";

// Clicks further out than the selection zoom zoom in by this much instead of picking.
const ZOOM_IN_STEP = 3;

const HOVER_STYLE = { color: "#d0793c", weight: 1, fillOpacity: 0.1 };

// Picks a 50 m cell by click, or with Enter on the map's centre when using the keyboard.
// The hover outline covers the whole grid square the guess will be judged on.
export function SelectionLayer({
  precision,
  onSelect,
  disabled,
}: {
  precision: Precision;
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
    const selectionZoom = ZOOM[precision].select;
    const hoverOn = (cell: Cell | null) => {
      const next = cell && regionCorner(cell, precision);
      setHover((current) => (current && next && sameCell(current, next) ? current : next));
    };

    const listeners = [
      Event.addListener(map, "click", (event: naver.maps.PointerEvent) => {
        if (disabled) return;
        if (map.getZoom() < selectionZoom) {
          map.morph(event.coord, Math.min(selectionZoom, map.getZoom() + ZOOM_IN_STEP));
          return;
        }
        select(cellAt(event.coord));
      }),
      Event.addListener(map, "mousemove", (event: naver.maps.PointerEvent) => {
        hoverOn(!disabled && map.getZoom() >= selectionZoom ? cellAt(event.coord) : null);
      }),
      Event.addListener(map, "mouseout", () => hoverOn(null)),
      Event.addListener(map, "zoom_changed", () => hoverOn(null)),
    ];

    const element = map.getElement();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.target !== element || disabled) return;
      event.preventDefault();
      if (map.getZoom() < selectionZoom) map.setZoom(selectionZoom, true);
      else select(cellAt(map.getCenter()));
    };
    element.addEventListener("keydown", onKeyDown);

    return () => {
      safely(() => Event.removeListener(listeners));
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [map, disabled, precision]);

  return !disabled && hover ? (
    <CellPolygon cell={hover} size={precision} style={HOVER_STYLE} />
  ) : null;
}
