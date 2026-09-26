import proj4 from "proj4";

export type LngLat = { lng: number; lat: number };
export type Point = { x: number; y: number };

// Korea uses two GRS80 Transverse Mercator zones. Pole numbers are offsets from a grid base
// point in each zone; the base values come from the reference implementation (Cartographer).
export type Origin = "middle" | "east";

type Zone = { centralMeridian: number; gridBase: Point };

const ZONES: Record<Origin, Zone> = {
  middle: { centralMeridian: 127, gridBase: { x: 199_070, y: 499_310 } },
  east: { centralMeridian: 129, gridBase: { x: 199_060, y: 499_315 } },
};

// Zones meet at 128°E: everything west of it is numbered from the middle zone.
const ZONE_BOUNDARY_LNG = 128;

const converters = {
  middle: createConverter(ZONES.middle),
  east: createConverter(ZONES.east),
};

function createConverter({ centralMeridian }: Zone) {
  return proj4(
    "EPSG:4326",
    `+proj=tmerc +lat_0=38 +lon_0=${centralMeridian} +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs`,
  );
}

export function gridBase(origin: Origin): Point {
  return ZONES[origin].gridBase;
}

export function originAt(lng: number): Origin {
  return lng < ZONE_BOUNDARY_LNG ? "middle" : "east";
}

export function toTM({ lng, lat }: LngLat, origin: Origin): Point {
  const [x, y] = converters[origin].forward([lng, lat]);
  return { x, y };
}

export function toLngLat({ x, y }: Point, origin: Origin): LngLat {
  const [lng, lat] = converters[origin].inverse([x, y]);
  return { lng, lat };
}
