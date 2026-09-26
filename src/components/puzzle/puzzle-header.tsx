import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

// Mode title, the pole number (block, location and pole parts styled apart) and a side note.
export function PuzzleHeader({
  title,
  code,
  aside,
}: {
  title: ReactNode;
  code: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 px-5 pt-4 pb-3 md:px-[30px] md:pt-[27px] md:pb-5 xl:px-10">
      <div>
        <Eyebrow>{title}</Eyebrow>
        <div
          data-testid="pole-code"
          className="mt-[9px] font-mono text-[28px] leading-[1.2] font-semibold tracking-[3px] md:text-[37px]"
        >
          {code.slice(0, 4)}
          <span className="ml-2.5 text-rust">{code.slice(4, 7)}</span>
          <small className="text-[25px] text-faint md:text-[30px]">{code.slice(7)}</small>
        </div>
      </div>
      {aside && (
        <div className="text-right text-[10px] leading-[2] text-[#536658] md:text-[11px]">
          {aside}
        </div>
      )}
    </div>
  );
}
