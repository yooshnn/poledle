import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";

const MODES = [
  { name: "Daily", description: "데일리 전봇들", available: true },
  { name: "Infinite", description: "어디까지 전봇들 챌린지", available: false },
  { name: "Lesson", description: "번호 읽는 법 익히기", available: false },
];

export function ModesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="게임 모드" layout="sheet">
        <div className="border-b border-line-soft pb-[26px]">
          <Eyebrow>게임 모드</Eyebrow>
          <h2 className="mt-2 text-[27px] leading-[1.3] font-semibold tracking-[-1px]">전봇들</h2>
        </div>
        <nav aria-label="게임 모드" className="grid gap-2.5 pt-6">
          {MODES.map(({ name, description, available }) => (
            <div
              key={name}
              aria-current={available ? "page" : undefined}
              className={cn(
                "flex min-h-[72px] items-center justify-between gap-3 rounded-lg border px-4 py-[15px]",
                available
                  ? "border-[#9db8a2] bg-forest-soft"
                  : "border-line-soft bg-[#f7f7f1] text-[#748177]",
              )}
            >
              <div className="grid gap-[3px]">
                <strong className={cn("text-[15px] font-bold", available && "text-[#315a40]")}>
                  {name}
                </strong>
                <span className="text-[11px] text-[#7b897c]">{description}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold",
                  available ? "text-[#427656]" : "text-[#91a094]",
                )}
              >
                {available ? "플레이 중" : "준비 중"}
              </span>
            </div>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
