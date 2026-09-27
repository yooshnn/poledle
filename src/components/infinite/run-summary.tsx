import { useEffect, useRef, useState } from "react";
import { RotateCcw, Share2 } from "lucide-react";
import { AnswerCandidates } from "@/components/result/answer-candidates";
import { ShareDialog } from "@/components/result/share-dialog";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Cell } from "@/domain/cell";
import { DIFFICULTIES, INFINITE_TITLE, type RunEnd } from "@/domain/infinite";
import { infiniteShareText } from "@/domain/share";
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
  // Playing again is the usual next step, so Enter starts it.
  const retry = useRef<HTMLButtonElement>(null);
  useEffect(() => retry.current?.focus(), []);
  const [sharing, setSharing] = useState(false);

  return (
    <main className={PAGE_BODY}>
      <EndCredits run={run} />
      <section
        aria-label="게임 결과"
        className="relative z-10 w-full max-w-[510px] rounded-xl border border-[#dce0d2] bg-paper p-6 shadow-[0_25px_90px_#10291b30] md:p-8"
      >
        <Button
          variant="quiet"
          onClick={() => setSharing(true)}
          className="absolute top-4 right-4 min-h-9 rounded-md px-2.5 font-semibold hover:bg-forest-soft hover:text-forest md:top-6 md:right-6"
        >
          <Share2 aria-hidden="true" />
          {/* Icon only on narrow phones, so the title line keeps its width. */}
          <span className="max-xs:sr-only">공유하기</span>
        </Button>
        <div className="pr-10 xs:pr-24">
          <Eyebrow>
            {INFINITE_TITLE} · {label}
          </Eyebrow>
        </div>
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button ref={retry} variant="primary" onClick={onRetry}>
            다시 도전하기
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            variant="primary"
            onClick={onChangeDifficulty}
            className="border border-forest bg-card text-forest hover:bg-forest-soft"
          >
            난이도 선택하기
          </Button>
        </div>
      </section>
      <ShareDialog
        open={sharing}
        text={infiniteShareText(run.difficulty, score, end)}
        onClose={() => setSharing(false)}
      />
    </main>
  );
}
