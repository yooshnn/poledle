/// <reference types="navermaps" />
import { useEffect } from "react";
import { regionCenter } from "@/lesson/region-codes";
import { REGIONS, type Region } from "@/lesson/regions";
import { detach, safely, toLatLng, useNaverMap } from "@/map/naver-map";

// Zoomed out, only the places to memorise first are named; from zoom 12 the base map's own
// place names take over.
const ALL_REGIONS_ZOOM = 9;
const BASE_MAP_NAMES_ZOOM = 12;

const LABEL =
  "pointer-events-none -translate-1/2 whitespace-nowrap text-ink [paint-order:stroke_fill] [-webkit-text-stroke:3px_#fffdf6]";

function visibleAt(region: Region, zoom: number): boolean {
  if (zoom >= BASE_MAP_NAMES_ZOOM) return false;
  return zoom >= ALL_REGIONS_ZOOM || region.key === true;
}

// Names of the places Street View covers, so the map works as a blank map to memorise numbers on.
export function RegionLabels() {
  const map = useNaverMap();

  useEffect(() => {
    const { Event } = naver.maps;
    const markers = REGIONS.map((region) => {
      const weight = region.key ? "text-[14px] font-extrabold" : "text-[11px] font-semibold";
      return {
        region,
        marker: new naver.maps.Marker({
          map,
          position: toLatLng(regionCenter(region.bounds)),
          clickable: false,
          zIndex: region.key ? 20 : 10,
          icon: {
            content: `<div data-testid="region-label" class="${LABEL} ${weight}">${region.name}</div>`,
            anchor: new naver.maps.Point(0, 0),
          },
        }),
      };
    });

    const update = () => {
      const zoom = map.getZoom();
      for (const { region, marker } of markers) marker.setVisible(visibleAt(region, zoom));
    };
    update();
    const listener = Event.addListener(map, "zoom_changed", update);
    return () => {
      safely(() => Event.removeListener(listener));
      for (const { marker } of markers) detach(marker);
    };
  }, [map]);

  return null;
}
