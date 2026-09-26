import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function SettingsDialog({
  open,
  onClose,
  hardMode,
  onHardModeChange,
}: {
  open: boolean;
  onClose: () => void;
  hardMode: boolean;
  onHardModeChange: (enabled: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="설정">
        <DialogTitle>설정</DialogTitle>
        <label className="flex cursor-pointer items-center justify-between gap-[18px] border-b border-line-soft pb-[18px]">
          <span className="grid gap-1.5">
            <strong className="text-sm">어려운 모드</strong>
            <small
              id="hard-mode-description"
              className="text-[11px] leading-[1.6] break-keep text-muted"
            >
              켜 두는 동안 번호 단서와 정답 방향을 숨깁니다.
            </small>
          </span>
          <Switch
            checked={hardMode}
            onCheckedChange={onHardModeChange}
            aria-describedby="hard-mode-description"
          />
        </label>
      </DialogContent>
    </Dialog>
  );
}
