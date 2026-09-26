/// <reference types="navermaps" />
import { cellCenter, cellKey, type Cell } from "@/domain/cell";
import { loadNaverMaps } from "./load-naver-maps";

// Settlement-level name of a cell (시·도 시·군·구 읍·면·동 리), looked up with the SDK's geocoder
// submodule. Street addresses are deliberately left out. Resolves to null when NAVER has no
// region for the point (the sea, for example) and rejects when the lookup itself fails.
export function lookupRegion(cell: Cell): Promise<string | null> {
  const key = cellKey(cell);
  let lookup = lookups.get(key);
  if (!lookup) {
    lookup = reverseGeocode(cell);
    // Forget failures so the next attempt asks again.
    lookup.catch(() => lookups.delete(key));
    lookups.set(key, lookup);
  }
  return lookup;
}

// One lookup per cell for the lifetime of the page: markers and dialogs ask for the same cells.
const lookups = new Map<string, Promise<string | null>>();

async function reverseGeocode(cell: Cell): Promise<string | null> {
  const maps = await loadNaverMaps();
  const { lat, lng } = cellCenter(cell);
  return new Promise((resolve, reject) => {
    maps.Service.reverseGeocode(
      { coords: new maps.LatLng(lat, lng), orders: "admcode,legalcode" },
      (status, response) => {
        if (status === maps.Service.Status.OK) resolve(regionName(response.v2.results));
        else reject(new Error(`Reverse geocoding failed with status ${status}`));
      },
    );
  });
}

function regionName(results: naver.maps.Service.ResultItem[]): string | null {
  const region = results[0]?.region;
  if (!region) return null;
  const names = [region.area1, region.area2, region.area3, region.area4]
    .map((area) => area?.name.trim())
    .filter((name): name is string => !!name);
  // Some areas repeat their parent's name (e.g. 세종특별자치시 has no 시·군·구).
  return names.length ? [...new Set(names)].join(" ") : null;
}
