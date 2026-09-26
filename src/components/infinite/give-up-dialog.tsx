import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function GiveUpDialog({
  open,
  score,
  onConfirm,
  onClose,
}: {
  open: boolean;
  score: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="포기할까요?">
        <DialogTitle>포기할까요?</DialogTitle>
        <p className="text-[13px] leading-[1.8] text-body">
          지금까지 {score}문제를 찾았어요. 포기하면 이 판이 끝나고 기록이 남아요.
        </p>
        <div className="mt-5 grid gap-2">
          <Button
            variant="primary"
            className="justify-center bg-copper hover:bg-copper-dark"
            onClick={onConfirm}
          >
            판 끝내기
          </Button>
          <DialogClose render={<Button variant="quiet" className="justify-center py-2" />}>
            계속하기
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
