import type { ReactNode } from "react";
import type { Notice, PuzzleGame } from "@/game/puzzle-game";
import { AttemptTrack } from "./attempt-track";
import { GuessAction } from "./guess-action";

const NOTICE_TEXT: Record<Notice, string> = {
  "already-guessed": "이미 추측한 격자입니다. 다른 곳을 골라 주세요.",
  "game-over": "이 문제는 끝났습니다.",
  "storage-unavailable": "브라우저 저장소를 사용할 수 없어 새로고침하면 진행이 사라질 수 있어요.",
};

// The play side of the layout: puzzle header, attempts, messages, the map and the submit
// control. Modes fill in the header, the controls next to the attempts and what follows a
// finished puzzle.
export function PuzzlePanel({
  game,
  header,
  toolbar,
  map,
  doneAction,
  onSubmit,
  onShowGuess,
}: {
  game: PuzzleGame;
  header: ReactNode;
  toolbar?: ReactNode;
  map: ReactNode;
  doneAction?: ReactNode;
  onSubmit: () => void;
  onShowGuess: (index: number) => void;
}) {
  const done = game.status !== "playing";

  return (
    <section className="relative flex min-w-0 flex-col overflow-hidden bg-paper">
      {header}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-3 md:px-[30px] md:pb-[19px] xl:px-10">
        <AttemptTrack guesses={game.guesses} done={done} onShowGuess={onShowGuess} />
        {toolbar && <div className="ml-auto">{toolbar}</div>}
      </div>
      {game.notice && (
        <p
          role="status"
          className="mx-5 mb-2 text-[10px] text-warn md:mx-[30px] md:mb-2.5 md:text-[11px]"
        >
          {NOTICE_TEXT[game.notice]}
        </p>
      )}
      <div className="relative min-h-0 flex-1">{map}</div>
      <GuessAction
        hasSelection={game.selected !== null}
        done={done}
        onSubmit={onSubmit}
        doneAction={doneAction}
      />
    </section>
  );
}
