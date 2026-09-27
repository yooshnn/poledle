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

// Pixel geometry of the map as it is drawn right now. The SDK's offsets are world pixels at the
// current zoom, so they are taken relative to the centre, which sits in the middle of the element.
export function mapView(map: naver.maps.Map): MapView {
  const element = map.getElement();
  const width = element.clientWidth;
  const height = element.clientHeight;
  const projection = map.getProjection();
  const center = map.getCenter() as naver.maps.LatLng;
  const origin = projection.fromCoordToOffset(center);

  return {
    width,
    height,
    zoom: map.getZoom(),
    center: { lng: center.lng(), lat: center.lat() },
    coordAt(x, y) {
      const point = new naver.maps.Point(origin.x + x - width / 2, origin.y + y - height / 2);
      const coord = projection.fromOffsetToCoord(point) as naver.maps.LatLng;
      return { lng: coord.lng(), lat: coord.lat() };
    },
    pixelOf(point) {
      const offset = projection.fromCoordToOffset(toLatLng(point));
      return { x: offset.x - origin.x + width / 2, y: offset.y - origin.y + height / 2 };
    },
  };
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
