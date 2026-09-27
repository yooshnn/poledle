import { useMemo } from "react";
import type { Cell } from "@/domain/cell";
import type { Precision } from "@/domain/constants";
import { cn } from "@/lib/utils";
import { NaverMap, cellLatLng } from "@/map/naver-map";
import { CellMarker } from "@/map/overlays";
import { AnswerLayer } from "./answer-layer";
import { MapStatus } from "./map-status";
import { useNaverMaps } from "./use-naver-maps";
import { ZOOM } from "./zoom";
import { ZoomControls } from "./zoom-controls";

const FRAME =
  "relative h-[200px] overflow-hidden rounded-[7px] border border-[#d5ded3] bg-map md:h-[235px]";
// lucide "check" icon, inlined because markers take HTML strings.
const ANSWER_PIN =
  '<div class="box-border grid size-8 place-items-center rounded-full border-2 border-white bg-[#277661] text-white shadow-[0_0_0_2px_#277661,0_3px_8px_#26382d80]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></div>';

// Small map showing one answer and its grid square. className adjusts the frame (its height).
export function AnswerMap({
  cell,
  precision,
  className,
}: {
  cell: Cell;
  precision: Precision;
  className?: string | undefined;
}) {
  const status = useNaverMaps();
  const cells = useMemo(() => [cell], [cell]);
  const frame = cn(FRAME, className);
  if (status !== "ready") return <MapStatus status={status} className={frame} />;

  return (
    <NaverMap
      label="선택한 정답 구획 지도"
      options={{ center: cellLatLng(cell), zoom: ZOOM[precision].overview, scrollWheel: false }}
      className={frame}
    >
      <ZoomControls />
      <AnswerLayer cells={cells} precision={precision} single />
      <CellMarker cell={cell} html={ANSWER_PIN} size={32} title="정답 구획" zIndex={200} />
    </NaverMap>
  );
}
