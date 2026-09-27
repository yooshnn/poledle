import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { answerCells } from "../domain/answers";
import { cellKey, type Cell } from "../domain/cell";
import { CELL_SIZE } from "../domain/constants";
import { gameStatus, type GameStatus, type Target } from "../domain/game";
import { DIFFICULTIES, type Difficulty, type RunEnd } from "../domain/infinite";
import { lookupRegion } from "../map/reverse-geocode";
import {
  activeRun,
  beatsBest,
  clockDeadline,
  closeRun,
  endRun,
  guessInRun,
  nextRound,
  openRun,
  startRun,
  suspendRun,
  withRegion,
  type InfiniteRecord,
} from "./infinite-run";
import { guessEffect, playEffect } from "../sound";
import { describeGuesses, type Notice, type PuzzleGame } from "./puzzle-game";
import { loadStore, updateStore } from "./storage";

export function useInfiniteGame() {
  const [record, setRecord] = useState(() => loadStore().infinite);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const run = activeRun(record);

  // Every change is kept in memory and written through to storage.
  function save(next: InfiniteRecord) {
    setRecord(next);
    setSelected(null);
    const saved = updateStore((store) => ({ ...store, infinite: next }));
    setNotice(saved ? null : "storage-unavailable");
  }

  const code = run?.round.code;
  const precision = run ? DIFFICULTIES[run.difficulty].precision : CELL_SIZE;
  const answers = useMemo(() => (code ? answerCells(code) : []), [code]);
  const target = useMemo<Target>(() => ({ answers, precision }), [answers, precision]);
  const guesses = useMemo(() => run?.round.guesses ?? [], [run]);
  const status: GameStatus = gameStatus(guesses, target);
  const feedback = useMemo(() => describeGuesses(guesses, target), [guesses, target]);

  // Region names for the credits are looked up when a round starts, so they are stored well
  // before the run ends and the end screen never has to fetch.
  const lookUpRegions = useEffectEvent((roundAnswers: Cell[]) => {
    if (!run || run.end) return;
    const { difficulty } = run;
    const cells = [...roundAnswers, ...run.found.map((place) => place.cell)];
    for (const cell of cells) {
      if (run.regions[cellKey(cell)]) continue;
      lookupRegion(cell)
        .then((name) => {
          if (!name) return;
          setRecord((current) => withRegion(current, difficulty, cell, name));
          updateStore((store) => ({
            ...store,
            infinite: withRegion(store.infinite, difficulty, cell, name),
          }));
        })
        .catch(() => {
          /* The credits fall back to coordinates. */
        });
    }
  });
  useEffect(() => lookUpRegions(answers), [answers]);

  // Null while the clock is stopped: suspended, or waiting for the next puzzle.
  const deadline = run ? clockDeadline(run.clock) : null;
  const isOver = (now: number) => status === "playing" && deadline !== null && now >= deadline;

  // Ending a run sounds like a loss, or a fanfare when it beats the best score.
  function finish(end: RunEnd) {
    const next = endRun(record, end);
    playEffect(beatsBest(record, next) ? "record" : "lose");
    save(next);
  }

  // Called by the round timer; the clock is also checked on submit.
  function timeOut() {
    if (run && !run.end && isOver(Date.now())) finish("timeout");
  }

  function submit(): GameStatus | null {
    if (!selected) return null;
    if (isOver(Date.now())) {
      timeOut();
      return null;
    }
    const result = guessInRun(record, selected, target, Date.now());
    if (!result.ok) {
      setNotice(result.reason);
      return null;
    }
    playEffect(beatsBest(record, result.record) ? "record" : guessEffect(result.status));
    save(result.record);
    return result.status;
  }

  const game: PuzzleGame | null = run && {
    code: run.round.code,
    precision,
    status,
    guesses: feedback,
    // A found answer shows where it was; a missed puzzle shows every answer.
    revealedAnswers:
      status === "won"
        ? run.found.slice(-1).map((place) => place.cell)
        : status === "lost"
          ? answers
          : [],
    selected,
    notice,
    select: (cell) => {
      playEffect("select");
      setSelected(cell);
      setNotice(null);
    },
    submit,
  };

  return {
    record,
    run,
    game,
    answers,
    score: run?.found.length ?? 0,
    deadline,
    // Resumes the difficulty's unfinished run, or starts one.
    open: (difficulty: Difficulty) => save(openRun(record, difficulty, Date.now())),
    retry: (difficulty: Difficulty) => save(startRun(record, difficulty, Date.now())),
    next: () => save(nextRound(record, Date.now())),
    suspend: () => save(suspendRun(record, Date.now())),
    giveUp: () => finish("gave-up"),
    timeOut,
    close: () => save(closeRun(record)),
  };
}

export type InfiniteGame = ReturnType<typeof useInfiniteGame>;
