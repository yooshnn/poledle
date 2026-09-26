import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_GUESSES } from "@/domain/constants";
import type { GuessFeedback } from "@/game/puzzle-game";

const SLOT =
  "grid size-7 place-items-center rounded border md:size-[30px] [&_svg]:size-3.5 [&_svg]:stroke-[2.5]";

// Six slots: used attempts (X or ✓, click to show on the map), the current attempt, and the rest.
export function AttemptTrack({
  guesses,
  done,
  onShowGuess,
}: {
  guesses: GuessFeedback[];
  done: boolean;
  onShowGuess: (index: number) => void;
}) {
  const label = done
    ? `시도 종료, ${guesses.length}번 추측`
    : `시도 현황, ${guesses.length + 1}번째 추측`;

  return (
    <div aria-label={label} className="flex gap-2">
      {Array.from({ length: MAX_GUESSES }, (_, index) => {
        const guess = guesses[index];
        if (guess) {
          return (
            <button
              key={index}
              type="button"
              aria-label={`${index + 1}번째 ${guess.correct ? "정답" : "오답"} 보기`}
              onClick={() => onShowGuess(index)}
              className={cn(
                SLOT,
                "text-white hover:brightness-115",
                guess.correct ? "border-leaf bg-leaf" : "border-slate bg-slate",
              )}
            >
              {guess.correct ? <Check /> : <X />}
            </button>
          );
        }
        const current = !done && index === guesses.length;
        return (
          <span
            key={index}
            role="img"
            aria-label={`${index + 1}번째 ${current ? "현재 시도" : "남은 시도"}`}
            aria-current={current ? "step" : undefined}
            className={cn(
              SLOT,
              "text-[10px]",
              current
                ? "border-2 border-[#375c44] bg-[#375c44] font-extrabold text-white shadow-[0_0_0_2px_#d5e3d2]"
                : "border-[#d9ddcf] text-[#a4aa99]",
            )}
          >
            {index + 1}
          </span>
        );
      })}
    </div>
  );
}
