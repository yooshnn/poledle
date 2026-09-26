/// <reference types="navermaps" />
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cellCenter, cellCorners, type Cell } from "@/domain/cell";
import type { LngLat } from "@/domain/projection";
import { cn } from "@/lib/utils";

// Everything here runs after the SDK has loaded (see components/map/map-panel.tsx).
//
// Three SDK behaviours shape this file:
// 1. new naver.maps.Map() forces `position: relative` on its element, so the element is sized
//    by a CSS frame around it rather than positioned itself.
// 2. map.setSize() pins the element to inline pixels, so size changes are observed on the frame.
// 3. After an authentication failure the SDK sets naver.maps to null, so cleanups use
//    references captured at setup and never throw (see `safely`).

type NaverMapInstance = naver.maps.Map;

export const toLatLng = ({ lat, lng }: LngLat) => new naver.maps.LatLng(lat, lng);
export const cellPath = (cell: Cell, size?: number) => cellCorners(cell, size).map(toLatLng);
export const cellLatLng = (cell: Cell) => toLatLng(cellCenter(cell));

export function safely(cleanup: () => void) {
  try {
    cleanup();
  } catch {
    /* SDK already torn down. */
  }
}

export function detach(overlay: { setMap(map: NaverMapInstance | null): void }) {
  safely(() => overlay.setMap(null));
}

const MapContext = createContext<NaverMapInstance | null>(null);

export function useNaverMap(): NaverMapInstance {
  const map = useContext(MapContext);
  if (!map) throw new Error("useNaverMap must be used inside <NaverMap>");
  return map;
}

const KOREA_BOUNDS = { south: 31, west: 122, north: 41, east: 135 };

export function NaverMap({
  label,
  options,
  className,
  children,
}: {
  label: string;
  // Read once when the map is created.
  options: naver.maps.MapOptions;
  className?: string;
  children?: ReactNode;
}) {
  const [map, setMap] = useState<NaverMapInstance | null>(null);
  const initialOptions = useRef(options);

  const mountMap = useCallback((element: HTMLDivElement) => {
    const { south, west, north, east } = KOREA_BOUNDS;
    const instance = new naver.maps.Map(element, {
      minZoom: 6,
      maxZoom: 19,
      maxBounds: new naver.maps.LatLngBounds(
        new naver.maps.LatLng(south, west),
        new naver.maps.LatLng(north, east),
      ),
      mapTypeControl: false,
      scaleControl: false,
      zoomControl: false,
      logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
      mapDataControlOptions: { position: naver.maps.Position.BOTTOM_RIGHT },
      ...initialOptions.current,
    });

    const frame = element.parentElement;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry?.contentRect ?? {};
      if (width && height) instance.setSize(new naver.maps.Size(width, height));
    });
    if (frame) observer.observe(frame);
    setMap(instance);

    return () => {
      observer.disconnect();
      setMap(null);
      safely(() => instance.destroy());
    };
  }, []);

  return (
    <div className={cn("isolate", className)}>
      <div
        ref={mountMap}
        tabIndex={0}
        aria-label={label}
        className="z-0 size-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest"
      />
      {map && <MapContext value={map}>{children}</MapContext>}
    </div>
  );
}
