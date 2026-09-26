import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  // Full-width action with a trailing icon.
  primary:
    "flex w-full items-center justify-between rounded-md bg-forest px-[15px] py-3 text-xs font-semibold text-white hover:bg-forest-dark disabled:bg-[#e7eadd] disabled:text-[#929b86] md:px-[18px] md:py-3.5 [&_svg]:size-4 [&_svg]:shrink-0",
  // Text button with an icon, used in the header and next to the attempts.
  quiet:
    "inline-flex items-center gap-1.5 bg-transparent px-1.5 py-px text-[10px] text-[#55635b] md:text-xs [&_svg]:size-4",
  // Square outlined icon button.
  icon: "grid size-[34px] place-items-center rounded-md border border-line bg-card text-[#365440] hover:bg-[#edf2e9] xs:size-9 md:size-[38px] [&_svg]:size-5",
} as const;

export function Button({
  variant,
  className,
  ...props
}: ComponentProps<"button"> & { variant: keyof typeof VARIANTS }) {
  return (
    <button
      type="button"
      className={cn("transition-colors", VARIANTS[variant], className)}
      {...props}
    />
  );
}
