import { AnswerCandidates } from "@/components/result/answer-candidates";
import { ShareButtons } from "@/components/result/share-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { sameCell, type Cell } from "@/domain/cell";
import { CELL_SIZE } from "@/domain/constants";
import type { Puzzle } from "@/domain/daily";
import type { GameStatus } from "@/domain/game";
import { dailyShareText } from "@/domain/share";

type Props = {
  open: boolean;
  onClose: () => void;
  puzzle: Puzzle;
  status: GameStatus;
  guesses: Cell[];
  answers: Cell[];
  streak: number;
};

export function ResultDialog({ open, onClose, puzzle, status, guesses, answers, streak }: Props) {
  // Start on the answer the player found, if any.
  const foundIndex = answers.findIndex((answer) =>
    guesses.some((guess) => sameCell(guess, answer)),
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="게임 결과" className="max-w-[510px] p-6 md:p-8">
        <Eyebrow>데일리 전봇들 #{puzzle.number}</Eyebrow>
        <h2 className="mt-3.5 mb-1.5 text-[27px] leading-[1.35] font-bold tracking-[-0.6px]">
          {status === "won" ? `${guesses.length}번 만에 찾았어요!` : "정답을 찾지 못했어요"}
        </h2>
        <p className="mb-[18px] text-[11px] text-[#7f8977]">
          같은 번호를 가진 구획 {answers.length}곳
        </p>

        <AnswerCandidates
          answers={answers}
          precision={CELL_SIZE}
          initialIndex={Math.max(0, foundIndex)}
        />

        <ShareButtons text={dailyShareText(puzzle, guesses, answers, streak)} />
      </DialogContent>
    </Dialog>
  );
}
