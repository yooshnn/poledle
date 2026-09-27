// One colour per part of a pole number, shared by the lesson's code badge, rulers, grid lines
// and guide, so "X" looks the same wherever it appears.
export const DIGIT_COLORS = {
  x: "#a4532a",
  y: "#2f6e52",
  letter: "#3b6690",
  cell: "#7d5f9c",
  pole: "#8a9184",
} as const;

// Which colour each of the eight characters takes.
export const CODE_PARTS = ["x", "x", "y", "y", "letter", "cell", "cell", "pole"] as const;
