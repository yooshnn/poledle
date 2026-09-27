import { CODE_PARTS, DIGIT_COLORS } from "./digit-colors";

// A pole number (or its start) in monospace, each part in its lesson colour.
export function PoleCode({ code }: { code: string }) {
  return (
    <code className="rounded bg-card px-1 py-px font-mono text-[0.95em] font-bold tracking-[1px] ring-1 ring-line-soft">
      {CODE_PARTS.slice(0, code.length).map((part, position) => (
        // The code is fixed for the element's lifetime, so positions are stable keys.
        // oxlint-disable-next-line react/no-array-index-key
        <span key={position} style={{ color: DIGIT_COLORS[part] }}>
          {code[position]}
        </span>
      ))}
    </code>
  );
}
