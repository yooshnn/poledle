import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// shadcn-style wrappers around the Base UI dialog, styled for this app.

export const Dialog = BaseDialog.Root;
export const DialogClose = BaseDialog.Close;

const LAYOUTS = {
  // Centered card.
  center:
    "top-1/2 left-1/2 max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl p-8 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
  // Full-height panel sliding in from the right.
  sheet:
    "inset-y-0 right-0 flex h-dvh w-[min(390px,100vw)] flex-col overflow-y-auto rounded-l-[14px] px-[22px] py-7 xs:px-[26px] xs:py-[34px] data-ending-style:translate-x-full data-starting-style:translate-x-full",
} as const;

export function DialogContent({
  title,
  layout = "center",
  className,
  children,
}: {
  // Accessible name; rendering a visible heading is up to the caller.
  title: string;
  layout?: keyof typeof LAYOUTS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-[#1d352b75] backdrop-blur-[3px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <BaseDialog.Popup
        aria-label={title}
        className={cn(
          "fixed z-50 border border-[#dce0d2] bg-paper text-[#304a3a] shadow-[0_25px_90px_#10291b30] transition-[opacity,scale,translate] duration-200 ease-out",
          LAYOUTS[layout],
          className,
        )}
      >
        {children}
        <BaseDialog.Close
          aria-label={`${title} 닫기`}
          className="absolute top-3 right-4 grid size-8 place-items-center text-[#7c8775] [&_svg]:size-5"
        >
          <X aria-hidden="true" />
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <BaseDialog.Title
      className={cn(
        "m-0 mb-5 border-b border-line-soft pr-10 pb-[18px] text-2xl leading-[1.3] font-bold tracking-[-1px]",
        className,
      )}
    >
      {children}
    </BaseDialog.Title>
  );
}
