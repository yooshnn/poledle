import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { DifficultyPicker } from "@/components/infinite/difficulty-picker";
import { GiveUpDialog } from "@/components/infinite/give-up-dialog";
import { BonusToast } from "@/components/infinite/bonus-toast";
import { RoundTimer } from "@/components/infinite/round-timer";
import { RunSummary } from "@/components/infinite/run-summary";
import { Landscape } from "@/components/landscape/landscape";
import { SplitLayout } from "@/components/layout/split-layout";
import { GameMap } from "@/components/map/game-map";
import { useGuessFocus } from "@/components/map/guess-marker";
import { PuzzleHeader } from "@/components/puzzle/puzzle-header";
import { PuzzlePanel } from "@/components/puzzle/puzzle-panel";
import { Button } from "@/components/ui/button";
import { DIFFICULTIES, INFINITE_TITLE } from "@/domain/infinite";
import type { InfiniteRun } from "@/game/infinite-run";
import type { PuzzleGame } from "@/game/puzzle-game";
import { useSetting } from "@/game/settings";
import { useInfiniteGame, type InfiniteGame } from "@/game/use-infinite-game";
import { PageShell } from "./page-shell";

export function InfinitePage() {
  const infinite = useInfiniteGame();
  const { run, game, record } = infinite;
  // Best scores differ per difficulty, so the picker lists them instead of the header.
  const stat = run ? { label: "연속 정답", value: `${infinite.score}문제` } : null;

  return (
    <PageShell mode="INFINITE" stat={stat}>
      {!run || !game ? (
        <DifficultyPicker runs={record.runs} best={record.best} onPick={infinite.open} />
      ) : run.end ? (
        <RunSummary
          run={run}
          end={run.end}
          best={record.best[run.difficulty]}
          answers={infinite.answers}
          onRetry={() => infinite.retry(run.difficulty)}
          onChangeDifficulty={infinite.close}
        />
      ) : (
        // A fresh map, focus and dialogs for every round.
        <Round key={run.round.code} infinite={infinite} run={run} game={game} />
      )}
    </PageShell>
  );
}

function Round({
  infinite,
  run,
  game,
}: {
  infinite: InfiniteGame;
  run: InfiniteRun;
  game: PuzzleGame;
}) {
  const [focusRequest, focusGuess] = useGuessFocus();
  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);
  const [hardMode] = useSetting("hardMode");
  const { label, showHints } = DIFFICULTIES[run.difficulty];
  const won = game.status === "won";
  const roundNumber = run.found.length + (won ? 0 : 1);

  return (
    <>
      <SplitLayout
        left={<Landscape code={game.code} />}
        right={
          <PuzzlePanel
            game={game}
            header={
              <PuzzleHeader
                title={
                  <>
                    {INFINITE_TITLE} · {label}
                    <span className="ml-2.5 tracking-[1px] text-[#879084]">
                      {roundNumber}번째 문제
                    </span>
                  </>
                }
                code={game.code}
                aside={
                  <>
                    <span className="relative inline-flex items-baseline gap-2">
                      {won && <span className="text-sm font-bold text-leaf">찾았어요!</span>}
                      <RoundTimer
                        deadline={infinite.deadline}
                        stoppedMs={infinite.stoppedMs}
                        onTimeout={infinite.timeOut}
                      />
                      <BonusToast bonus={infinite.bonus} />
                    </span>
                    <br />
                    <span className="text-[8px] text-[#8a9386] md:text-[9px]">
                      최고 {Math.max(infinite.record.best[run.difficulty], infinite.score)}문제
                    </span>
                  </>
                }
              />
            }
            toolbar={
              <div className="flex items-center gap-1">
                {/* Keeps the run and its clock for later, back at the difficulty picker. */}
                <Button variant="quiet" onClick={infinite.suspend}>
                  중단하기
                </Button>
                <Button variant="quiet" onClick={() => setConfirmingGiveUp(true)}>
                  포기하기
                </Button>
              </div>
            }
            map={
              // Hard mode hides hints at any difficulty; Super Expert has none to begin with.
              <GameMap game={game} showHints={showHints && !hardMode} focusRequest={focusRequest} />
            }
            doneAction={
              <Button
                variant="primary"
                onClick={infinite.next}
                className="min-h-12 w-40 gap-3 bg-copper px-[18px] py-3 text-sm font-bold hover:bg-copper-dark [&_svg]:size-[18px]"
              >
                다음 문제
                <ArrowRight aria-hidden="true" />
              </Button>
            }
            onSubmit={() => void game.submit()}
            onShowGuess={focusGuess}
          />
        }
      />
      <GiveUpDialog
        open={confirmingGiveUp}
        score={infinite.score}
        onConfirm={infinite.giveUp}
        onClose={() => setConfirmingGiveUp(false)}
      />
    </>
  );
}
