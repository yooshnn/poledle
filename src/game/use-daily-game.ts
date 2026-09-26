import { useCallback, useMemo, useReducer } from "react";
import { puzzleSchedule } from "../config";
import { answerCells } from "../domain/answers";
import type { Cell } from "../domain/cell";
import { CELL_SIZE } from "../domain/constants";
import { dailyPuzzle, koreaDate } from "../domain/daily";
import { addGuess, gameStatus, type GameStatus, type Target } from "../domain/game";
import { guessEffect, playEffect } from "../sound";
import { describeGuesses, type Notice, type PuzzleGame } from "./puzzle-game";
import { loadStore, updateStore } from "./storage";
import { recordResult, visibleStreak, type Streak } from "./streak";

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
  // Daily asks for the exact 50 m cell.
  const target = useMemo<Target>(() => ({ answers, precision: CELL_SIZE }), [answers]);
  const status = gameStatus(guesses, target);

  const feedback = useMemo(() => describeGuesses(guesses, target), [guesses, target]);

  const select = useCallback((cell: Cell) => {
    playEffect("select");
    dispatch({ type: "select", cell });
  }, []);

  const submit = useCallback((): GameStatus | null => {
    if (!selected) return null;
    const result = addGuess(guesses, selected, target);
    if (!result.ok) {
      dispatch({ type: "rejected", reason: result.reason });
      return null;
    }
    const nextStatus = gameStatus(result.guesses, target);
    // Read the streak from storage, not state: another tab may have recorded a newer result.
    let nextStreak = state.streak;
    const saved = updateStore((store) => {
      nextStreak = recordResult(store.streak, date, nextStatus);
      return { ...store, games: { ...store.games, [date]: result.guesses }, streak: nextStreak };
    });
    dispatch({ type: "guessed", guesses: result.guesses, streak: nextStreak, saved });
    playEffect(guessEffect(nextStatus));
    return nextStatus;
  }, [target, date, guesses, selected, state.streak]);

  const game: PuzzleGame = {
    code: puzzle.code,
    precision: target.precision,
    status,
    guesses: feedback,
    revealedAnswers: status === "playing" ? [] : answers,
    selected,
    notice: state.notice,
    select,
    submit,
  };
  return { ...game, puzzle, streak: visibleStreak(state.streak, date) };
}

export type DailyGame = ReturnType<typeof useDailyGame>;
