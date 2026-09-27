import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Width of the left pane in percent.
const DEFAULT_SPLIT = 40;
const MIN_SPLIT = 20;
const MAX_SPLIT = 65;
const KEYBOARD_STEP = 2;

const clamp = (value: number) => Math.max(MIN_SPLIT, Math.min(MAX_SPLIT, value));

type Pane = "left" | "right";

// Two panes side by side with a draggable divider (mouse, touch or keyboard).
// On mobile only the right pane is shown, unless `mobileTabs` names the panes: then a tab bar
// switches between them. Both panes stay mounted, so a map keeps its view and a document its
// scroll position while hidden.
export function SplitLayout({
  left,
  right,
  separatorLabel = "풍경 크기 조절",
  mobileTabs,
  defaultMobileTab = "left",
  defaultSplit = DEFAULT_SPLIT,
}: {
  left: ReactNode;
  right: ReactNode;
  separatorLabel?: string;
  mobileTabs?: Record<Pane, string>;
  defaultMobileTab?: Pane;
  defaultSplit?: number;
}) {
  const container = useRef<HTMLElement>(null);
  const [split, setSplit] = useState(defaultSplit);
  const [tab, setTab] = useState<Pane>(defaultMobileTab);

  function dragTo(clientX: number) {
    const rect = container.current?.getBoundingClientRect();
    if (rect) setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }

  return (
    <main
      ref={container}
      style={{ "--split": `${split}%` } as CSSProperties}
      className={cn(
        "grid h-[calc(100dvh-58px)] grid-cols-1 md:h-[calc(100dvh-78px)] md:min-h-[650px] md:grid-cols-[var(--split)_10px_minmax(0,1fr)]",
        mobileTabs && "max-md:grid-rows-[auto_minmax(0,1fr)]",
      )}
    >
      {mobileTabs && <MobileTabs labels={mobileTabs} current={tab} onChange={setTab} />}
      <div
        id={mobileTabs && "split-pane-left"}
        className={cn((!mobileTabs || tab !== "left") && "max-md:hidden", mobileTabs && "min-h-0")}
      >
        {left}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={separatorLabel}
        aria-orientation="vertical"
        aria-valuemin={MIN_SPLIT}
        aria-valuemax={MAX_SPLIT}
        aria-valuenow={Math.round(split)}
        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) dragTo(event.clientX);
        }}
        onDoubleClick={() => setSplit(defaultSplit)}
        onKeyDown={(event) => {
          if (event.key === "Home") setSplit(defaultSplit);
          else if (event.key === "ArrowLeft") setSplit((value) => clamp(value - KEYBOARD_STEP));
          else if (event.key === "ArrowRight") setSplit((value) => clamp(value + KEYBOARD_STEP));
          else return;
          event.preventDefault();
        }}
        className="relative z-[2] grid cursor-col-resize touch-none place-items-center bg-[#e6e8dc] hover:bg-[#ccd7c8] max-md:hidden"
      >
        <span className="h-10 w-[3px] rounded-[3px] bg-[#a6b0a0]" />
      </div>
      {mobileTabs ? (
        <div
          id="split-pane-right"
          className={cn("grid min-h-0 min-w-0", tab !== "right" && "max-md:hidden")}
        >
          {right}
        </div>
      ) : (
        right
      )}
    </main>
  );
}

function MobileTabs({
  labels,
  current,
  onChange,
}: {
  labels: Record<Pane, string>;
  current: Pane;
  onChange: (pane: Pane) => void;
}) {
  const panes: Pane[] = ["left", "right"];
  return (
    <div
      role="tablist"
      className="grid grid-cols-2 border-b border-line bg-bar text-[13px] font-semibold md:hidden"
    >
      {panes.map((pane) => (
        <button
          key={pane}
          type="button"
          role="tab"
          aria-selected={current === pane}
          aria-controls={`split-pane-${pane}`}
          onClick={() => onChange(pane)}
          className={cn(
            "border-b-2 py-2.5",
            current === pane
              ? "border-forest text-forest"
              : "border-transparent text-muted hover:text-body",
          )}
        >
          {labels[pane]}
        </button>
      ))}
    </div>
  );
}
