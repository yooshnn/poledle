import { useState } from "react";
import { AnswerMap } from "@/components/map/answer-map";
import { NaverMapLink } from "@/components/map/naver-map-link";
import { cellKey, type Cell } from "@/domain/cell";
import type { Precision } from "@/domain/constants";
import { useAddress } from "@/map/use-address";

// Every cell carrying the puzzle's number, one at a time on a small map with its region.
// Region names already stored (by cellKey) are shown without looking them up again.
export function AnswerCandidates({
  answers,
  precision,
  initialIndex = 0,
  knownRegions = {},
}: {
  answers: Cell[];
  precision: Precision;
  initialIndex?: number;
  knownRegions?: Record<string, string>;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = selectedIndex ?? initialIndex;
  const active = answers[activeIndex];

  return (
    <>
      <div aria-label="정답 후보" className="mb-2.5 flex flex-wrap gap-1.5">
        {answers.map((answer, index) => (
          <button
            key={cellKey(answer)}
            type="button"
            aria-pressed={index === activeIndex}
            onClick={() => setSelectedIndex(index)}
            className="rounded border border-[#cbd7c4] bg-[#edf2e6] px-[9px] py-1.5 text-[11px] text-[#547047] aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-white"
          >
            후보 {index + 1}
          </button>
        ))}
      </div>

      {active && (
        <>
          <AnswerMap cell={active} precision={precision} />
          <AnswerDetail cell={active} knownRegion={knownRegions[cellKey(active)]} />
        </>
      )}
    </>
  );
}

function AnswerDetail({ cell, knownRegion }: { cell: Cell; knownRegion: string | undefined }) {
  const address = useAddress(cell, knownRegion);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft py-[13px]">
      <span className="text-[13px] leading-normal font-semibold text-[#33463b]">
        {address ?? "주소 조회 중…"}
      </span>
      <NaverMapLink cell={cell} className="text-xs" />
    </div>
  );
}
