import { useLayoutEffect, useRef } from "react";
import { cellKey } from "@/domain/cell";
import { MAX_GUESSES } from "@/domain/constants";
import { formatClock } from "@/domain/infinite";
import type { InfiniteRun } from "@/game/infinite-run";
import { cn } from "@/lib/utils";
import { coordinatesText } from "@/map/use-address";

// Pixels per second; the same pace whether a run found three places or three hundred.
const SPEED = 32;

// The places found this run rolling up like film credits inside a panel of the end screen,
// over and over. Names come from what the run already stored; nothing is fetched here.
// className sizes the panel.
export function EndCredits({ run, className }: { run: InfiniteRun; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);

  // A fixed speed means the duration follows the distance: frame height plus list height.
  useLayoutEffect(() => {
    const frameElement = frame.current;
    const rollElement = roll.current;
    if (!frameElement || !rollElement) return;
    const update = () => {
      const distance = frameElement.clientHeight + rollElement.offsetHeight;
      rollElement.style.animationDuration = `${distance / SPEED}s`;
    };
    const observer = new ResizeObserver(update);
    observer.observe(frameElement);
    observer.observe(rollElement);
    return () => observer.disconnect();
  }, []);

  if (run.found.length === 0) return null;

  return (
    <div
      ref={frame}
      aria-hidden="true"
      data-testid="end-credits"
      className={cn(
        "pointer-events-none relative overflow-hidden rounded-xl bg-forest-soft/60 select-none [container-type:size] [mask-image:linear-gradient(transparent,#000_12%,#000_88%,transparent)]",
        className,
      )}
    >
      <div
        ref={roll}
        className="absolute inset-x-0 top-full grid animate-credits-roll gap-9 px-6 py-10 text-[#cdd6ca] motion-reduce:top-0 motion-reduce:animate-none md:px-8 md:text-[#6f8a73]"
      >
        <p className="text-center text-[10px] font-semibold tracking-[4px]">이번 판에 찾은 곳</p>
        {run.found.map((place, index) => (
          <div
            key={place.code}
            // Alternate sides, like credits passing either side of the screen.
            className={cn(
              "grid max-w-[75%] gap-1",
              index % 2 === 0 ? "justify-self-start" : "justify-self-end text-right",
            )}
          >
            <span className="text-[10px] tracking-[2px]">{index + 1}</span>
            <strong className="text-lg leading-snug font-semibold text-[#c3cdc0] md:text-[#3f5f48]">
              {run.regions[cellKey(place.cell)] ?? coordinatesText(place.cell)}
            </strong>
            <span className="font-mono text-[11px] tracking-[2px]">
              {place.code} · {place.attempts}/{MAX_GUESSES} · {formatClock(place.remainingMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
