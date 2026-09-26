import type { Cell } from "@/domain/cell";
import type { Precision } from "@/domain/constants";
import {
  directionToNearestAnswer,
  isCorrect,
  type Direction,
  type GameStatus,
  type Target,
} from "@/domain/game";

// Why the last action did not go through; the UI turns it into a message.
export type Notice = "already-guessed" | "game-over" | "storage-unavailable";

export type GuessFeedback = { cell: Cell; correct: boolean; direction: Direction | null };

// What the map and the puzzle panel need from a game, whichever mode runs it.
export type PuzzleGame = {
  code: string;
  precision: Precision;
  status: GameStatus;
  guesses: GuessFeedback[];
  // Empty while the puzzle is being played.
  revealedAnswers: Cell[];
  selected: Cell | null;
  notice: Notice | null;
  select: (cell: Cell) => void;
  // Returns the status after the guess, or null when nothing was submitted.
  submit: () => GameStatus | null;
};

export function describeGuesses(guesses: Cell[], target: Target): GuessFeedback[] {
  return guesses.map((cell) => {
    const correct = isCorrect(cell, target);
    return {
      cell,
      correct,
      direction: correct ? null : directionToNearestAnswer(cell, target.answers),
    };
  });
}
