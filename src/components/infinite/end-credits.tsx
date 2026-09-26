import { useLayoutEffect, useRef } from "react";
import { cellKey } from "@/domain/cell";
import { DIFFICULTIES, INFINITE_TITLE } from "@/domain/infinite";
import type { InfiniteRun } from "@/game/infinite-run";
import { cn } from "@/lib/utils";
import { coordinatesText } from "@/map/use-address";

// Pixels per second; the same pace whether a run found three places or three hundred.
const SPEED = 40;

// Decoration behind the run summary: the places found this run roll up like film credits,
// over and over. Names come from what the run already stored; nothing is fetched here.
export function EndCredits({ run }: { run: InfiniteRun }) {
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
      className="pointer-events-none absolute inset-0 overflow-hidden select-none [container-type:size]"
    >
      <div
        ref={roll}
        className="absolute inset-x-0 top-full grid animate-credits-roll gap-14 px-6 py-16 text-[#aebbab] motion-reduce:top-0 motion-reduce:animate-none md:px-16"
      >
        <p className="text-center text-xs font-semibold tracking-[4px]">
          {INFINITE_TITLE} · {DIFFICULTIES[run.difficulty].label}
        </p>
        {run.found.map((place, index) => (
          <div
            key={place.code}
            // Alternate sides so the lines pass beside the summary card, not only behind it.
            className={cn(
              "grid max-w-[min(30rem,40%)] gap-1.5 max-md:max-w-full max-md:justify-self-center max-md:text-center",
              index % 2 === 0 ? "justify-self-start" : "justify-self-end text-right",
            )}
          >
            <span className="text-[11px] tracking-[2px]">{index + 1}</span>
            <strong className="text-xl leading-snug font-semibold md:text-2xl">
              {run.regions[cellKey(place.cell)] ?? coordinatesText(place.cell)}
            </strong>
            <span className="font-mono text-xs tracking-[2px]">{place.code}</span>
          </div>
        ))}
        <p className="text-center text-lg font-bold">{run.found.length}문제 연속 정답</p>
      </div>
    </div>
  );
}
