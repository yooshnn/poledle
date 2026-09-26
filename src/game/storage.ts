import { MAX_GUESSES } from "../domain/constants";
import { isValidCell, type Cell } from "../domain/cell";
import { noStreak, type Streak } from "./streak";

// Everything the app remembers, in one localStorage entry.
export type Store = {
  // Guesses per puzzle date (YYYY-MM-DD), in the order they were made.
  games: Record<string, Cell[]>;
  hardMode: boolean;
  streak: Streak;
};

const STORAGE_KEY = "poledle";
const SCHEMA_VERSION = 1;

const emptyStore = (): Store => ({ games: {}, hardMode: false, streak: noStreak });

// Missing, unreadable or foreign data yields an empty store; storage is never required to play.
export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseStore(JSON.parse(raw)) : emptyStore();
  } catch {
    return emptyStore();
  }
}

// Applies a change on top of the latest stored value. Returns false when storage is unavailable.
export function updateStore(change: (store: Store) => Store): boolean {
  try {
    const next = change(loadStore());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, ...next }));
    return true;
  } catch {
    return false;
  }
}

function parseStore(data: unknown): Store {
  if (typeof data !== "object" || data === null) return emptyStore();
  const { version, games, hardMode, streak } = data as Record<string, unknown>;
  if (version !== SCHEMA_VERSION) return emptyStore();

  const validGames: Record<string, Cell[]> = {};
  if (typeof games === "object" && games !== null) {
    for (const [date, guesses] of Object.entries(games)) {
      if (Array.isArray(guesses) && guesses.length <= MAX_GUESSES && guesses.every(isValidCell)) {
        validGames[date] = guesses;
      }
    }
  }
  return { games: validGames, hardMode: hardMode === true, streak: parseStreak(streak) };
}

function parseStreak(data: unknown): Streak {
  if (typeof data !== "object" || data === null) return noStreak;
  const { count, lastWinDate } = data as Record<string, unknown>;
  if (!Number.isInteger(count) || typeof lastWinDate !== "string") return noStreak;
  return { count: count as number, lastWinDate };
}
