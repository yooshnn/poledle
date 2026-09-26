import { ArrowUpRight } from "lucide-react";
import { cellCenter, type Cell } from "@/domain/cell";
import { cn } from "@/lib/utils";

// Opens NAVER Map zoomed in on the cell, where the player can switch to 거리뷰 to look for poles.
export function NaverMapLink({ cell, className }: { cell: Cell; className?: string }) {
  return (
    <a
      href={naverMapUrl(cell)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 font-semibold whitespace-nowrap text-forest hover:underline [&_svg]:size-3.5",
        className,
      )}
    >
      지도에서 보기
      <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

// NAVER documents no web URL for coordinates. map.naver.com keeps its view in `c`:
// longitude, latitude, zoom, then tilt, rotation and map type flags.
function naverMapUrl(cell: Cell): string {
  const { lat, lng } = cellCenter(cell);
  return `https://map.naver.com/p?c=${lng.toFixed(7)},${lat.toFixed(7)},19,0,0,0,dh`;
}
