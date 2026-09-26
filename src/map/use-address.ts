import { useEffect, useState } from "react";
import { cellCenter, cellKey, type Cell } from "@/domain/cell";
import { regionOf } from "./reverse-geocode";

// A readable place for a cell: its region name, or its coordinates when there is none.
// Undefined while the lookup is in flight.
export function useAddress(cell: Cell): string | undefined {
  // Depend on the cell's values, not the object, which callers may recreate on every render.
  const { origin, x, y } = cell;
  const key = cellKey(cell);
  const [resolved, setResolved] = useState<{ key: string; address: string } | null>(null);

  useEffect(() => {
    const target = { origin, x, y };
    let active = true;
    const settle = (address: string) => {
      if (active) setResolved({ key: cellKey(target), address });
    };
    regionOf(target)
      .then((region) => settle(region ?? coordinates(target)))
      .catch(() => settle(coordinates(target)));
    return () => {
      active = false;
    };
  }, [origin, x, y]);

  return resolved?.key === key ? resolved.address : undefined;
}

function coordinates(cell: Cell): string {
  const { lat, lng } = cellCenter(cell);
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
