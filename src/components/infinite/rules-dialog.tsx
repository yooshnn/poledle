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
          <p>난이도를 골라 문제를 연달아 푼다. 맞힌 문제 수가 점수다.</p>
          <Section title="난이도">
            <Row label="Easy">2 km 블록</Row>
            <Row label="Normal">500 m 칸</Row>
            <Row label="Expert">50 m 칸</Row>
            <Row label="Super Expert">50 m 칸, 지도 단서와 방향 없음</Row>
          </Section>
          <Section title="시간">
            <p>
              3분으로 시작해 한 판 동안 이어지고, 최대 10분까지 늘어난다. 문제를 맞힌 뒤 다음 문제로
              넘어가기 전과 중단한 동안에는 멈춘다.
            </p>
            <p className="mt-1.5">문제마다 처음 한 번씩 시간이 늘어난다.</p>
            <Row label="+30초">번호 앞 두 자리가 같은 칸을 고름</Row>
            <Row label="+30초">번호 다음 두 자리가 같은 칸을 고름</Row>
            <Row label="+30초">문제를 맞힘, 남은 기회 하나당 30초 더</Row>
          </Section>
          <Section title="끝">
            <p>
              시간이 다 되거나 한 문제를 6번 모두 틀리면 끝난다. 포기해도 그때까지 맞힌 수는
              기록된다. 중단한 판은 같은 난이도를 다시 고르면 이어진다.
            </p>
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
      <h3 className="mb-1 text-[12px] font-bold text-ink">{title}</h3>
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
