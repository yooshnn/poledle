import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnswerMap } from "@/components/map/answer-map";
import { NaverMapLink } from "@/components/map/naver-map-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cellKey, sameCell, type Cell } from "@/domain/cell";
import { CELL_SIZE } from "@/domain/constants";
import type { Puzzle } from "@/domain/daily";
import { shareText, type GameStatus } from "@/domain/game";
import { useAddress } from "@/map/use-address";

type Props = {
  open: boolean;
  onClose: () => void;
  puzzle: Puzzle;
  status: GameStatus;
  guesses: Cell[];
  answers: Cell[];
};

export function ResultDialog({ open, onClose, puzzle, status, guesses, answers }: Props) {
  // Start on the answer the player found, if any.
  const foundIndex = answers.findIndex((answer) =>
    guesses.some((guess) => sameCell(guess, answer)),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = selectedIndex ?? Math.max(0, foundIndex);
  const active = answers[activeIndex];

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

        <div aria-label="정답 후보" className="mb-2.5 flex flex-wrap gap-1.5">
          {answers.map((answer, index) => (
            <button
              key={cellKey(answer)}
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => setSelectedIndex(index)}
              className="rounded border border-[#cbd7c4] bg-[#edf2e6] px-[9px] py-1.5 text-[11px] text-[#547047] aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-white"
            >
              후보 {index + 1}
            </button>
          ))}
        </div>

        {active && (
          <>
            <AnswerMap cell={active} precision={CELL_SIZE} />
            <AnswerDetail cell={active} />
          </>
        )}

        <ShareButton text={shareText(puzzle, guesses, answers)} />
      </DialogContent>
    </Dialog>
  );
}

function AnswerDetail({ cell }: { cell: Cell }) {
  const address = useAddress(cell);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft py-[13px]">
      <span className="text-[13px] leading-normal font-semibold text-[#33463b]">
        {address ?? "주소 조회 중…"}
      </span>
      <NaverMapLink cell={cell} className="text-xs" />
    </div>
  );
}

// Copies the spoiler-free result; falls back to a selectable text box without clipboard access.
function ShareButton({ text }: { text: string }) {
  const [message, setMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  async function share() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("결과를 복사했어요. 정답 번호와 위치는 포함되지 않아요.");
    } catch {
      setShowFallback(true);
      setMessage("공유 결과를 직접 복사해 주세요.");
    }
  }

  return (
    <>
      <Button variant="primary" className="mt-4" onClick={() => void share()}>
        결과 공유하기
        <ArrowUpRight aria-hidden="true" />
      </Button>
      {message && (
        <p role="status" className="mt-[9px] text-[11px] text-[#5e725e]">
          {message}
        </p>
      )}
      {showFallback && (
        <textarea
          readOnly
          value={text}
          aria-label="복사할 공유 결과"
          onFocus={(event) => event.target.select()}
          className="mt-3 h-[145px] w-full border border-[#cbd7c4] p-2.5"
        />
      )}
    </>
  );
}
