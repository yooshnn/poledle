import type { Origin } from "@/domain/projection";

// Rulers along the lesson map's edges. The map is sampled every few pixels along the line
// through its centre; each sample carries the location code of the 50 m cell under it. Reading
// the digits off the samples, rather than projecting grid lines, handles the slight tilt of the
// TM grid and the switch between zones at 128°E for free.

export type Axis = "x" | "y";

// `pos` is the pixel position along the ruler. Samples are ordered the way the digits grow:
// west to east for X, south to north for Y.
export type RulerSample = { pos: number; origin: Origin; code: string };

export type RulerLabel = { pos: number; text: string; strong: boolean; edge: "center" | "start" };
export type RulerTick = { pos: number; major: boolean };
export type RulerTier = { name: RulerLevel; labels: RulerLabel[]; ticks: RulerTick[] };
export type Ruler = { tiers: RulerTier[]; zoneSwitches: number[] };

export type RulerLevel = "block" | "square" | "cell";

// Positions in the location code of each axis' digits.
const DIGITS = {
  x: { block: [0, 2], cell: 5 },
  y: { block: [2, 4], cell: 6 },
} as const;

// Block labels are thinned to one every `step` blocks, so labels stay this far apart.
const MIN_BLOCK_LABEL_PX = 26;
const BLOCK_STEPS = [1, 2, 5, 10, 20, 50];
// Narrower segments get a tick but no label.
const MIN_LABEL_PX: Record<RulerLevel, number> = { block: 18, square: 10, cell: 10 };

export function buildRuler(
  samples: RulerSample[],
  axis: Axis,
  level: RulerLevel,
  blockPx: number,
): Ruler {
  const zoneSwitches: number[] = [];
  samples.forEach((sample, index) => {
    const previous = samples[index - 1];
    if (previous && previous.origin !== sample.origin)
      zoneSwitches.push(midpoint(previous, sample));
  });

  const [from, to] = DIGITS[axis].block;
  const block = (sample: RulerSample) => sample.code.slice(from, to);
  const tiers = [blockTier(samples, block, blockPx)];
  if (level !== "block") {
    tiers.push(
      segmentTier(
        samples,
        (s) => `${s.origin}${block(s)}${s.code[4]}`,
        (s) => s.code[4] ?? "",
        "square",
      ),
    );
  }
  if (level === "cell") {
    const at = DIGITS[axis].cell;
    tiers.push(
      segmentTier(
        samples,
        (s) => `${s.origin}${block(s)}${s.code[4]}${s.code[at]}`,
        (s) => s.code[at] ?? "",
        "cell",
      ),
    );
  }
  return { tiers, zoneSwitches };
}

function blockTier(
  samples: RulerSample[],
  block: (sample: RulerSample) => string,
  blockPx: number,
): RulerTier {
  const step = BLOCK_STEPS.find((candidate) => candidate * blockPx >= MIN_BLOCK_LABEL_PX) ?? 50;
  if (step === 1) {
    const tier = segmentTier(samples, (s) => s.origin + block(s), block, "block");
    for (const label of tier.labels) label.strong = label.text === "00";
    for (const tick of tier.ticks) tick.major = true;
    return tier;
  }

  // Zoomed out, samples can skip whole blocks: every multiple of `step` crossed between two
  // samples gets a tick, placed between them, labelled with the block that starts there.
  const labels: RulerLabel[] = [];
  const ticks: RulerTick[] = [];
  samples.forEach((sample, index) => {
    const previous = samples[index - 1];
    if (!previous || previous.origin !== sample.origin) return;
    const from = Number(block(previous));
    const crossed = (Number(block(sample)) - from + 100) % 100;
    if (crossed === 0 || crossed > 50) return;
    for (let offset = 1; offset <= crossed; offset++) {
      const value = (from + offset) % 100;
      if (value % step !== 0) continue;
      const pos = previous.pos + ((sample.pos - previous.pos) * (offset - 0.5)) / crossed;
      ticks.push({ pos, major: value % 10 === 0 });
      labels.push({ pos, text: twoDigits(value), strong: value === 0, edge: "start" });
    }
  });
  return { name: "block", labels, ticks };
}

// Runs of samples sharing a key become segments: a tick between them, a label in the middle of
// the visible part of each.
function segmentTier(
  samples: RulerSample[],
  key: (sample: RulerSample) => string,
  text: (sample: RulerSample) => string,
  kind: RulerLevel,
): RulerTier {
  const labels: RulerLabel[] = [];
  const ticks: RulerTick[] = [];
  let start = samples[0];
  let startPos = start?.pos ?? 0;

  samples.forEach((sample, index) => {
    const next = samples[index + 1];
    if (next && key(next) === key(sample)) return;
    const endPos = next ? midpoint(sample, next) : sample.pos;
    if (start && Math.abs(endPos - startPos) >= MIN_LABEL_PX[kind]) {
      labels.push({
        pos: (startPos + endPos) / 2,
        text: text(start),
        strong: false,
        edge: "center",
      });
    }
    if (next) {
      if (next.origin === sample.origin) ticks.push({ pos: endPos, major: false });
      start = next;
      startPos = endPos;
    }
  });
  return { name: kind, labels, ticks };
}

function midpoint(a: RulerSample, b: RulerSample): number {
  return (a.pos + b.pos) / 2;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}
