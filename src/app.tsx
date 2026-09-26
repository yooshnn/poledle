import { useState } from "react";
import { HelpDialog } from "@/components/dialogs/help-dialog";
import { ModesDialog } from "@/components/dialogs/modes-dialog";
import { ResultDialog } from "@/components/dialogs/result-dialog";
import { SettingsDialog } from "@/components/dialogs/settings-dialog";
import { Header } from "@/components/header/header";
import { Landscape } from "@/components/landscape/landscape";
import { SplitLayout } from "@/components/layout/split-layout";
import { PuzzlePanel } from "@/components/puzzle/puzzle-panel";
import { useDailyGame } from "@/game/use-daily-game";
import { useHardMode } from "@/game/use-hard-mode";

type Panel = "help" | "settings" | "modes" | "result" | null;

export function App() {
  const game = useDailyGame();
  const [hardMode, setHardMode] = useHardMode();
  // A finished game opens straight to its result.
  const [panel, setPanel] = useState<Panel>(() => (game.status === "playing" ? null : "result"));
  const closePanel = () => setPanel(null);

  function submit() {
    const status = game.submit();
    if (status === "won" || status === "lost") setPanel("result");
  }

  return (
    <>
      <Header
        streak={game.streak}
        onOpenHelp={() => setPanel("help")}
        onOpenSettings={() => setPanel("settings")}
        onOpenModes={() => setPanel("modes")}
      />
      <SplitLayout
        left={<Landscape code={game.puzzle.code} />}
        right={
          <PuzzlePanel
            game={game}
            map={<div className="absolute inset-0 bg-map" />}
            onSubmit={submit}
            onShowResult={() => setPanel("result")}
          />
        }
      />

      <HelpDialog open={panel === "help"} onClose={closePanel} />
      <SettingsDialog
        open={panel === "settings"}
        onClose={closePanel}
        hardMode={hardMode}
        onHardModeChange={setHardMode}
      />
      <ModesDialog open={panel === "modes"} onClose={closePanel} />
      <ResultDialog
        open={panel === "result" && game.status !== "playing"}
        onClose={closePanel}
        puzzle={game.puzzle}
        status={game.status}
        guesses={game.guesses.map((guess) => guess.cell)}
        answers={game.revealedAnswers}
      />
    </>
  );
}
