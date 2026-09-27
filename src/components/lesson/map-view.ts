/// <reference types="navermaps" />
import { useEffect, useState } from "react";
import type { LngLat } from "@/domain/projection";
import { safely, toLatLng } from "@/map/naver-map";

export type MapView = {
  width: number;
  height: number;
  zoom: number;
  center: LngLat;
  // Map coordinates at a pixel of the map element, and back.
  coordAt(x: number, y: number): LngLat;
  pixelOf(point: LngLat): { x: number; y: number };
};

// Pixel geometry of the map as it is drawn right now, in Web Mercator (the SDK's projection).
// Only differences of the SDK's own offsets are used, to measure how many pixels the map spans
// per unit of Mercator: what offsets are measured from differs between SDK methods and versions,
// but distances between them do not. Pixels map to coordinates by inverting Mercator directly.
export function mapView(map: naver.maps.Map): MapView {
  const element = map.getElement();
  const width = element.clientWidth;
  const height = element.clientHeight;
  const zoom = map.getZoom();
  const centerLatLng = map.getCenter() as naver.maps.LatLng;
  const center = { lng: centerLatLng.lng(), lat: centerLatLng.lat() };
  const scale = mercatorScale(map, center, zoom);
  const origin = toMercator(center);

  return {
    width,
    height,
    zoom,
    center,
    coordAt(x, y) {
      return fromMercator({
        x: origin.x + (x - width / 2) / scale.x,
        y: origin.y + (y - height / 2) / scale.y,
      });
    },
    pixelOf(point) {
      const mercator = toMercator(point);
      return {
        x: (mercator.x - origin.x) * scale.x + width / 2,
        y: (mercator.y - origin.y) * scale.y + height / 2,
      };
    },
  };
}

// Normalised Web Mercator: x and y run 0–1 across the world, y growing southwards like pixels.
function toMercator({ lng, lat }: LngLat): { x: number; y: number } {
  const sin = Math.sin((lat * Math.PI) / 180);
  return { x: (lng + 180) / 360, y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI) };
}

function fromMercator({ x, y }: { x: number; y: number }): LngLat {
  const n = Math.PI * (1 - 2 * y);
  return { lng: x * 360 - 180, lat: (180 / Math.PI) * Math.atan(Math.sinh(n)) };
}

// Pixels per unit of normalised Mercator, measured with the SDK over a small step from the
// centre. Falls back to the standard 256 px tile when the SDK gives nothing usable.
const MEASURE_STEP_DEGREES = 0.01;

function mercatorScale(map: naver.maps.Map, center: LngLat, zoom: number) {
  const fallback = 256 * 2 ** zoom;
  try {
    const projection = map.getProjection();
    const offset = (point: LngLat) => projection.fromCoordToOffset(toLatLng(point));
    const east = { lng: center.lng + MEASURE_STEP_DEGREES, lat: center.lat };
    const north = { lng: center.lng, lat: center.lat + MEASURE_STEP_DEGREES };
    const at = offset(center);
    const origin = toMercator(center);
    const x = (offset(east).x - at.x) / (toMercator(east).x - origin.x);
    const y = (offset(north).y - at.y) / (toMercator(north).y - origin.y);
    return {
      x: Number.isFinite(x) && x > 0 ? x : fallback,
      y: Number.isFinite(y) && y > 0 ? y : fallback,
    };
  } catch {
    return { x: fallback, y: fallback };
  }
}

// Re-renders once per animation frame while the map moves, and once more when it settles.
export function useLiveMapView(map: naver.maps.Map): MapView {
  const [view, setView] = useState(() => mapView(map));

  useEffect(() => {
    const { Event } = naver.maps;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setView(mapView(map)));
    };
    const listeners = ["bounds_changed", "size_changed", "idle"].map((name) =>
      Event.addListener(map, name, update),
    );
    update();
    return () => {
      cancelAnimationFrame(frame);
      safely(() => Event.removeListener(listeners));
    };
  }, [map]);

  return view;
}

// The map's view as of the last time it came to rest.
export function useSettledMapView(map: naver.maps.Map): MapView {
  const [view, setView] = useState(() => mapView(map));

  useEffect(() => {
    const { Event } = naver.maps;
    const listener = Event.addListener(map, "idle", () => setView(mapView(map)));
    return () => safely(() => Event.removeListener(listener));
  }, [map]);

  return view;
}
