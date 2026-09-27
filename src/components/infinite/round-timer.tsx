import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { playEffect } from "@/sound";

const WARNING_MS = 30_000;
// Seconds left at which a tick sounds every second.
const TICKING_FROM = 10;
const TICK_MS = 250;

// Time left in the run as m:ss. A running clock is always computed from its deadline, so
// throttled timers in background tabs never drift, and calls onTimeout once the deadline has
// passed. A stopped clock (deadline null) shows stoppedMs and does nothing else.
export function RoundTimer({
  deadline,
  stoppedMs,
  onTimeout,
}: {
  deadline: number | null;
  stoppedMs: number;
  onTimeout: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const expire = useEffectEvent(onTimeout);

  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) expire();
    };
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [deadline]);

  const running = deadline !== null;
  const remaining = running ? Math.max(0, deadline - now) : stoppedMs;
  const seconds = Math.ceil(remaining / 1000);
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (running && seconds > 0 && seconds <= TICKING_FROM) playEffect("tick");
  }, [running, seconds]);

  return (
    <span
      role="timer"
      aria-label={`남은 시간 ${text}`}
      className={cn(
        "font-mono text-lg font-semibold tabular-nums md:text-[22px]",
        !running ? "text-muted" : remaining <= WARNING_MS ? "text-warn" : "text-forest",
      )}
    >
      {text}
    </span>
  );
}
