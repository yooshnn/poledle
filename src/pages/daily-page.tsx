import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ResultDialog } from "@/components/dialogs/result-dialog";
import { Landscape } from "@/components/landscape/landscape";
import { SplitLayout } from "@/components/layout/split-layout";
import { GameMap } from "@/components/map/game-map";
import { useGuessFocus } from "@/components/map/guess-marker";
import { PuzzleHeader } from "@/components/puzzle/puzzle-header";
import { PuzzlePanel } from "@/components/puzzle/puzzle-panel";
import { Button } from "@/components/ui/button";
import { useDailyGame } from "@/game/use-daily-game";
import { useHardMode } from "@/game/use-hard-mode";
import { PageShell } from "./page-shell";

export function DailyPage() {
  const game = useDailyGame();
  const [hardMode] = useHardMode();
  // A finished game opens straight to its result.
  const [showResult, setShowResult] = useState(game.status !== "playing");
  const [focusRequest, focusGuess] = useGuessFocus();

  function submit() {
    const status = game.submit();
    if (status === "won" || status === "lost") setShowResult(true);
  }

  return (
    <PageShell mode="DAILY" stat={{ label: "연속 정답", value: `${game.streak}일` }}>
      <SplitLayout
        left={<Landscape code={game.code} />}
        right={
          <PuzzlePanel
            game={game}
            header={
              <PuzzleHeader
                title={
                  <>
                    데일리 전봇들
                    <span className="ml-2.5 tracking-[1px] text-[#879084]">
                      #{game.puzzle.number}
                    </span>
                  </>
                }
                code={game.code}
                aside={
                  <>
                    {game.puzzle.date.replaceAll("-", ".")}
                    <br />
                    <span className="text-[8px] text-[#8a9386] md:text-[9px]">
                      매일 00:00 KST 갱신
                    </span>
                  </>
                }
              />
            }
            toolbar={
              game.status !== "playing" && (
                <Button
                  variant="quiet"
                  onClick={() => setShowResult(true)}
                  className="font-bold text-forest"
                >
                  결과 보기
                  <ArrowUpRight aria-hidden="true" />
                </Button>
              )
            }
            map={<GameMap game={game} showHints={!hardMode} focusRequest={focusRequest} />}
            onSubmit={submit}
            onShowGuess={focusGuess}
          />
        }
      />
      <ResultDialog
        open={showResult && game.status !== "playing"}
        onClose={() => setShowResult(false)}
        puzzle={game.puzzle}
        status={game.status}
        guesses={game.guesses.map((guess) => guess.cell)}
        answers={game.revealedAnswers}
      />
    </PageShell>
  );
}
