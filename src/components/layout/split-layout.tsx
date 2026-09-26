import { useRef, useState, type CSSProperties, type ReactNode } from "react";

// Width of the left pane in percent.
const DEFAULT_SPLIT = 40;
const MIN_SPLIT = 20;
const MAX_SPLIT = 65;
const KEYBOARD_STEP = 2;

const clamp = (value: number) => Math.max(MIN_SPLIT, Math.min(MAX_SPLIT, value));

// Two panes side by side with a draggable divider (mouse, touch or keyboard).
// On mobile only the right pane is shown.
export function SplitLayout({ left, right }: { left: ReactNode; right: ReactNode }) {
  const container = useRef<HTMLElement>(null);
  const [split, setSplit] = useState(DEFAULT_SPLIT);

  function dragTo(clientX: number) {
    const rect = container.current?.getBoundingClientRect();
    if (rect) setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }

  return (
    <main
      ref={container}
      style={{ "--split": `${split}%` } as CSSProperties}
      className="grid h-[calc(100dvh-58px)] grid-cols-1 md:h-[calc(100dvh-78px)] md:min-h-[650px] md:grid-cols-[var(--split)_10px_minmax(0,1fr)]"
    >
      <div className="max-md:hidden">{left}</div>
      <div
        role="separator"
        tabIndex={0}
        aria-label="풍경 크기 조절"
        aria-orientation="vertical"
        aria-valuemin={MIN_SPLIT}
        aria-valuemax={MAX_SPLIT}
        aria-valuenow={Math.round(split)}
        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) dragTo(event.clientX);
        }}
        onDoubleClick={() => setSplit(DEFAULT_SPLIT)}
        onKeyDown={(event) => {
          if (event.key === "Home") setSplit(DEFAULT_SPLIT);
          else if (event.key === "ArrowLeft") setSplit((value) => clamp(value - KEYBOARD_STEP));
          else if (event.key === "ArrowRight") setSplit((value) => clamp(value + KEYBOARD_STEP));
          else return;
          event.preventDefault();
        }}
        className="relative z-[2] grid cursor-col-resize touch-none place-items-center bg-[#e6e8dc] hover:bg-[#ccd7c8] max-md:hidden"
      >
        <span className="h-10 w-[3px] rounded-[3px] bg-[#a6b0a0]" />
      </div>
      {right}
    </main>
  );
}
