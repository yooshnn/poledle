import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIDDEN = "invisible translate-y-7 opacity-0 pointer-events-none";

// Floating control over the map: a prompt until a cell is selected, then the submit button
// (disabled, and saying so, when the selection cannot be played), and once the puzzle is over
// whatever the mode offers next (if anything).
export function GuessAction({
  hasSelection,
  blocked = false,
  done,
  onSubmit,
  doneAction,
}: {
  hasSelection: boolean;
  blocked?: boolean;
  done: boolean;
  onSubmit: () => void;
  doneAction?: ReactNode;
}) {
  const showPrompt = !done && !hasSelection;
  const showButton = !done && hasSelection;
  const layer =
    "col-start-1 row-start-1 shadow-[0_8px_24px_#20352a40] transition-[translate,opacity,visibility] duration-[280ms]";

  return (
    <div className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-20 grid animate-rise-in justify-items-end md:right-6 md:bottom-[calc(24px+env(safe-area-inset-bottom))]">
      <span
        className={cn(
          layer,
          "rounded-md bg-card px-[18px] py-[15px] text-xs font-semibold whitespace-nowrap text-[#415b4b]",
          !showPrompt && HIDDEN,
        )}
      >
        지도를 확대해 위치를 선택해주세요.
      </span>
      <Button
        variant="primary"
        disabled={!showButton || blocked}
        onClick={onSubmit}
        className={cn(
          layer,
          "min-h-12 w-40 gap-3 px-[18px] py-3 text-sm font-bold [&_svg]:size-[18px]",
          blocked
            ? "cursor-not-allowed justify-center disabled:text-[#6b7266]"
            : "animate-submit-pulse bg-copper hover:bg-copper-dark",
          !showButton && HIDDEN,
        )}
      >
        {blocked ? (
          "선택할 수 없는 곳"
        ) : (
          <>
            제출하기
            <ArrowUpRight aria-hidden="true" />
          </>
        )}
      </Button>
      {done && doneAction && <div className={layer}>{doneAction}</div>}
    </div>
  );
}
