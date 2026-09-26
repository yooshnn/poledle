import { addDays } from "../domain/daily";
import type { GameStatus } from "../domain/game";

// Consecutive daily wins, updated once when a game ends.
export type Streak = { count: number; lastWinDate: string | null };

export const noStreak: Streak = { count: 0, lastWinDate: null };

export function recordResult(streak: Streak, date: string, status: GameStatus): Streak {
  // A puzzle older than the last win (e.g. finished in a stale tab) no longer affects the streak.
  if (streak.lastWinDate && date < streak.lastWinDate) return streak;
  if (status === "lost") return noStreak;
  if (status !== "won") return streak;
  const continues = streak.lastWinDate === addDays(date, -1);
  return { count: continues ? streak.count + 1 : 1, lastWinDate: date };
}

// A streak survives until the end of the day after the last win.
export function visibleStreak(streak: Streak, today: string): number {
  const isAlive = streak.lastWinDate === today || streak.lastWinDate === addDays(today, -1);
  return isAlive ? streak.count : 0;
}
