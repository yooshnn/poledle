import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIDDEN = "invisible translate-y-7 opacity-0 pointer-events-none";

// Floating control over the map: a prompt until a cell is selected, then the submit button.
export function GuessAction({
  hasSelection,
  done,
  onSubmit,
}: {
  hasSelection: boolean;
  done: boolean;
  onSubmit: () => void;
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
        disabled={!showButton}
        onClick={onSubmit}
        className={cn(
          layer,
          "min-h-12 w-40 animate-submit-pulse gap-3 bg-copper px-[18px] py-3 text-sm font-bold hover:bg-copper-dark [&_svg]:size-[18px]",
          !showButton && HIDDEN,
        )}
      >
        제출하기
        <ArrowUpRight aria-hidden="true" />
      </Button>
    </div>
  );
}
