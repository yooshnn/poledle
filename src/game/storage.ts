import { MAX_GUESSES } from "../domain/constants";
import { isValidCell, type Cell } from "../domain/cell";
import { emptyInfiniteRecord, parseInfiniteRecord, type InfiniteRecord } from "./infinite-run";
import { noStreak, type Streak } from "./streak";

// Player preferences. Sound is on unless turned off.
export type Settings = { hardMode: boolean; effects: boolean; ambience: boolean };
const defaultSettings: Settings = { hardMode: false, effects: true, ambience: true };

// Everything the app remembers, in one localStorage entry.
export type Store = {
  // Guesses per puzzle date (YYYY-MM-DD), in the order they were made.
  games: Record<string, Cell[]>;
  settings: Settings;
  streak: Streak;
  infinite: InfiniteRecord;
};

const STORAGE_KEY = "poledle";
const SCHEMA_VERSION = 1;

const emptyStore = (): Store => ({
  games: {},
  settings: defaultSettings,
  streak: noStreak,
  infinite: emptyInfiniteRecord(),
});

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
  const { version, games, settings, streak, infinite } = data as Record<string, unknown>;
  if (version !== SCHEMA_VERSION) return emptyStore();

  const validGames: Record<string, Cell[]> = {};
  if (typeof games === "object" && games !== null) {
    for (const [date, guesses] of Object.entries(games)) {
      if (Array.isArray(guesses) && guesses.length <= MAX_GUESSES && guesses.every(isValidCell)) {
        validGames[date] = guesses;
      }
    }
  }
  return {
    games: validGames,
    settings: parseSettings(settings),
    streak: parseStreak(streak),
    infinite: parseInfiniteRecord(infinite),
  };
}

function parseSettings(data: unknown): Settings {
  if (typeof data !== "object" || data === null) return defaultSettings;
  const settings = { ...defaultSettings };
  for (const name of Object.keys(settings) as (keyof Settings)[]) {
    const value = (data as Record<string, unknown>)[name];
    if (typeof value === "boolean") settings[name] = value;
  }
  return settings;
}

function parseStreak(data: unknown): Streak {
  if (typeof data !== "object" || data === null) return noStreak;
  const { count, lastWinDate } = data as Record<string, unknown>;
  if (!Number.isInteger(count) || typeof lastWinDate !== "string") return noStreak;
  return { count: count as number, lastWinDate };
}
