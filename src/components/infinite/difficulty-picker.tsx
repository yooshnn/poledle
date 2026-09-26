import { Eyebrow } from "@/components/ui/eyebrow";
import { DIFFICULTIES, DIFFICULTY_ORDER, INFINITE_TITLE, type Difficulty } from "@/domain/infinite";
import type { InfiniteRun } from "@/game/infinite-run";
import { PAGE_BODY } from "./layout";

// Each difficulty with its best score and, if one was suspended, the run in progress.
export function DifficultyPicker({
  runs,
  best,
  onPick,
}: {
  runs: Record<Difficulty, InfiniteRun | null>;
  best: Record<Difficulty, number>;
  onPick: (difficulty: Difficulty) => void;
}) {
  return (
    <main className={PAGE_BODY}>
      <div className="w-full max-w-[520px]">
        <Eyebrow>INFINITE</Eyebrow>
        <h1 className="mt-2 text-[27px] leading-[1.3] font-bold tracking-[-1px]">
          {INFINITE_TITLE}
        </h1>
        <p className="mt-2 text-[13px] leading-[1.7] text-body">
          얼마나 많이 맞힐 수 있는지 도전해 보세요.
        </p>
        <div className="mt-6 grid gap-2.5">
          {DIFFICULTY_ORDER.map((difficulty) => {
            const { label, goal } = DIFFICULTIES[difficulty];
            const run = runs[difficulty];
            const inProgress = run && !run.end ? run.found.length : null;
            return (
              <button
                key={difficulty}
                type="button"
                onClick={() => onPick(difficulty)}
                className="flex min-h-[72px] items-center justify-between gap-3 rounded-lg border border-line-soft bg-card px-4 py-[15px] text-left transition-colors hover:border-[#9db8a2] hover:bg-forest-soft"
              >
                <span className="grid gap-[3px]">
                  <strong className="text-[15px] font-bold text-[#315a40]">{label}</strong>
                  <span className="text-[11px] text-[#7b897c]">{goal}</span>
                </span>
                <span className="grid shrink-0 justify-items-end gap-1 text-[10px] text-[#7b897c]">
                  {inProgress !== null && (
                    <span className="rounded-full bg-copper px-2 py-0.5 font-bold text-white">
                      진행 중 · {inProgress}문제
                    </span>
                  )}
                  <span className="font-semibold text-[#427656]">최고 {best[difficulty]}문제</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
