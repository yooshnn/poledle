import type { ReactNode } from "react";

// Small letter-spaced label above a heading.
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[9px] font-semibold tracking-[1.7px] text-muted md:text-[10px]">
      {children}
    </span>
  );
}
