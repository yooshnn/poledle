import { useEffect, useState } from "react";
import { cellCenter, cellKey, type Cell } from "@/domain/cell";
import { lookupRegion } from "./reverse-geocode";

// A readable place for a cell: its region name, or its coordinates when there is none.
// Undefined while the lookup is in flight. A name the caller already has skips the lookup.
export function useAddress(cell: Cell, known?: string): string | undefined {
  // Depend on the cell's values, not the object, which callers may recreate on every render.
  const { origin, x, y } = cell;
  const key = cellKey(cell);
  const [resolved, setResolved] = useState<{ key: string; address: string } | null>(null);

  useEffect(() => {
    if (known) return;
    const target = { origin, x, y };
    let active = true;
    const settle = (address: string) => {
      if (active) setResolved({ key: cellKey(target), address });
    };
    lookupRegion(target)
      .then((region) => settle(region ?? coordinatesText(target)))
      .catch(() => settle(coordinatesText(target)));
    return () => {
      active = false;
    };
  }, [origin, x, y, known]);

  if (known) return known;
  return resolved?.key === key ? resolved.address : undefined;
}

export function coordinatesText(cell: Cell): string {
  const { lat, lng } = cellCenter(cell);
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
