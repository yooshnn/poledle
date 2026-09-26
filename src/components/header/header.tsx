import { CircleQuestionMark, Menu, Settings2, UtilityPole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  streak,
  onOpenHelp,
  onOpenSettings,
  onOpenModes,
}: {
  streak: number;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenModes: () => void;
}) {
  return (
    <header className="flex h-[58px] items-center justify-between border-b border-line bg-bar px-3 2xs:px-[18px] md:h-[78px] md:px-9">
      <div className="flex min-w-0 items-center gap-2.5 md:gap-5">
        <a
          href="/"
          aria-label="전봇들 홈"
          className="flex items-center gap-2 text-xl font-extrabold tracking-[-1px] text-ink-strong md:gap-3 md:text-[23px]"
        >
          <UtilityPole aria-hidden="true" className="size-[27px] stroke-[1.6] md:size-8" />
          전봇들
        </a>
        <div className="grid gap-0.5 border-l border-line pl-2.5 md:gap-[3px] md:pl-[18px]">
          <span className="flex items-center gap-2 text-[8px] tracking-[1px] md:text-[10px] md:tracking-[2px]">
            <span className="size-1.5 rounded-full bg-[#678871]" />
            DAILY
          </span>
          <span
            aria-label={`연속 정답 ${streak}일`}
            className="flex items-baseline gap-1.5 text-[10px] whitespace-nowrap text-[#708074] xs:text-[11px]"
          >
            연속 정답
            <strong className="text-xs text-forest xs:text-[13px]">{streak}일</strong>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 2xs:gap-2 xs:gap-3.5 md:gap-[30px]">
        <Button variant="quiet" onClick={onOpenHelp} aria-label="게임 방법">
          <span className="max-md:hidden">게임 방법</span>
          <CircleQuestionMark aria-hidden="true" />
        </Button>
        <Button variant="quiet" onClick={onOpenSettings} aria-label="설정 열기">
          <span className="max-md:hidden">설정</span>
          <Settings2 aria-hidden="true" />
        </Button>
        <Button variant="icon" onClick={onOpenModes} aria-label="게임 모드 메뉴 열기">
          <Menu aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
