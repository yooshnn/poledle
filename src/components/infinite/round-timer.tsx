import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "@/lib/utils";

const WARNING_MS = 30_000;
const TICK_MS = 250;

// Time left in the round as m:ss. Always computed from the deadline, so throttled timers in
// background tabs never drift. Calls onTimeout once the deadline has passed.
export function RoundTimer({ deadline, onTimeout }: { deadline: number; onTimeout: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const expire = useEffectEvent(onTimeout);

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) expire();
    };
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [deadline]);

  const remaining = Math.max(0, deadline - now);
  const seconds = Math.ceil(remaining / 1000);
  const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <span
      role="timer"
      aria-label={`남은 시간 ${text}`}
      className={cn(
        "font-mono text-lg font-semibold tabular-nums md:text-[22px]",
        remaining <= WARNING_MS ? "text-warn" : "text-forest",
      )}
    >
      {text}
    </span>
  );
}
