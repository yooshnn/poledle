import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { INFINITE_TITLE } from "@/domain/infinite";
import { Link, useRoute, type Route } from "@/lib/router";

const MODES: { name: string; description: string; route: Route | null }[] = [
  { name: "Daily", description: "데일리 전봇들", route: "/" },
  { name: "Infinite", description: INFINITE_TITLE, route: "/infinite" },
  { name: "Lesson", description: "번호 읽는 법 익히기", route: "/lesson" },
];

const ITEM =
  "flex min-h-[72px] items-center justify-between gap-3 rounded-lg border px-4 py-[15px]";

export function ModesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const current = useRoute();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title="게임 모드" layout="sheet">
        <div className="border-b border-line-soft pb-[26px]">
          <Eyebrow>게임 모드</Eyebrow>
          <h2 className="mt-2 text-[27px] leading-[1.3] font-semibold tracking-[-1px]">전봇들</h2>
        </div>
        <nav aria-label="게임 모드" className="grid gap-2.5 pt-6">
          {MODES.map(({ name, description, route }) => {
            if (!route) {
              return (
                <div
                  key={name}
                  className={cn(ITEM, "border-line-soft bg-[#f7f7f1] text-[#748177]")}
                >
                  <ModeLabel name={name} description={description} status="준비 중" />
                </div>
              );
            }
            const isCurrent = route === current;
            return (
              <Link
                key={name}
                to={route}
                onClick={onClose}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  ITEM,
                  isCurrent
                    ? "border-[#9db8a2] bg-forest-soft"
                    : "border-line-soft bg-card hover:border-[#9db8a2]",
                )}
              >
                <ModeLabel
                  name={name}
                  description={description}
                  status={isCurrent ? "플레이 중" : "플레이하기"}
                  active={isCurrent}
                />
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

function ModeLabel({
  name,
  description,
  status,
  active = false,
}: {
  name: string;
  description: string;
  status: string;
  active?: boolean;
}) {
  return (
    <>
      <div className="grid gap-[3px]">
        <strong className={cn("text-[15px] font-bold", active && "text-[#315a40]")}>{name}</strong>
        <span className="text-[11px] text-[#7b897c]">{description}</span>
      </div>
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold",
          active ? "text-[#427656]" : "text-[#91a094]",
        )}
      >
        {status}
      </span>
    </>
  );
}
