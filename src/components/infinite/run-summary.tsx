import { RotateCcw } from "lucide-react";
import { AnswerCandidates } from "@/components/result/answer-candidates";
import { ShareButton } from "@/components/result/share-button";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Cell } from "@/domain/cell";
import { DIFFICULTIES, INFINITE_TITLE, infiniteShareText, type RunEnd } from "@/domain/infinite";
import type { InfiniteRun } from "@/game/infinite-run";
import { EndCredits } from "./end-credits";
import { PAGE_BODY } from "./layout";

const END_TEXT: Record<RunEnd, string> = {
  missed: "6번 모두 틀렸어요",
  timeout: "시간이 다 됐어요",
  "gave-up": "포기했어요",
};

// The end of a run: score, how it ended, where the last number was, and what next,
// with the places found rolling past in the background.
export function RunSummary({
  run,
  end,
  best,
  answers,
  onRetry,
  onChangeDifficulty,
}: {
  run: InfiniteRun;
  end: RunEnd;
  best: number;
  // Answer cells of the last puzzle.
  answers: Cell[];
  onRetry: () => void;
  onChangeDifficulty: () => void;
}) {
  const { label, precision } = DIFFICULTIES[run.difficulty];
  const score = run.found.length;
  const record = score > 0 && score >= best ? "최고 기록!" : `최고 ${best}문제`;

  return (
    <main className={PAGE_BODY}>
      <EndCredits run={run} />
      <section
        aria-label="게임 결과"
        className="relative z-10 w-full max-w-[510px] rounded-xl border border-[#dce0d2] bg-paper p-6 shadow-[0_25px_90px_#10291b30] md:p-8"
      >
        <Eyebrow>
          {INFINITE_TITLE} · {label}
        </Eyebrow>
        <h1 className="mt-3.5 mb-1.5 text-[27px] leading-[1.35] font-bold tracking-[-0.6px]">
          {score}문제 연속 정답
        </h1>
        <p className="mb-[18px] text-[11px] text-[#7f8977]">
          {END_TEXT[end]} · {record}
        </p>

        <p className="mb-2 text-[11px] text-[#7f8977]">
          마지막 문제 <span className="font-mono font-semibold text-ink">{run.round.code}</span>
        </p>
        <AnswerCandidates answers={answers} precision={precision} knownRegions={run.regions} />

        <ShareButton text={infiniteShareText(run.difficulty, score)} />
        <div className="mt-2 flex items-center justify-between">
          <Button variant="quiet" onClick={onChangeDifficulty}>
            난이도 바꾸기
          </Button>
          <Button variant="quiet" onClick={onRetry} className="font-bold text-forest">
            다시 도전
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      </section>
    </main>
  );
}
