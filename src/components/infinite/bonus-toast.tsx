import { useEffect, useState } from "react";
import type { BonusKind, EarnedTime } from "@/domain/infinite";

const LABELS: Record<BonusKind, string> = { x: "X 일치", y: "Y 일치", clear: "정답" };
const VISIBLE_MS = 1600;

// Chips under the timer for the time the last guess earned, e.g. "+30s X 일치". They fade out
// on their own; a new reward (new id) shows again even if it is the same as the last.
export function BonusToast({ bonus }: { bonus: { id: number; times: EarnedTime[] } | null }) {
  // The id of the last reward whose chips have faded.
  const [faded, setFaded] = useState<number | null>(null);

  useEffect(() => {
    if (!bonus) return;
    const timer = setTimeout(() => setFaded(bonus.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [bonus]);

  if (!bonus || faded === bonus.id) return null;
  const text = bonus.times.map(({ kind, ms }) => `+${ms / 1000}s ${LABELS[kind]}`);
  return (
    <div
      role="status"
      aria-label={`시간 추가: ${text.join(", ")}`}
      className="pointer-events-none absolute top-full right-0 z-10 mt-1 grid justify-items-end gap-1"
    >
      {text.map((line, index) => (
        <span
          key={line}
          style={{ animationDelay: `${index * 120}ms` }}
          className="animate-bonus-pop rounded-full bg-forest-soft px-2 py-0.5 font-mono text-[11px] leading-[16px] font-bold whitespace-nowrap text-leaf shadow-[0_2px_6px_#26382d26]"
        >
          {line}
        </span>
      ))}
    </div>
  );
}
