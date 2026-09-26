import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSetting, type SettingName } from "@/game/settings";

const ROWS: { name: SettingName; label: string; description: string }[] = [
  {
    name: "hardMode",
    label: "어려운 모드",
    description: "켜 두는 동안 번호 단서와 정답 방향을 숨깁니다. 모든 모드에 적용돼요.",
  },
  {
    name: "effects",
    label: "효과음",
    description: "칸 선택, 정답, 오답 같은 게임 동작에 짧은 소리를 냅니다.",
  },
  {
    name: "ambience",
    label: "배경음",
    description: "잔잔한 바람 소리와 음악을 깔아 둡니다. 첫 클릭 뒤부터 들려요.",
  },
];

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="설정">
        <DialogTitle>설정</DialogTitle>
        <div className="grid gap-[18px]">
          {ROWS.map((row) => (
            <SettingRow key={row.name} {...row} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingRow({ name, label, description }: (typeof ROWS)[number]) {
  const [enabled, setEnabled] = useSetting(name);
  const descriptionId = `${name}-description`;

  return (
    <label className="flex cursor-pointer items-center justify-between gap-[18px] border-b border-line-soft pb-[18px]">
      <span className="grid gap-1.5">
        <strong className="text-sm">{label}</strong>
        <small id={descriptionId} className="text-[11px] leading-[1.6] break-keep text-muted">
          {description}
        </small>
      </span>
      <Switch checked={enabled} onCheckedChange={setEnabled} aria-describedby={descriptionId} />
    </label>
  );
}
