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
    // isolate: the phone credits sit at z -1, above this background but below the content.
    <main className="relative isolate min-h-[calc(100dvh-58px)] bg-paper px-5 py-8 md:grid md:min-h-[calc(100dvh-78px)] md:content-center md:px-10 md:py-12">
      <section aria-label="게임 결과" className="mx-auto w-full max-w-[1040px]">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>
            {INFINITE_TITLE} · {label}
          </Eyebrow>
          <Button
            variant="quiet"
            onClick={() => setSharing(true)}
            className="-mr-2.5 min-h-9 shrink-0 rounded-md px-2.5 font-semibold hover:bg-forest-soft hover:text-forest"
          >
            <Share2 aria-hidden="true" />
            공유하기
          </Button>
        </div>

        {/* Wide screens: the result, the last puzzle and the buttons down the first column,
            the credits rolling in a panel in the second. Phones: the credits roll behind the
            whole page. */}
        <div className="mt-6 grid content-start gap-6 md:mt-8 md:grid-cols-2 md:gap-x-14">
          <div className="md:col-start-1">
            <h1 className="font-bold tracking-[-1px] text-ink-strong">
              <span className="text-[64px] leading-none md:text-[80px]">{score}</span>
              <span className="ml-1 text-[26px] md:text-[30px]">문제 연속 정답</span>
            </h1>
            <p className="mt-3 text-[13px] text-[#6f7c6c]">
              {END_TEXT[end]} · {record}
            </p>
          </div>

          <div className="md:col-start-1">
            <p className="mb-2.5 text-[12px] text-[#7f8977]">
              마지막 문제 <span className="font-mono font-semibold text-ink">{run.round.code}</span>
            </p>
            <AnswerCandidates answers={answers} precision={precision} knownRegions={run.regions} />
          </div>

          <EndCredits
            run={run}
            className="max-md:absolute max-md:inset-0 max-md:-z-10 max-md:rounded-none max-md:bg-transparent md:col-start-2 md:row-span-3 md:row-start-1"
          />

          <div className="grid grid-cols-2 gap-2 md:col-start-1">
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
