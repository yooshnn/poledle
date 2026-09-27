import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShareButtons } from "./share-button";

// The result to share, shown as it will be posted, with the ways to share it.
export function ShareDialog({
  open,
  text,
  onClose,
}: {
  open: boolean;
  text: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="결과 공유하기">
        <DialogTitle>결과 공유하기</DialogTitle>
        <p className="rounded-md border border-line-soft bg-card px-4 py-3 text-[13px] leading-[1.7] whitespace-pre-line text-ink select-text">
          {text}
        </p>
        <ShareButtons text={text} withFallback={false} />
      </DialogContent>
    </Dialog>
  );
}
