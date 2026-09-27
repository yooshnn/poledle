import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { INFINITE_TITLE } from "@/domain/infinite";

export function RulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent title={`${INFINITE_TITLE} 규칙`}>
        <DialogTitle>{INFINITE_TITLE} 규칙</DialogTitle>
        <div className="grid gap-4 text-[13px] leading-[1.8] text-body">
          <p>난이도를 선택해 문제를 연달아 푸는 모드입니다.</p>
          <Section title="난이도">
            <Row label="Easy">2 km 블록</Row>
            <Row label="Normal">500 m 칸</Row>
            <Row label="Expert">50 m 칸</Row>
            <Row label="Super Expert">50 m 칸, 힌트 없음</Row>
          </Section>
          <Section title="시간">
            <p>게임을 시작하면 3분이 주어지고, 최대 10분까지 늘어날 수 있습니다.</p>
            <p className="mt-1.5">다음 조건을 달성하면 보너스 시간을 받습니다.</p>
            <Row label="+30초">번호 앞 두 자리가 같은 칸을 고름</Row>
            <Row label="+30초">번호 다음 두 자리가 같은 칸을 고름</Row>
            <Row label="+30초">문제를 맞힘, 남은 기회 하나당 30초 더</Row>
          </Section>
          <Section title="게임 오버">
            <p>시간이 다 되거나 한 문제를 6번 안에 맞히지 못하면 게임이 끝납니다.</p>
          </Section>
        </div>
        <DialogClose render={<Button variant="primary" className="mt-5 justify-center" />}>
          닫기
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-[15px] font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] gap-2">
      <span className="font-semibold whitespace-nowrap text-ink">{label}</span>
      <span>{children}</span>
    </div>
  );
}
