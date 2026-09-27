import { cellKey, isValidCell, sameRegion, type Cell } from "../domain/cell";
import { MAX_GUESSES } from "../domain/constants";
import { addGuess, gameStatus, type GameStatus, type Target } from "../domain/game";
import {
  DIFFICULTY_ORDER,
  isDifficulty,
  addTime,
  MAX_TIME_MS,
  noBonuses,
  pickCode,
  roundBonus,
  START_TIME_MS,
  type BonusKind,
  type Difficulty,
  type RoundBonuses,
  type RunEnd,
} from "../domain/infinite";
import { isPoleNumber } from "../domain/pole-number";
import type { Notice } from "./puzzle-game";

// Pure state transitions for Infinite mode; use-infinite-game.ts wires them to React and storage.

// One puzzle of a run, and which digit bonuses it has paid out.
export type Round = { code: string; guesses: Cell[]; bonuses: RoundBonuses };

// The run's clock: remainingMs was left at runningSince, and it has been running since then; a
// stopped clock (suspended, or waiting for the next puzzle) has runningSince null. Wall-clock
// time, so leaving the page does not stop a running clock.
export type RunClock = { remainingMs: number; runningSince: number | null };

// An answer cell the player found, in the order found.
export type FoundPlace = { code: string; cell: Cell };

export type InfiniteRun = {
  difficulty: Difficulty;
  found: FoundPlace[];
  // Region names by cellKey, looked up in the background when each round starts.
  regions: Record<string, string>;
  round: Round;
  clock: RunClock;
  end: RunEnd | null;
};

// Everything Infinite mode remembers: one run per difficulty (unfinished ones can be
// suspended and resumed), which one is open, and best scores.
export type InfiniteRecord = {
  version: typeof RECORD_VERSION;
  active: Difficulty | null;
  runs: Record<Difficulty, InfiniteRun | null>;
  best: Record<Difficulty, number>;
};

// Stored records of any other version (including the per-round clock of version 1, which had no
// version field) are dropped, best scores and all.
const RECORD_VERSION = 2;

export const emptyInfiniteRecord = (): InfiniteRecord => ({
  version: RECORD_VERSION,
  active: null,
  runs: { easy: null, normal: null, expert: null, superExpert: null },
  best: { easy: 0, normal: 0, expert: 0, superExpert: 0 },
});

export const activeRun = (record: InfiniteRecord): InfiniteRun | null =>
  record.active && record.runs[record.active];

function withActiveRun(
  record: InfiniteRecord,
  change: (run: InfiniteRun) => InfiniteRun,
): InfiniteRecord {
  const { active } = record;
  const run = activeRun(record);
  if (!active || !run) return record;
  return { ...record, runs: { ...record.runs, [active]: change(run) } };
}

const newRound = (played: string[]): Round => ({
  code: pickCode(played),
  guesses: [],
  bonuses: noBonuses(),
});

export function remainingAt({ remainingMs, runningSince }: RunClock, now: number): number {
  return Math.max(0, runningSince === null ? remainingMs : remainingMs - (now - runningSince));
}

// When a running clock reaches zero; null while it is stopped.
export const clockDeadline = ({ remainingMs, runningSince }: RunClock): number | null =>
  runningSince === null ? null : runningSince + remainingMs;

const stopClock = (clock: RunClock, now: number): RunClock =>
  clock.runningSince === null
    ? clock
    : { remainingMs: remainingAt(clock, now), runningSince: null };

const startClock = (clock: RunClock, now: number): RunClock =>
  clock.runningSince === null ? { ...clock, runningSince: now } : clock;

// Whether the current puzzle has been found and the run waits for the next one.
const roundFound = (run: InfiniteRun) => run.found.at(-1)?.code === run.round.code;

export function startRun(
  record: InfiniteRecord,
  difficulty: Difficulty,
  now: number,
): InfiniteRecord {
  const run: InfiniteRun = {
    difficulty,
    found: [],
    regions: {},
    round: newRound([]),
    clock: { remainingMs: START_TIME_MS, runningSince: now },
    end: null,
  };
  return { ...record, active: difficulty, runs: { ...record.runs, [difficulty]: run } };
}

// Opens a difficulty: its unfinished run resumes with the clock where it stopped (still stopped
// if the puzzle was already found), otherwise a new run starts.
export function openRun(
  record: InfiniteRecord,
  difficulty: Difficulty,
  now: number,
): InfiniteRecord {
  const run = record.runs[difficulty];
  if (!run || run.end) return startRun(record, difficulty, now);
  const clock = roundFound(run) ? run.clock : startClock(run.clock, now);
  return {
    ...record,
    active: difficulty,
    runs: { ...record.runs, [difficulty]: { ...run, clock } },
  };
}

// Back to the difficulty picker, keeping the run and stopping its clock.
export function suspendRun(record: InfiniteRecord, now: number): InfiniteRecord {
  const suspended = withActiveRun(record, (run) =>
    run.end ? run : { ...run, clock: stopClock(run.clock, now) },
  );
  return { ...suspended, active: null };
}

// Leaves a finished run for the difficulty picker; it is not kept.
export function closeRun(record: InfiniteRecord): InfiniteRecord {
  const { active } = record;
  if (!active) return record;
  return { ...record, active: null, runs: { ...record.runs, [active]: null } };
}

export function nextRound(record: InfiniteRecord, now: number): InfiniteRecord {
  return withActiveRun(record, (run) => {
    if (run.end) return run;
    const played = [...run.found.map((place) => place.code), run.round.code];
    return { ...run, round: newRound(played), clock: startClock(run.clock, now) };
  });
}

export function endRun(record: InfiniteRecord, end: RunEnd): InfiniteRecord {
  const run = activeRun(record);
  if (!run || run.end) return record;
  const { best } = record;
  const score = run.found.length;
  return {
    ...withActiveRun(record, () => ({ ...run, end })),
    best: { ...best, [run.difficulty]: Math.max(best[run.difficulty], score) },
  };
}

// Whether a change raised any best score, i.e. a run just ended on a new record.
export const beatsBest = (before: InfiniteRecord, after: InfiniteRecord) =>
  DIFFICULTY_ORDER.some((difficulty) => after.best[difficulty] > before.best[difficulty]);

export type RunGuessResult =
  | { ok: true; record: InfiniteRecord; status: GameStatus; earned: BonusKind[] }
  | { ok: false; reason: Notice };

// A guess adds the time it earned (see roundBonus). A correct one adds the answer cell it matched
// to the found places and stops the clock until the next puzzle; a sixth miss ends the run.
export function guessInRun(
  record: InfiniteRecord,
  cell: Cell,
  target: Target,
  now: number,
): RunGuessResult {
  const run = activeRun(record);
  if (!run || run.end) return { ok: false, reason: "game-over" };

  const result = addGuess(run.round.guesses, cell, target);
  if (!result.ok) return result;

  const status = gameStatus(result.guesses, target);
  const hit = target.answers.find((answer) => sameRegion(answer, cell, target.precision));
  const bonus = roundBonus(run.round.code, cell, run.round.bonuses, !!hit, result.guesses.length);
  const remainingMs = addTime(remainingAt(run.clock, now), bonus.ms);
  // The clock restarts from the new balance, or stays stopped until the next puzzle.
  const clock = { remainingMs, runningSince: hit ? null : now };
  const round = { ...run.round, guesses: result.guesses, bonuses: bonus.after };
  const found = hit ? [...run.found, { code: round.code, cell: hit }] : run.found;
  const next = withActiveRun(record, () => ({ ...run, round, found, clock }));
  return {
    ok: true,
    record: status === "lost" ? endRun(next, "missed") : next,
    status,
    earned: bonus.earned,
  };
}

// Region names are stored on the run that asked for them, even if another run is open by now.
export function withRegion(
  record: InfiniteRecord,
  difficulty: Difficulty,
  cell: Cell,
  name: string,
): InfiniteRecord {
  const run = record.runs[difficulty];
  if (!run) return record;
  const regions = { ...run.regions, [cellKey(cell)]: name };
  return { ...record, runs: { ...record.runs, [difficulty]: { ...run, regions } } };
}

// Guards data read back from storage; anything malformed is dropped.
export function parseInfiniteRecord(data: unknown): InfiniteRecord {
  const empty = emptyInfiniteRecord();
  if (!isObject(data) || data.version !== RECORD_VERSION) return empty;
  const runs = { ...empty.runs };
  if (isObject(data.runs)) {
    for (const difficulty of DIFFICULTY_ORDER) {
      const run = parseRun(data.runs[difficulty]);
      if (run?.difficulty === difficulty) runs[difficulty] = run;
    }
  }
  const active = isDifficulty(data.active) && runs[data.active] ? data.active : null;
  return { version: RECORD_VERSION, active, runs, best: parseBest(data.best, empty.best) };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRunEnd = (value: unknown): value is RunEnd =>
  value === "missed" || value === "timeout" || value === "gave-up";

function isRound(value: unknown): value is Round {
  if (!isObject(value)) return false;
  const { code, guesses, bonuses } = value;
  return (
    typeof code === "string" &&
    isPoleNumber(code) &&
    Array.isArray(guesses) &&
    guesses.length <= MAX_GUESSES &&
    guesses.every(isValidCell) &&
    isObject(bonuses) &&
    typeof bonuses.x === "boolean" &&
    typeof bonuses.y === "boolean"
  );
}

function isClock(value: unknown): value is RunClock {
  if (!isObject(value)) return false;
  const { remainingMs, runningSince } = value;
  return (
    typeof remainingMs === "number" &&
    remainingMs >= 0 &&
    remainingMs <= MAX_TIME_MS &&
    (runningSince === null || (typeof runningSince === "number" && Number.isFinite(runningSince)))
  );
}

const isFoundPlace = (value: unknown): value is FoundPlace =>
  isObject(value) &&
  typeof value.code === "string" &&
  isPoleNumber(value.code) &&
  isValidCell(value.cell);

function parseRun(data: unknown): InfiniteRun | null {
  if (!isObject(data)) return null;
  const { difficulty, found, regions, round, clock, end } = data;
  if (!isDifficulty(difficulty) || !isRound(round) || !isClock(clock)) return null;
  if (!Array.isArray(found) || !found.every(isFoundPlace)) return null;
  return {
    difficulty,
    found,
    regions: parseRegions(regions),
    round,
    clock,
    end: isRunEnd(end) ? end : null,
  };
}

function parseRegions(data: unknown): Record<string, string> {
  if (!isObject(data)) return {};
  return Object.fromEntries(
    Object.entries(data).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function parseBest(data: unknown, fallback: Record<Difficulty, number>) {
  if (!isObject(data)) return fallback;
  const best = { ...fallback };
  for (const difficulty of DIFFICULTY_ORDER) {
    const score = data[difficulty];
    if (Number.isInteger(score) && (score as number) >= 0) best[difficulty] = score as number;
  }
  return best;
}
