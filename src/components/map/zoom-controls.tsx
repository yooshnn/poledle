import { Minus, Plus } from "lucide-react";
import { useNaverMap } from "@/map/naver-map";

const BUTTON =
  "grid size-8 place-items-center text-[#506b59] hover:bg-[#e9f0e8] focus-visible:bg-[#e9f0e8] focus-visible:outline-none [&_svg]:size-4";

export function ZoomControls() {
  const map = useNaverMap();
  return (
    <div className="absolute top-2.5 right-2.5 z-[1] grid divide-y divide-[#e3e8dd] overflow-hidden rounded-md border border-[#cfd8cb] bg-card shadow-[0_2px_8px_#26382d26]">
      <button
        type="button"
        aria-label="확대"
        className={BUTTON}
        onClick={() => map.setZoom(map.getZoom() + 1, true)}
      >
        <Plus aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="축소"
        className={BUTTON}
        onClick={() => map.setZoom(map.getZoom() - 1, true)}
      >
        <Minus aria-hidden="true" />
      </button>
    </div>
  );
}
