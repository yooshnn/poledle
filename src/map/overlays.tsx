/// <reference types="navermaps" />
import { useEffect } from "react";
import type { Cell } from "@/domain/cell";
import { cellLatLng, cellPath, detach, useNaverMap } from "./naver-map";

export type PolygonStyle = { color: string; weight: number; fillOpacity: number };

// A filled square over a grid cell (50 m by default).
export function CellPolygon({
  cell,
  style,
  size,
}: {
  cell: Cell;
  style: PolygonStyle;
  size?: number;
}) {
  const map = useNaverMap();
  // Depend on the cell's values, not the object, which callers may recreate on every render.
  const { origin, x, y } = cell;

  useEffect(() => {
    const polygon = new naver.maps.Polygon({
      map,
      paths: [cellPath({ origin, x, y }, size)],
      strokeColor: style.color,
      strokeWeight: style.weight,
      fillColor: style.color,
      fillOpacity: style.fillOpacity,
      clickable: false,
    });
    return () => detach(polygon);
  }, [map, origin, x, y, size, style.color, style.weight, style.fillOpacity]);

  return null;
}

// A non-interactive HTML marker centred on a cell.
export function CellMarker({
  cell,
  html,
  size,
  title,
  zIndex,
}: {
  cell: Cell;
  html: string;
  size: number;
  title?: string;
  zIndex?: number;
}) {
  const map = useNaverMap();
  const { origin, x, y } = cell;

  useEffect(() => {
    const marker = new naver.maps.Marker({
      map,
      position: cellLatLng({ origin, x, y }),
      clickable: false,
      icon: {
        content: html,
        size: new naver.maps.Size(size, size),
        anchor: new naver.maps.Point(size / 2, size / 2),
      },
      ...(title ? { title } : {}),
      ...(zIndex === undefined ? {} : { zIndex }),
    });
    return () => detach(marker);
  }, [map, origin, x, y, html, size, title, zIndex]);

  return null;
}
