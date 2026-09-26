import { Eyebrow } from "@/components/ui/eyebrow";
import type { Puzzle } from "@/domain/daily";

// "데일리 전봇들 #3" · 0311 Z96 1 · date. The block, location and pole parts are styled apart.
export function PuzzleHeader({ puzzle }: { puzzle: Puzzle }) {
  const { number, code, date } = puzzle;
  return (
    <div className="flex items-center justify-between gap-2.5 px-5 pt-4 pb-3 md:px-[30px] md:pt-[27px] md:pb-5 xl:px-10">
      <div>
        <Eyebrow>
          데일리 전봇들 <span className="ml-2.5 tracking-[1px] text-[#879084]">#{number}</span>
        </Eyebrow>
        <div className="mt-[9px] font-mono text-[28px] leading-[1.2] font-semibold tracking-[3px] md:text-[37px]">
          {code.slice(0, 4)}
          <span className="ml-2.5 text-rust">{code.slice(4, 7)}</span>
          <small className="text-[25px] text-faint md:text-[30px]">{code.slice(7)}</small>
        </div>
      </div>
      <div className="text-right text-[10px] leading-[2] text-[#536658] md:text-[11px]">
        {date.replaceAll("-", ".")}
        <br />
        <span className="text-[8px] text-[#8a9386] md:text-[9px]">매일 00:00 KST 갱신</span>
      </div>
    </div>
  );
}
