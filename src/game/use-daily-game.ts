import { useCallback, useMemo, useReducer } from "react";
import { puzzleSchedule } from "../config";
import { answerCells } from "../domain/answers";
import type { Cell } from "../domain/cell";
import { dailyPuzzle, koreaDate } from "../domain/daily";
import {
  addGuess,
  directionToNearestAnswer,
  gameStatus,
  isCorrect,
  type Direction,
  type GameStatus,
} from "../domain/game";
import { loadStore, updateStore } from "./storage";
import { recordResult, visibleStreak, type Streak } from "./streak";

// Why the last action did not go through; the UI turns it into a message.
export type Notice = "already-guessed" | "game-over" | "storage-unavailable";

export type GuessFeedback = { cell: Cell; correct: boolean; direction: Direction | null };

type State = {
  date: string;
  guesses: Cell[];
  selected: Cell | null;
  notice: Notice | null;
  streak: Streak;
};

type Action =
  | { type: "select"; cell: Cell }
  | { type: "guessed"; guesses: Cell[]; streak: Streak; saved: boolean }
  | { type: "rejected"; reason: Notice };

function loadDay(date: string): State {
  const { games, streak } = loadStore();
  return { date, guesses: games[date] ?? [], selected: null, notice: null, streak };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.cell, notice: null };
    case "guessed":
      return {
        ...state,
        guesses: action.guesses,
        streak: action.streak,
        selected: null,
        notice: action.saved ? null : "storage-unavailable",
      };
    case "rejected":
      return { ...state, notice: action.reason };
  }
}

export function useDailyGame() {
  const [state, dispatch] = useReducer(reducer, koreaDate(), loadDay);
  const { date, guesses, selected } = state;

  const puzzle = useMemo(() => dailyPuzzle(date, puzzleSchedule), [date]);
  const answers = useMemo(() => answerCells(puzzle.code), [puzzle]);
  const status = gameStatus(guesses, answers);

  const feedback = useMemo<GuessFeedback[]>(
    () =>
      guesses.map((cell) => {
        const correct = isCorrect(cell, answers);
        return {
          cell,
          correct,
          direction: correct ? null : directionToNearestAnswer(cell, answers),
        };
      }),
    [guesses, answers],
  );

  const select = useCallback((cell: Cell) => dispatch({ type: "select", cell }), []);

  // Returns the game status after the guess, or null when nothing was submitted.
  const submit = useCallback((): GameStatus | null => {
    if (!selected) return null;
    const result = addGuess(guesses, selected, answers);
    if (!result.ok) {
      dispatch({ type: "rejected", reason: result.reason });
      return null;
    }
    const nextStatus = gameStatus(result.guesses, answers);
    // Read the streak from storage, not state: another tab may have recorded a newer result.
    let nextStreak = state.streak;
    const saved = updateStore((store) => {
      nextStreak = recordResult(store.streak, date, nextStatus);
      return { ...store, games: { ...store.games, [date]: result.guesses }, streak: nextStreak };
    });
    dispatch({ type: "guessed", guesses: result.guesses, streak: nextStreak, saved });
    return nextStatus;
  }, [answers, date, guesses, selected, state.streak]);

  return {
    puzzle,
    status,
    guesses: feedback,
    // Answers stay hidden from the UI until the game is over.
    revealedAnswers: status === "playing" ? [] : answers,
    selected,
    notice: state.notice,
    streak: visibleStreak(state.streak, date),
    select,
    submit,
  };
}

export type DailyGame = ReturnType<typeof useDailyGame>;
